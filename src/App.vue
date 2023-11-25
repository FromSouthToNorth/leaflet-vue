<script setup lang="ts">
  import { ConfigProvider } from 'ant-design-vue';
  import { computed } from 'vue';

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
</script>

<template>
  <ConfigProvider :theme="themeConfig">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<style scoped></style>
