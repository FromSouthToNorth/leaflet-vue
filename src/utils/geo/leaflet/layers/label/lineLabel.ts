import * as d3 from 'd3';
import { Polyline } from 'leaflet';
import { toRaw, unref } from 'vue';

import { utilDisplayNameForPath } from '@/utils';

import {
  geoPathLength,
  geoPolygonIntersectsPolygon,
  geoVecInterp,
  geoVecLength,
  getClipExtent,
  latlng,
  latLngToLayerPoint,
} from '../../util';
import { basicsSvgLayers, layerMap } from '../index';
import { reverse, subpath, textWidth, tryInsert } from './index';

const prefix = 'pathText';

const classes: string[][] = [
  ['linelabel-halo', '.labels-group.halo'],
  ['linelabel', '.labels-group.label'],
];

export function lineLabels(layer: Polyline) {
  classes.forEach((e) => {
    drawLineLabels(d3.select(e[1]), layer, prefix, e[0]);
  });
  drawLinePaths(d3.select('svg.layers'), layer, 'pathText');
}

export function lineLabel() {
  layerMap.forEach((value) => {
    value.eachLayer((layer) => {
      if (layer instanceof Polyline && layer.options.name) {
        drawLinePaths(d3.select('svg.layers'), layer, `${prefix}`);
      }
    });
  });
}

export function drawLineLabels(selection: any, layer: Polyline, prefix: string, classes: string) {
  const { id, name } = layer.options;
  const text = d3.select(`.${classes}-${id}`);
  if (!text.empty()) return;
  else {
    selection
      .append('text')
      .attr('class', `${classes}-${id} ${classes}`)
      .append('textPath')
      .attr('class', 'textpath')
      .attr('startOffset', '50%')
      .attr('xlink:href', `#${prefix}-${id}`)
      .text(utilDisplayNameForPath(name));
  }
}

export function drawLinePaths(selection: any, layer: Polyline, prefix: string) {
  const { id, name } = layer.options;
  const width = textWidth(name, 14);
  const p = getLineLabel(layer, width, 14);
  const path = selection.selectAll(`#${prefix}-${id}`).data([layer.options]);
  if (!p) {
    path.remove();
  } else {
    path.exit().remove();
    path
      .enter()
      .append('path')
      .style('stroke-width', 14)
      .attr('id', `${prefix}-${id}`)
      .attr('class', `${prefix}`)
      .merge(path)
      .attr('d', p.lineString);
  }
}

function getLineLabel(layer: Polyline, width: number, height: number) {
  const lineGeoJSON = layer.toGeoJSON();
  const points = lineGeoJSON.geometry.coordinates.map((coord) => {
    const { x, y } = latLngToLayerPoint(latlng(coord[1], coord[0]));
    return [x, y];
  });
  const length = geoPathLength(points);
  if (length < width + 20) return;

  // % along the line to attempt to place the label
  const lineOffsets = [50, 45, 55, 40, 60, 35, 65, 30, 70, 25, 75, 20, 80, 15, 95, 10, 90, 5, 95];
  const padding = 3;
  for (let i = 0; i < lineOffsets.length; i++) {
    const offset = lineOffsets[i];
    const middle = (offset / 100) * length;
    const start = middle - width / 2;

    if (start < 0 || start + width > length) continue;

    let sub = subpath(points, start, start + width);
    if (!sub || !geoPolygonIntersectsPolygon(getClipExtent(), sub, true)) continue;
    if (reverse(sub)) sub = sub.reverse();

    const bboxes = [];
    const boxsize = (height + 2) / 2;
    for (let j = 0; j < sub.length - 1; j++) {
      const a = sub[j];
      const b = sub[j + 1];
      // split up the text into small collision boxes
      const num = Math.max(1, Math.floor(geoVecLength(a, b) / boxsize / 2));

      for (let box = 0; box < num; box++) {
        const p = geoVecInterp(a, b, box / num);
        const x0 = p[0] - boxsize - padding;
        const y0 = p[1] - boxsize - padding;
        const x1 = p[0] + boxsize + padding;
        const y1 = p[1] + boxsize + padding;

        bboxes.push({
          minX: Math.min(x0, x1),
          minY: Math.min(y0, y1),
          maxX: Math.max(x0, x1),
          maxY: Math.max(y0, y1),
        });
      }
    }

    if (tryInsert(bboxes, layer.options.id, false)) {
      // accept this one
      return {
        'font-size': height + 2,
        lineString: lineString(sub),
        startOffset: `${offset}%`,
      };
    }
  }
}

function lineString(points: Array<any>) {
  return `M${points.join('L')}`;
}
