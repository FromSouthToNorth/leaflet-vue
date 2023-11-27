import L, { DivIcon, DivIconOptions, IconOptions, LatLngExpression, MarkerOptions } from 'leaflet';

import baseStation from '@/assets/markerIcon/base-station-fill.svg';
import sensor from '@/assets/markerIcon/tab_oee_sensor.svg';

interface MarkerIconStyle {
  systemId: number;
  divIcon?: DivIcon;
}

export const icon = (options: IconOptions) => {
  return L.icon(options);
};

export const divIcon = (options: DivIconOptions) => {
  return L.divIcon(options);
};

export const markerIconStyle: MarkerIconStyle[] = [
  {
    systemId: 120,
    divIcon: divIcon({
      className: 'sensorPoint',
      html: `<img src="${sensor}">`,
      iconSize: [18, 18],
    }),
  },
  {
    systemId: 140,
    divIcon: divIcon({
      className: 'baseStationPoint',
      html: `<img src="${baseStation}">`,
      iconSize: [18, 18],
    }),
  },
];

export const marker = (latlng: LatLngExpression, options?: MarkerOptions) => {
  return L.marker(latlng, options);
};

interface Device {
  id: string;
  lat: number;
  lng: number;
  deviceId: string;
  systemId: number;
  blockName: string;
  devicePosition: string;
  updateDT?: string;
  mineName?: string;
  realValue?: string;
}

export const deviceMarker = (device: Device) => {
  let icon;
  for (const markerIcon of markerIconStyle) {
    if (device.systemId === markerIcon.systemId) {
      icon = markerIcon.divIcon;
      break;
    }
  }
  const bindTooltip = (device.deviceId += device.realValue ? `  实时值: ${device.realValue}` : '');
  return marker(L.latLng(device.lat, device.lng), {
    key: device.id,
    mineName: device.mineName,
    icon,
  })
    .bindTooltip(bindTooltip, { permanent: true, offset: [8, 0] })
    .bindPopup(device.devicePosition);
};
