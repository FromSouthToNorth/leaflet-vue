export function utilObjectOmit(obj: any, omitKeys: Array<string>): any {
  return Object.keys(obj).reduce((result: any, key: string) => {
    if (!omitKeys.includes(key)) result[key] = obj[key]; // keep

    return result;
  }, {});
}
