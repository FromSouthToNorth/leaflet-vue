import { GeoJsonObject } from 'geojson';
import type { LatLngBoundsExpression, Layer, MapOptions, TileLayerOptions } from 'leaflet';
import L from 'leaflet';

import {
  basePoint,
  layerData,
  lineData,
  scgmkBasePoint,
  scgmkSafetySensor,
  yhxmcBasePoint,
  yhxmcData,
} from '@/data';
import { behaviorHash } from '@/hooks/web/map/useHash';
import { useMapStore } from '@/store/modules/map';

import { addLayers, imageOverlay, initLayerToAdd, latlng, rectangle } from './layers';
import { deviceMarker, marker } from './layers/marker';

interface tileLayer {
  tileUrl: string;
  options?: TileLayerOptions;
}
const accessToken =
  'pk.eyJ1IjoiaHlzZSIsImEiOiJjbGVwcWg0bDkwZXNlM3pvNXNleWUzcTQ0In0.S3VTf9vqYTAAF725ukcDjQ';
export const tileLayers: Array<tileLayer> = [
  {
    tileUrl:
      'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg?access_token={accessToken}',
    options: {
      accessToken,
    },
  },
  {
    tileUrl:
      'https://api.mapbox.com/styles/v1/openstreetmap/ckasmteyi1tda1ipfis6wqhuq/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    options: {
      accessToken,
    },
  },
];

const mapStore = useMapStore();

export const createMap = (el: any, options: MapOptions) => {
  const map = L.map(el, options);
  tileLayers.forEach(({ tileUrl, options }) => {
    L.tileLayer(tileUrl, options).addTo(map);
  });
  const hash = behaviorHash({ map });
  hash();
  // 不要改变setMap的顺序，后面的步骤依赖此步骤
  mapStore.setMap(map);

  initLayerToAdd();

  yhxmcData.forEach((e) => {
    const key = `yhxmc-rectangle-${e.key}`;
    const r = rectangle(e.latlng as LatLngBoundsExpression, {
      key,
      clipPath: true,
      fill: false,
      weight: 60,
      opacity: 0.4,
    }).bindPopup(`${e.name}`);
    addLayers(r);
    if (e.options.url) {
      addLayers(imageOverlay(e.options.url, e.latlng as LatLngBoundsExpression));
    }
  });

  layerData.forEach((e) => {
    const key = `hlh-rectangle-${e.key}`;
    const r = rectangle(e.latlng as LatLngBoundsExpression, {
      key,
      clipPath: true,
      fill: false,
      weight: 60,
      opacity: 0.4,
    }).bindPopup(`${e.name}`);
    addLayers(r);
    if (e.options.url) {
      addLayers(imageOverlay(e.options.url, e.latlng as LatLngBoundsExpression));
    }
  });

  const markers = [...yhxmcBasePoint, ...basePoint].map((e) => {
    return deviceMarker(e);
  });

  addLayers(markers, 'markercluster');

  const line = lineData.map((e) => {
    return addLayers(e as GeoJsonObject, 'geoJSON');
  });

  const _scgmkMarkers: Layer[] = [];
  for (const _marker of scgmkSafetySensor) {
    if (_marker.lat && _marker.lng) {
      _scgmkMarkers.push(deviceMarker(_marker));
    }
  }
  for (const _marker of scgmkBasePoint) {
    if (_marker.lat && _marker.lng) {
      if (_marker.lat && _marker.lng) {
        _scgmkMarkers.push(deviceMarker(_marker));
      }
    }
  }

  addLayers(_scgmkMarkers, 'markercluster');
  return map;
};
