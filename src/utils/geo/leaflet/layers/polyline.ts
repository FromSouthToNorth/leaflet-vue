import L, { LatLngExpression, PolylineOptions } from 'leaflet';

export const polyline = (
  latlngs: LatLngExpression[] | LatLngExpression[][],
  options: PolylineOptions,
) => {
  return L.polyline(latlngs, options).bindPopup(options.name);
};
