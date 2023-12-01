import { geoTransform } from 'd3-geo';
import type { GeometryObject } from 'geojson';
import L, { LatLngBounds, LatLngExpression, Point } from 'leaflet';
import { toRaw } from 'vue';

import { map } from '@/hooks/web/map/useMap';

const _map = toRaw(map.value);

export function latlngToPoint(latlng: LatLngExpression): Point {
  return _map.latLngToLayerPoint(latlng);
}

export const latlng = (lat: number, lng: number) => {
  return L.latLng(lat, lng);
};

export function latLngToLayerPoint(latlng: LatLngExpression) {
  return _map.latLngToLayerPoint(latlng);
}

function projectPoint(lat: number, lng: number) {
  const point = _map.latLngToLayerPoint(L.latLng(lat, lng));
  this.stream.point(point.x, point.y);
}

export const projection = geoTransform({
  point: projectPoint,
});

export function getBounds(): LatLngBounds {
  return _map.getBounds();
}

export function getBbox() {
  const { getNorthEast, getSouthWest } = getBounds();
  const southWest = latLngToLayerPoint(getNorthEast());
  const northEast = latLngToLayerPoint(getSouthWest());
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

export function geometryToLayer(geoJSON: GeometryObject) {
  return L.GeoJSON.geometryToLayer(geoJSON);
}

export function geoVecAngle(a: number[], b: number[]): number {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}
