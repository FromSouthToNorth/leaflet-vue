import type { BBox } from 'rbush';
import RBush from 'rbush';

import { geoVecLength } from '../../util';

export const _textWidthCache = new Map();
export const _entitybboxes = new Map();
const _rdrawn = new RBush();
const _rskipped = new RBush();

export function clearRBush() {
  _rdrawn.clear();
  _rskipped.clear();
}

export function tryInsert(bboxes: BBox[], id: string, saveSkipped: boolean) {
  let skipped = false;

  for (let i = 0; i < bboxes.length; i++) {
    const bbox = bboxes[i];
    bbox.id = id;

    if (_rdrawn.collides(bbox)) {
      skipped = true;
      break;
    }
  }

  _entitybboxes.set(id, bboxes);

  if (skipped) {
    if (saveSkipped) _rskipped.load(bboxes);
  } else {
    _rdrawn.load(bboxes);
  }

  return !skipped;
}

export function reverse(p: number[][]): boolean {
  const angle = Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]);
  return !(p[0][0] < p[p.length - 1][0] && angle < Math.PI / 2 && angle > -Math.PI / 2);
}

export function subpath(points: number[][], from: number, to: number) {
  let sofar = 0;
  let start, end, i0, i1;

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const current = geoVecLength(a, b);
    let portion;
    if (!start && sofar + current >= from) {
      portion = (from - sofar) / current;
      start = [a[0] + portion * (b[0] - a[0]), a[1] + portion * (b[1] - a[1])];
      i0 = i + 1;
    }
    if (!end && sofar + current >= to) {
      portion = (to - sofar) / current;
      end = [a[0] + portion * (b[0] - a[0]), a[1] + portion * (b[1] - a[1])];
      i1 = i + 1;
    }
    sofar += current;
  }

  const result = points.slice(i0, i1);
  result.unshift(start as number[]);
  result.push(end as number[]);
  return result;
}

export function textWidth(text: string, size: number, elem?: SVGTextContentElement): number {
  let c = _textWidthCache.get(size);
  if (!c) c = _textWidthCache.set(size, {});

  if (c[text]) {
    return c[text];
  } else if (elem) {
    c[text] = elem.getComputedTextLength();
    return c[text];
  } else {
    const str = encodeURIComponent(text).match(/%[CDEFcdef]/g);
    if (str === null) return (size / 3) * 2 * text.length;
    else return (size / 3) * (2 * text.length + str.length);
  }
}
