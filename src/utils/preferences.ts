// https://github.com/openstreetmap/iD/issues/772
// http://mathiasbynens.be/notes/localstorage-pattern#comment-9
let _storage: any;
try {
  _storage = localStorage;
} catch (e) {
  console.error('preferences: ', e);
}
_storage =
  _storage ||
  (() => {
    const s: any = {};
    return {
      getItem: (k: string | number) => s[k],
      setItem: (k: string, v: any) => (s[k] = v),
      removeItem: (k: string) => delete s[k],
    };
  })();

const _listeners: any = {};

//
// corePreferences is an interface for persisting basic key-value strings
// within and between iD sessions on the same site.
//
/**
 * @param {string} k
 * @param {string?} v
 * @returns {boolean} true if the action succeeded
 */
function preferences(k: string, v?: any) {
  try {
    if (v === undefined) return _storage.getItem(k);
    else if (v === null) _storage.removeItem(k);
    else _storage.setItem(k, v);
    if (_listeners[k]) _listeners[k].forEach((handler: any) => handler(v));

    return true;
  } catch (e) {
    if (typeof console !== 'undefined') console.error('localStorage quota exceeded');

    // eslint-enable no-console
    return false;
  }
}

// adds an event listener which is triggered whenever
preferences.onChange = function (k: string, handler: any) {
  _listeners[k] = _listeners[k] || [];
  _listeners[k].push(handler);
};

export { preferences as prefs };
