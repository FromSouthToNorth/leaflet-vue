<template>
  <div>
    <iframe :src="frameSrc" @load="hideLoading"></iframe>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted, ref } from 'vue';

  const emit = defineEmits(['message']);
  defineProps({
    frameSrc: String,
  });
  const loading = ref(true);

  function hideLoading() {
    loading.value = false;
  }

  const messageHandler = (e: MessageEvent) => {
    emit('message', e.data);
  };

  onMounted(() => {
    window.addEventListener('message', messageHandler);
  });

  onUnmounted(() => {
    window.removeEventListener('message', messageHandler);
  });
</script>
