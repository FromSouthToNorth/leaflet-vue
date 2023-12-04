import type { App, Component } from 'vue';

import { utilDetect } from './detect';
import { fixRTLTextForSvg, rtlRegex } from './svgPathsRtlFIx';

// https://github.com/vant-ui/vant/issues/8302
type EventShim = {
  new (...args: any[]): {
    $props: {
      onClick?: (...args: any[]) => void;
    };
  };
};

export type WithInstall<T> = T & {
  install(app: App): void;
} & EventShim;
export type CustomComponent = Component & { displayName?: string };

export const withInstall = <T extends CustomComponent>(component: T, alias?: string) => {
  (component as Record<string, unknown>).install = (app: App) => {
    const compName = component.name || component.displayName;
    if (!compName) return;
    app.component(compName, component);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component as WithInstall<T>;
};

export function utilQsString(obj: any, noencode: boolean): string {
  // encode everything except special characters used in certain hash parameters:
  // "/" in map states, ":", ",", {" and "}" in background
  function softEncode(s: string) {
    return encodeURIComponent(s).replace(/(%2F|%3A|%2C|%7B|%7D)/g, decodeURIComponent);
  }

  return Object.keys(obj)
    .sort()
    .map((key) => {
      return `${encodeURIComponent(key)}=${
        noencode ? softEncode(obj[key]) : encodeURIComponent(obj[key])
      }`;
    })
    .join('&');
}

export function utilStringQs(str: string): any {
  let i = 0;
  while (i < str.length && (str[i] === '?' || str[i] === '#')) i++;
  str = str.slice(i);

  return str.split('&').reduce((obj: any, pair: string) => {
    const parts = pair.split('=');
    if (parts.length === 2) obj[parts[0]] = parts[1] === null ? '' : decodeURIComponent(parts[1]);

    return obj;
  }, {});
}

export function utilDisplayNameForPath(name: string): string {
  const isFirefox = utilDetect().browser.toLowerCase().includes('firefox');
  const isNewChromium = Number(utilDetect().version.split('.')[0]) >= 96.0;
  if (isFirefox && !isNewChromium && name && rtlRegex.test(name)) name = fixRTLTextForSvg(name);

  return name;
}
