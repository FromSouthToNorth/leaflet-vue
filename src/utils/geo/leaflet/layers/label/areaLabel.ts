import { Polygon, svg } from 'leaflet';

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
  const svg = document.querySelector('svg.leaflet-zoom-animated');
  const width = textWidth(name, 14);
  const p = getAreaLabel(layer, width, 14);
  if (p) {
    classes.forEach((c) => {
      drawAreaLabel(layer, c, p);
    });
  } else {
    const doms: Element[] = [];
    for (const c of classes) {
      const dom = document.querySelector(`.${c}-${id}`);
      if (dom) {
        doms.push(dom);
      }
    }
    doms.forEach((e) => {
      svg?.removeChild(e);
    });
  }
}

export function drawAreaLabel(layer: Polygon, classes: string, p: P) {
  const svg = document.querySelector('svg.leaflet-zoom-animated');
  const { id, name } = layer.options;
  const dom = document.querySelector(`.${classes}-${id}`);
  if (dom) {
    dom.setAttribute('x', p.x);
    dom.setAttribute('y', p.y);
  } else if (!dom) {
    const _text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    _text.setAttribute('id', `${classes}-${id}`);
    _text.setAttribute('class', `${classes} ${classes}-${id}`);
    _text.setAttribute('x', p.x);
    _text.setAttribute('y', p.y);
    const textContent = document.createTextNode(utilDisplayNameForPath(name));
    _text.appendChild(textContent);
    svg.append(_text);
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
