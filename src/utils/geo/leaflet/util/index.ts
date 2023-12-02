import { geoTransform } from 'd3-geo';
import type { GeometryObject } from 'geojson';
import L, { LatLngBounds, LatLngExpression, Point } from 'leaflet';
import { toRaw } from 'vue';

import { map } from '@/hooks/web/map/useMap';
import { isArray } from '@/utils/is';

export function latlngToPoint(latlng: LatLngExpression): Point {
  return toRaw(map.value).latLngToLayerPoint(latlng);
}

export const latlng = (lat: number, lng: number) => {
  return L.latLng(lat, lng);
};

export function latLngToLayerPoint(latlng: LatLngExpression) {
  return toRaw(map.value).latLngToLayerPoint(latlng);
}

export function pontToLayerLatLng(point: Point | number[]) {
  if (isArray(point)) {
    point = L.point(point[0], point[1]);
  }
  return toRaw(map.value).layerPointToLatLng(point);
}

function projectPoint(this: any, x: number, y: number) {
  const point = latLngToLayerPoint(L.latLng(y, x));
  this.stream.point(point.x, point.y);
}

export const projection = geoTransform({
  point: projectPoint,
});

export function getBounds(): LatLngBounds {
  return toRaw(map.value).getBounds();
}

export function getBbox() {
  const { _northEast, _southWest } = getBounds();
  const southWest = latLngToLayerPoint(_southWest);
  const northEast = latLngToLayerPoint(_northEast);
  const bbox = {
    minX: southWest.x,
    minY: northEast.y,
    maxX: northEast.x,
    maxY: southWest.y,
  };
  return bbox;
}

export function getClipExtent(): [[number, number], [number, number]] {
  const _bbox = getBbox();
  return [
    [_bbox.minX, _bbox.minY],
    [_bbox.maxX, _bbox.maxY],
  ];
}

export function distance(latlng1: LatLngExpression, latlng2: LatLngExpression) {
  return toRaw(map.value).distance(latlng1, latlng2);
}

export function geometryToLayer(geoJSON: GeometryObject) {
  return L.GeoJSON.geometryToLayer(geoJSON);
}

export function geoVecAngle(a: number[], b: number[]): number {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}

export function geoVecLength(a: number[], b: number[]): number {
  return Math.sqrt(geoVecLengthSquare(a, b));
}

export function geoVecLengthSquare(a: number[], b: number[]): number {
  b = b || [0, 0];
  const x = a[0] - b[0];
  const y = a[1] - b[1];
  return x * x + y * y;
}

// vector addition
export function geoVecAdd(a: number[], b: number[]): number[] {
  return [a[0] + b[0], a[1] + b[1]];
}
