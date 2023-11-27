import L, { LatLngExpression, Point } from 'leaflet';
import { toRaw } from 'vue';

import { map } from '@/hooks/web/map/useMap';

export function latlngToPoint(latlng: LatLngExpression): Point {
  return toRaw(map.value).latLngToLayerPoint(latlng);
}

export const latlng = (lat: number, lng: number) => {
  return L.latLng(lat, lng);
};
