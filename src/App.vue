<script setup lang="ts">
  import { ConfigProvider } from 'ant-design-vue';
  import { computed, onMounted } from 'vue';

  import { AppProvider } from './components/Application';

  const themeConfig = computed(() =>
    Object.assign(
      {
        token: {
          colorPrimary: '#0960bd',
          colorSuccess: '#55D187',
          colorWarning: '#EFBD47',
          colorError: '#ED6F6F',
          colorInfo: '#0960bd',
        },
      },
      {},
    ),
  );
  onMounted(() => {
    if (!document.querySelector('svg.svg-defs')) {
      const app = document.querySelector('#app');
      console.log(app);
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'svg-defs');
      app?.append(svg);
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.append(defs);
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'oneway-marker');
      marker.setAttribute('viewBox', '0 0 10 5');
      marker.setAttribute('refX', '2.5');
      marker.setAttribute('refY', '2.5');
      marker.setAttribute('markerWidth', '2');
      marker.setAttribute('markerHeight', '2');
      marker.setAttribute('orient', 'auto');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'oneway-marker-path');
      path.setAttribute('d', 'M 5,3 L 0,3 L 0,2 L 5,2 L 5,0 L 10,2.5 L 5,5 z');
      path.setAttribute('stroke', 'none');
      path.setAttribute('fill', '#000');
      marker.append(path);
      defs.append(marker);
    }
  });
</script>

<template>
  <ConfigProvider :theme="themeConfig">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<style scoped></style>
