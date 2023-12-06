import type { BaseType, Selection } from 'd3';
import * as d3 from 'd3';
import { Polygon } from 'leaflet';

import { utilDisplayNameForPath } from '@/utils';

import { latLngToLayerPoint } from '../../util';
import { layerMap } from '../index';
import { drawAreaIcons } from './iconLabel';
import { textWidth, tryInsert } from './index';

const classes: string[][] = [
  ['arealabel-halo', 'areaicon-halo'],
  ['arealabel', 'areaicon'],
];

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
      drawAreaLabel(layer, c[0], p);
      drawAreaIcons(p, c[1]);
    });
  } else {
    for (const c of classes) {
      d3.selectAll(`.${c[0]}-${id}`).remove();
      d3.selectAll(`.${c[1]}-${id}`).remove();
    }
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
  const p: any = {};

  const iconSize = 17;
  const padding = 2;
  const { id, icon } = layer.options;
  if (icon) {
    if (addIcon() && addLabel(iconSize + padding)) {
      p.id = id;
      p.icon = icon;
      return p;
    }
  } else {
    if (addLabel(0)) {
      return p;
    }
  }

  function addIcon() {
    const iconX = centroid.x - iconSize / 2;
    const iconY = centroid.y - iconSize / 2;
    const bbox = {
      minX: iconX,
      minY: iconY,
      maxX: iconX + iconSize,
      maxY: iconY + iconSize,
    };

    if (tryInsert([bbox], id + 'I', true)) {
      p.transform = 'translate(' + iconX + ',' + iconY + ')';
      return true;
    }
    return false;
  }

  function addLabel(yOffset: number) {
    if (width && areaWidth >= width + 20) {
      const labelX = centroid.x;
      const labelY = centroid.y + yOffset;
      const bbox = {
        minX: labelX - width / 2 - padding,
        minY: labelY - height / 2 - padding,
        maxX: labelX + width / 2 + padding,
        maxY: labelY + height / 2 + padding,
      };

      if (tryInsert([bbox], id, true)) {
        p.x = labelX;
        p.y = labelY;
        p.textAnchor = 'middle';
        p.height = height;
        return true;
      }
    }
    return false;
  }
}
