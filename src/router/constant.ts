export const PARENT_LAYOUT_NAME = 'ParentLayout';

/**
 * @description: default layout
 */
export const LAYOUT = () => import('@/layouts/default/index.vue');
/**
 * @description: parent-layout
 */
export const getParentLayout = (_name?: string) => {
  return () =>
    new Promise((resolve) => {
      resolve({
        name: _name || PARENT_LAYOUT_NAME,
      });
    });
};
