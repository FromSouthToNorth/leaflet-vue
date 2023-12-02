import { geoIdentity, geoStream } from 'd3-geo';
import L, { LatLngExpression, LeafletEvent, Polyline, PolylineOptions } from 'leaflet';

import { geoVecAdd, geoVecAngle, geoVecLength, getClipExtent, projection } from '../util';
import { layerMap } from './index';

function polylineOnAdd(layer: Polyline) {
  layer.on('add', (e: LeafletEvent) => {
    const { oneway, key } = e.sourceTarget.options;
    if (oneway && key) {
      e.sourceTarget._path.setAttribute('clip-path', `url(#${key})`);
      markerSegments(e.sourceTarget, 26);
    }
  });
}

export const polyline = (
  latlngs: LatLngExpression[] | LatLngExpression[][],
  options: PolylineOptions,
) => {
  options.key = `polyline-${options.id}`;
  const line = L.polyline(latlngs, options).bindPopup(options.name);
  polylineOnAdd(line);
  return line;
};

export interface Segments {
  d: string;
  id: string;
  index: number;
}

export function binOnewayPath() {
  const svg = document.querySelector('svg.leaflet-zoom-animated');
  const _paths = document.querySelectorAll('.oneway');
  _paths.forEach((e) => {
    svg?.removeChild(e);
  });
  layerMap.forEach((value) => {
    value.eachLayer((e) => {
      if (svg && e.options.oneway) {
        markerSegments(e as Polyline, 26);
      }
    });
  });
}

export function markerSegments(layer: Polyline, dt: number) {
  const { key } = layer.options;
  let i = 0;
  let offset = dt;
  const segments: Segments[] = [];
  const clip = geoIdentity().clipExtent(getClipExtent()).stream;
  const lineGeoJSON = layer.toGeoJSON();
  const { geometry } = lineGeoJSON;
  let a: number[] | null, b: number[] | null;

  geoStream(
    geometry,
    projection.stream(
      clip({
        polygonEnd() {},
        polygonStart() {},
        lineStart() {},
        lineEnd() {
          a = null;
        },
        point(x: number, y: number) {
          b = [x, y];

          if (a) {
            let span = geoVecLength(a, b) - offset;
            if (span >= 0) {
              const heading = geoVecAngle(a, b);
              const dx = dt * Math.cos(heading);
              const dy = dt * Math.sin(heading);
              let p = [a[0] + offset * Math.cos(heading), a[1] + offset * Math.sin(heading)];

              // gather coordinates
              const coord: number[][] = [a, p];
              for (span -= dt; span >= 0; span -= dt) {
                p = geoVecAdd(p, [dx, dy]);
                coord.push(p);
              }
              coord.push(b);

              // generate svg paths
              let segment = '';
              let j;
              for (j = 0; j < coord.length; j++)
                segment += `${(j === 0 ? 'M' : 'L') + coord[j][0]},${coord[j][1]}`;
              segments.push({ id: key, index: i++, d: segment });
            }
            offset = -span;
          }

          a = b;
        },
      }),
    ),
  );
  const svg = document.querySelector('svg.leaflet-zoom-animated');

  if (segments.length) {
    for (const { id, index, d } of segments) {
      const _path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      _path.setAttribute('marker-mid', 'url(#oneway-marker)');
      _path.setAttribute('class', `oneway ${id}-${index}`);
      _path.setAttribute('d', d);
      svg?.append(_path);
    }
  }
}
