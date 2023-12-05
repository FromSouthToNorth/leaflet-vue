import { resolve } from 'node:path';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import purgeIcons from 'vite-plugin-purge-icons';

import { generateModifyVars } from './src/utils/modifyVars';
import { configSvgIconsPlugin } from './vite/plugins/svgSprite';

const root = process.cwd();
const pathResolve = (pathname: string) => resolve(root, '.', pathname);
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), configSvgIconsPlugin({ isBuild: false }), purgeIcons()],
  resolve: {
    alias: [
      {
        find: 'vue-i18n',
        replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
      },
      // @/xxxx => src/xxxx
      {
        find: /@\//,
        replacement: pathResolve('src') + '/',
      },
      // #/xxxx => types/xxxx
      {
        find: /#\//,
        replacement: pathResolve('types') + '/',
      },
    ],
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: generateModifyVars(),
        javascriptEnabled: true,
      },
    },
  },
});
