import 'leaflet.markercluster';

import type { GeoJsonObject } from 'geojson';
import L, {
  FeatureGroup,
  GeoJSON,
  ImageOverlayOptions,
  LatLngBoundsExpression,
  LatLngExpression,
  Layer,
  LayerGroup,
  LeafletEvent,
  Point,
  Polygon,
  PolylineOptions,
} from 'leaflet';
import { toRaw } from 'vue';

import { map } from '@/hooks/web/map/useMap';
import { isArray } from '@/utils/is';

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

function polylineOnAdd(layer: Polygon) {
  layer.on('add', (e: LeafletEvent) => {
    const { clipPath, key } = e.sourceTarget.options;
    if (clipPath && key) {
      e.sourceTarget._path.setAttribute('clip-path', `url(#${key})`);
      drawClipPath(e.sourceTarget);
    }
  });
}

export const polyline = (
  latlngs: LatLngExpression[] | LatLngExpression[][],
  options?: PolylineOptions,
) => {
  return L.polyline(latlngs, options);
};

export const polygon = (
  latlngs: LatLngExpression[] | LatLngExpression[][],
  options?: PolylineOptions,
) => {
  const r = L.polygon(latlngs, options);
  polylineOnAdd(r);
  return r;
};

export const rectangle = (latlngs: LatLngBoundsExpression, options?: PolylineOptions) => {
  const r = L.rectangle(latlngs, options);
  polylineOnAdd(r);
  return r;
};

export const imageOverlay = (
  imageUrl: string,
  imageBounds: LatLngBoundsExpression,
  options?: ImageOverlayOptions,
) => {
  return L.imageOverlay(imageUrl, imageBounds, options);
};

export const latlng = (lat: number, lng: number) => {
  return L.latLng(lat, lng);
};

export function latlngToPoint(latlng: LatLngExpression): Point {
  return toRaw(map.value).latLngToLayerPoint(latlng);
}

export function latlngsToPath(latlngs: LatLngExpression[]) {
  const points: Point[] = latlngs.map((latlng: LatLngExpression) => {
    return latlngToPoint(latlng);
  });
  let point: Point;
  let str: string = '';
  const length = points.length;
  for (let i = 0; i < length; i++) {
    point = points[i];
    str += `${(i ? 'L' : 'M') + point.x} ${point.y}`;
    if (i === length - 1) str += 'z';
  }
  return str;
}

export function drawClipPath(layer: Polygon) {
  const { key } = layer.options;
  if (!key) return;
  const _clipPath = document.querySelector(`#${key} path`);
  const svg = document.querySelector('svg.leaflet-zoom-animated');
  const d = latlngsToPath(layer.getLatLngs()[0] as LatLngExpression[]);
  if (_clipPath) {
    _clipPath.setAttribute('d', d);
  } else {
    const _clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    const _path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    _clipPath.setAttribute('id', `${key}`);
    _path.setAttribute('d', d);
    _clipPath.append(_path);
    svg.append(_clipPath);
  }
}

export function binClipPath() {
  const svg = document.querySelector('svg.leaflet-zoom-animated');
  layerMap.forEach((value) => {
    value.eachLayer((e) => {
      if (svg && e.options.clipPath) {
        drawClipPath(e as Polygon);
      }
    });
  });
}
