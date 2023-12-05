import 'ant-design-vue/dist/reset.css';
import '@/design/index.less';
import 'virtual:svg-icons-register';

import { createApp } from 'vue';

import { setupRouter } from '@/router';

import App from './App.vue';
import { setupStore } from './store';

async function bootstrap() {
  const app = createApp(App);

  setupStore(app);

  setupRouter(app);

  app.mount('#app');
}
bootstrap();
