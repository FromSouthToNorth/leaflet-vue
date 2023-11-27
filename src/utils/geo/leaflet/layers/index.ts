import 'leaflet.markercluster';

import type { GeoJsonObject } from 'geojson';
import L, { FeatureGroup, GeoJSON, Layer, LayerGroup } from 'leaflet';
import { toRaw } from 'vue';

import { map } from '@/hooks/web/map/useMap';
import { isArray } from '@/utils/is';

import { binClipPath } from './polygon';

export const layerGroup = L.layerGroup();

export const featureGroup = L.featureGroup();

export const geoJSON = L.geoJSON();

export const markercluster = L.markerClusterGroup();

export const layerMap = new Map<string, LayerGroup | GeoJSON | FeatureGroup>();

layerMap.set('layerGroup', layerGroup);
layerMap.set('featureGroup', featureGroup);
layerMap.set('geoJSON', geoJSON);
layerMap.set('markercluster', markercluster);

export function initLayerToAdd() {
  const _map = toRaw(map.value);
  layerMap.forEach((value) => {
    value.addTo(_map);
  });
  _map.on('moveend', binClipPath);
}

export function addLayers(layers: Layer | Layer[] | GeoJsonObject | GeoJsonObject[], key?: string) {
  key = key ? key : 'featureGroup';
  const group = layerMap.get(key);
  if (!group) console.error(`layerMap do not ${key} Layer`);
  if (isArray(layers) && group instanceof GeoJSON) {
    layers.forEach((layer) => {
      group.addData(layer as GeoJsonObject);
    });
  } else if (isArray(layers) && group instanceof Layer) {
    layers.forEach((layer) => {
      group.addLayer(layer as Layer);
    });
  } else if (group instanceof GeoJSON) {
    group.addData(layers as GeoJsonObject);
  } else if (group instanceof Layer) {
    group?.addLayer(layers as Layer);
  }
}

export function clearLayers(layers?: Layer | Layer[]) {
  if (isArray(layers)) {
    layers.forEach((layer) => {
      layerMap.forEach((value) => {
        if (value.hasLayer(layer)) {
          value.removeLayer(layer);
        }
      });
    });
  } else if (layers) {
    layerMap.forEach((value) => {
      if (value.hasLayer(layers)) {
        value.removeLayer(layers);
      }
    });
  }
}

export function clearKeysLayers(keys?: string | string[]) {
  if (isArray(keys)) {
    keys.forEach((key) => {
      if (layerMap.has(key)) {
        layerMap.get(key)?.clearLayers();
      }
    });
  } else if (keys) {
    if (layerMap.has(keys)) {
      layerMap.get(keys)?.clearLayers();
    }
  } else {
    layerMap.forEach((value) => {
      value.clearLayers();
    });
  }
}
