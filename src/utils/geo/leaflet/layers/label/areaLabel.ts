import type { BaseType, Selection } from 'd3';
import * as d3 from 'd3';
import { Polygon } from 'leaflet';

import { utilDisplayNameForPath } from '@/utils';

import { latLngToLayerPoint } from '../../util';
import { layerMap } from '../index';
import { textWidth, tryInsert } from './index';

const classes: string[] = ['arealabel-halo', 'arealabel'];

interface P {
  x: string;
  y: string;
  height: string;
  textAnchor: string;
}

export function areaLabel() {
  layerMap.forEach((value) => {
    value.eachLayer((layer) => {
      if (layer instanceof Polygon) {
        drawAreaLabels(layer);
      }
    });
  });
}

export function drawAreaLabels(layer: Polygon) {
  const { id, name } = layer.options;
  if (!name) return;
  const width = textWidth(name, 14);
  const p = getAreaLabel(layer, width, 14);
  if (p) {
    classes.forEach((c) => {
      drawAreaLabel(layer, c, p);
    });
  } else {
    const doms: Selection<BaseType, unknown, HTMLElement, any>[] = [];
    for (const c of classes) {
      const dom = d3.select(`.${c}-${id}`);
      if (dom) {
        doms.push(dom);
      }
    }
    doms.forEach((e) => {
      e?.remove();
    });
  }
}

export function drawAreaLabel(layer: Polygon, classes: string, p: P) {
  const svg = d3.select('svg.leaflet-zoom-animated');
  const { id, name } = layer.options;
  const dom = d3.select(`.${classes}-${id}`);
  if (!dom.empty()) {
    dom.attr('x', p.x);
    dom.attr('y', p.y);
  } else {
    svg
      .append('text')
      .attr('id', `${classes}-${id}`)
      .attr('class', `${classes} ${classes}-${id}`)
      .attr('x', p.x)
      .attr('y', p.y)
      .text(utilDisplayNameForPath(name));
  }
}

export function getAreaLabel(layer: Polygon, width: number, height: number) {
  const center = layer.getCenter();
  const centroid = latLngToLayerPoint(center);
  const { _northEast, _southWest } = layer.getBounds();
  const northEast = latLngToLayerPoint(_northEast);
  const southWest = latLngToLayerPoint(_southWest);
  const areaWidth = northEast.x - southWest.x;
  if (Number.isNaN(center.lat) || areaWidth < 20) return;

  if (width && areaWidth >= width + 20) {
    const yOffset = 0;
    const padding = 2;
    const p: any = {};
    const labelX = centroid.x;
    const labelY = centroid.y + yOffset;
    const bbox = {
      minX: labelX - width / 2 - padding,
      minY: labelY - height / 2 - padding,
      maxX: labelX + width / 2 + padding,
      maxY: labelY + height / 2 + padding,
    };

    if (tryInsert([bbox], layer.options.id, true)) {
      p.x = labelX;
      p.y = labelY;
      p.textAnchor = 'middle';
      p.height = height;
      return p;
    }
  }
}
