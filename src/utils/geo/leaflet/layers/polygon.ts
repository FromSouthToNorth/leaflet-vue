import L, {
  ImageOverlayOptions,
  LatLngBoundsExpression,
  LatLngExpression,
  LeafletEvent,
  Point,
  Polygon,
  PolylineOptions,
} from 'leaflet';

import { latlngToPoint } from '../util/index';
import { layerMap } from './index';
import { drawAreaLabels } from './label/areaLabel';

function polylineOnAdd(layer: Polygon) {
  layer.on('add', (e: LeafletEvent) => {
    const { clipPath, key } = e.sourceTarget.options;
    if (clipPath && key) {
      e.sourceTarget._path.setAttribute('clip-path', `url(#${key})`);
      drawClipPath(e.sourceTarget);
    }
    drawAreaLabels(layer);
  });
}

export const polygon = (
  latlngs: LatLngExpression[] | LatLngExpression[][],
  options: PolylineOptions,
) => {
  const r = L.polygon(latlngs, options).bindPopup(options.name);
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
