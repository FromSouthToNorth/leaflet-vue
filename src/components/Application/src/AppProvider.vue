<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'AppProvider',
    inheritAttrs: false,
    setup(props, { slots }) {
      console.log('AppProvider props: ', props);
      return () => slots.default?.();
    },
  });
</script>
