import type { Map } from 'leaflet';
import { defineStore } from 'pinia';

import { store } from '@/store';

export const useMapStore = defineStore({
  id: 'map',
  state: () => ({
    map: {},
  }),
  getters: {
    getMap(state): Map {
      return state.map;
    },
  },
  actions: {
    setMap(map: Map): void {
      this.map = map;
    },
  },
});

// Need to be used outside the setup
export function useMapStoreWithOut() {
  return useMapStore(store);
}
