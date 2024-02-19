import * as turf from '@turf/turf';
import { GeoJsonObject } from 'geojson';
import type { LatLngBoundsExpression, MapOptions, TileLayerOptions } from 'leaflet';
import L from 'leaflet';

import { basePoint, layerData, lineData, yhxmcBasePoint, yhxmcData } from '@/data/data';
import { lmxmcData } from '@/data/lmymc';
import { hydrology, line, safetySensor, video, workingFace, yslBasePoint } from '@/data/ysl';
import { behaviorHash } from '@/hooks/web/map/useHash';
import { useMapStore } from '@/store/modules/map';

import { addLayers, initLayerToAdd } from './layers';
import { deviceMarker } from './layers/marker';
import { imageOverlay, polygon, rectangle } from './layers/polygon';
import { polyline } from './layers/polyline';

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

  lineData.map((e) => {
    return addLayers(e as GeoJsonObject, 'geoJSON');
  });

  // const scgline = scgLineData.map((e) => {
  //   return addLayers(e.geoJSON as GeoJsonObject, 'geoJSON');
  // });

  // const _scgmkMarkers: Layer[] = [];
  // for (const _marker of scgmkSafetySensor) {
  //   if (_marker.lat && _marker.lng) {
  //     _scgmkMarkers.push(deviceMarker(_marker));
  //   }
  // }
  // for (const _marker of scgmkBasePoint) {
  //   if (_marker.lat && _marker.lng) {
  //     if (_marker.lat && _marker.lng) {
  //       _scgmkMarkers.push(deviceMarker(_marker));
  //     }
  //   }
  // }

  // addLayers(_scgmkMarkers, 'markercluster');

  const lineLayers = line.map((e) => {
    e.oneway = true;
    return polyline(e.latlngs, e);
  });

  addLayers(lineLayers);

  const workingFaceLayers = workingFace.map((e) => {
    const options = Object.assign({}, e);
    delete options.latlngs;
    options.icon = 'icon-mine';
    return polygon(e.latlngs, options);
  });
  addLayers(workingFaceLayers);

  const safetySensorLayer = [...safetySensor, ...yslBasePoint, ...hydrology, ...video].map((e) => {
    return deviceMarker(e);
  });
  addLayers(safetySensorLayer, 'markercluster');

  const points = lmxmcData.map((e) => {
    return turf.point([e.lng, e.lat]);
  });
  console.log(points);
  // addLayers(points, 'geoJSON');

  // 39.39194/107.06446
  const newPoints = points.map((e) => {
    const options = { pivot: [107.06446, 39.39194] };
    const rotatedPoly = turf.transformRotate(e, 8, options);
    return rotatedPoly;
  });
  console.log(newPoints);

  addLayers(newPoints, 'geoJSON');

  const obj = {
    name: '小小的也很可爱',
    age: 18,
  };

  const url = '/BwGISOneMap/index?name=${name}&age=${age}&id=${id}';
  const href = new URLSearchParams(url);

  Object.keys(obj).forEach((key) => {
    href.set(key, obj[key]);
  });
  console.log(href);

  const url2 = '/BwGISOneMap/index?#{name}&#{age}&#{id}&exs=女';

  const match = url2.replace(/^.*\?/, '');
  const newUrl = url2.match(/^.*\?/)[0];
  const params: string[] = [];
  match.split('&').forEach((param) => {
    console.log(param);
    const p = param.match(/#\{([^}]+)\}/);
    if (p && Array.isArray(p) && p.length > 0 && Object.hasOwnProperty.call(obj, p[1])) {
      params.push(`${p[1]}=${obj[p[1]]}`);
    } else {
      params.push(param);
    }
  });

  console.log(params);

  console.log(newUrl + params.join('&'));

  const numDays = (y, m) => {
    const isLeapYear = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    return [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
  };

  const date = new Date('2024-1');
  const day = numDays(date.getFullYear(), date.getMonth());
  console.log(day);
  return map;
};
