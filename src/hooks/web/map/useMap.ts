import { computed } from 'vue';

import { useMapStore } from '@/store/modules/map';

export const mapStore = useMapStore();

export const map = computed(() => mapStore.getMap);
