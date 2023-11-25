import { LAYOUT } from '../constant';
import type { AppRouteRecordRaw } from '../types';

export const REDIRECT_ROUTE: AppRouteRecordRaw = {
  path: '/',
  component: LAYOUT,
  redirect: '/OneMap',
  name: 'Root',
  meta: {
    title: 'Root',
  },
  children: [
    {
      path: '/OneMap',
      name: 'Map',
      component: () => import('@/views/map/index.vue'),
      meta: {
        title: '地图',
      },
    },
  ],
};

export const basicRoutes = [REDIRECT_ROUTE];
