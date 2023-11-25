import type { MapOptions, TileLayerOptions } from 'leaflet';
import L from 'leaflet';

import { behaviorHash } from '@/hooks/web/map/useHash';
import { useMapStore } from '@/store/modules/map';

import { initLayerToAdd } from './leyers';

interface tileLayer {
  tileUrl: string;
  options?: TileLayerOptions;
}
const accessToken =
  'pk.eyJ1IjoiaHlzZSIsImEiOiJjbGVwcWg0bDkwZXNlM3pvNXNleWUzcTQ0In0.S3VTf9vqYTAAF725ukcDjQ';
const tileLayers: Array<tileLayer> = [
  {
    tileUrl:
      'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg?access_token={accessToken}',
    options: {
      accessToken,
    },
  },
  {
    tileUrl:
      'https://api.mapbox.com/styles/v1/openstreetmap/ckasmteyi1tda1ipfis6wqhuq/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    options: {
      accessToken,
    },
  },
];

const mapStore = useMapStore();

export const createMap = (el: any, options: MapOptions) => {
  const map = L.map(el, options);
  tileLayers.forEach(({ tileUrl, options }) => {
    L.tileLayer(tileUrl, options).addTo(map);
  });
  const hash = behaviorHash({ map });
  hash();
  // 不要改变setMap的顺序，后面的步骤依赖此步骤
  mapStore.setMap(map);

  initLayerToAdd();
  return map;
};
