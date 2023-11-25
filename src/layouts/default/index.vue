<template>
  <Layout>
    <LayoutContent />
  </Layout>
</template>
<script lang="ts" setup>
  import { Layout } from 'ant-design-vue';

  import LayoutContent from './content/index.vue';

  defineOptions({ name: 'DefaultLayout' });
</script>
