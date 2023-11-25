<template>
  <div class="LayoutContent">
    <div>
      <PageLayout />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import PageLayout from '../pages/index.vue';

  defineOptions({ name: 'LayoutContent' });
</script>
