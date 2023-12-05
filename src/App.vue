<script setup lang="ts">
  import { ConfigProvider } from 'ant-design-vue';
  import { computed, onMounted } from 'vue';

  import { AppProvider } from './components/Application';
  import { drawDefs } from './utils/svg/svgDefs';

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
    drawDefs();
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
