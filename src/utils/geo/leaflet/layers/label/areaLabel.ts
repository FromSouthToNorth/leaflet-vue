import { Polygon } from 'leaflet';

import { utilDisplayNameForPath } from '@/utils';

import { latLngToLayerPoint } from '../../util';
import { layerMap } from '../index';
import { textWidth, tryInsert } from './index';

export function areaLabel() {
  layerMap.forEach((value) => {
    value.eachLayer((layer) => {
      if (layer instanceof Polygon && layer.options.name) {
        drawAreaLabels(layer, 'arealabel');
        drawAreaLabels(layer, 'arealabel-halo');
      }
    });
  });
}

export function drawAreaLabels(layer: Polygon, classes: string) {
  const svg = document.querySelector('svg.leaflet-zoom-animated');

  const { id, name } = layer.options;
  const dom = document.querySelector(`.${classes}-${id}`);
  const height = 14;
  if (!name) return;
  const width = textWidth(name, height);
  const p = getPointLabel(layer, width, height);
  if (p && dom) {
    dom.setAttribute('x', p.x);
    dom.setAttribute('y', p.y);
  } else if (p && !dom) {
    const _text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    _text.setAttribute('id', `${classes}-${id}`);
    _text.setAttribute('class', `${classes} ${classes}-${id}`);
    _text.setAttribute('x', p.x);
    _text.setAttribute('y', p.y);
    const textContent = document.createTextNode(utilDisplayNameForPath(name));
    _text.appendChild(textContent);
    svg.append(_text);
  } else if (!p && dom) {
    svg.removeChild(dom);
  }
}

function getPointLabel(layer: Polygon, width: number, height: number) {
  const { id } = layer.options;

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

    if (tryInsert([bbox], id, true)) {
      p.x = labelX;
      p.y = labelY;
      p.textAnchor = 'middle';
      p.height = height;
      return p;
    }
  }
}
