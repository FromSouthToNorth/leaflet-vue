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

export function geoPathLength(path: number[][]): number {
  let length = 0;
  for (let i = 0; i < path.length - 1; i++) length += geoVecLength(path[i], path[i + 1]);

  return length;
}

export function geoPolygonIntersectsPolygon(
  outer: number[][],
  inner: number[][],
  checkSegments: boolean,
): boolean {
  function testPoints(outer: number[], inner: number[]) {
    return inner.some((point) => {
      return geoPointInPolygon(point, outer);
    });
  }
  return testPoints(outer, inner) || (!!checkSegments && geoPathHasIntersections(outer, inner));
}

// Return whether point is contained in polygon.
//
// `point` should be a 2-item array of coordinates.
// `polygon` should be an array of 2-item arrays of coordinates.
//
// From https://github.com/substack/point-in-polygon.
// ray-casting algorithm based on
// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
//
export function geoPointInPolygon(point: number[], polygon: number[][]): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

export function geoPathHasIntersections(path1: number[], path2: number[]): boolean {
  for (let i = 0; i < path1.length - 1; i++) {
    for (let j = 0; j < path2.length - 1; j++) {
      const a = [path1[i], path1[i + 1]];
      const b = [path2[j], path2[j + 1]];
      const hit = geoLineIntersection(a, b);
      if (hit) return true;
    }
  }
  return false;
}

// Return the intersection point of 2 line segments.
// From https://github.com/pgkelley4/line-segments-intersect
// This uses the vector cross product approach described below:
//  http://stackoverflow.com/a/565282/786339
export function geoLineIntersection(a: number[][], b: number[][]) {
  const p = [a[0][0], a[0][1]];
  const p2 = [a[1][0], a[1][1]];
  const q = [b[0][0], b[0][1]];
  const q2 = [b[1][0], b[1][1]];
  const r = geoVecSubtract(p2, p);
  const s = geoVecSubtract(q2, q);
  const uNumerator = geoVecCross(geoVecSubtract(q, p), r);
  const denominator = geoVecCross(r, s);

  if (uNumerator && denominator) {
    const u = uNumerator / denominator;
    const t = geoVecCross(geoVecSubtract(q, p), s) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return geoVecInterp(p, p2, t);
  }

  return null;
}

// vector subtraction
export function geoVecSubtract(a: Array<number>, b: Array<number>) {
  return [a[0] - b[0], a[1] - b[1]];
}

// 2D cross product of OA and OB vectors, returns magnitude of Z vector
// Returns a positive value, if OAB makes a counter-clockwise turn,
// negative for clockwise turn, and zero if the points are collinear.
export function geoVecCross(a: Array<number>, b: Array<number>, origin?: Array<number>) {
  origin = origin || [0, 0];
  const p = geoVecSubtract(a, origin);
  const q = geoVecSubtract(b, origin);
  return p[0] * q[1] - p[1] * q[0];
}

// linear interpolation
export function geoVecInterp(a: Array<number>, b: Array<number>, t: number) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
