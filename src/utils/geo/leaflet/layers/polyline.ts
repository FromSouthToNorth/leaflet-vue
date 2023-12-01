import { geoIdentity, geoStream } from 'd3-geo';
import type { LineString } from 'geojson';
import L, { LatLngExpression, Polyline, PolylineOptions } from 'leaflet';

import { getClipExtent, projection } from '../util';

export const polyline = (
  latlngs: LatLngExpression[] | LatLngExpression[][],
  options: PolylineOptions,
) => {
  return L.polyline(latlngs, options).bindPopup(options.name);
};

export interface Segments {
  d: string;
  id: string;
  index: number;
}

export function markerSegments(dt: number) {
  return function (layer: LineString | Polyline) {
    const i = 0;
    const offset = dt;
    const segments = [];
    const clip = geoIdentity().clipExtent(getClipExtent()).stream;
    const geoJSON: LineString = layer instanceof Polyline ? layer.toGeoJSON() : layer;
    const coordinates = [...geoJSON.coordinates];
    let a: number[] | null, b: number[] | null;
    geoStream({
      type: 'LineString',
      coordinates,
    },projection.stream(clip({}));
  };
}
