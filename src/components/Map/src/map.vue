<template>
  <div id="map-container" ref="mapContainer"></div>
</template>

<script lang="ts" setup>
  import type { Map } from 'leaflet';
  import { onMounted, ref } from 'vue';

  import { createMap } from '@/utils/geo/leaflet';

  defineOptions({ name: 'Map' });
  const mapContainer = ref(null);
  const map = ref<Map>();

  onMounted(async () => {
    map.value = createMap(mapContainer.value, {
      zoom: 6,
      center: [0, 0],
      minZoom: 3,
      maxZoom: 26,
    });
  });
</script>
