/** 判断是否为数组 */
export function isArray<T>(arg: T) {
  return Array.isArray ? Array.isArray(arg) : Object.prototype.toString.call(arg) === "[object Array]"
}

/** 判断是否为字符串 */
export function isString(str: unknown) {
  return typeof str === "string" || str instanceof String
}

const EXTERNAL_LINK_RE = /^(https?:|mailto:|tel:)/

/** 判断是否为外链 */
export function isExternal(path: string) {
  return EXTERNAL_LINK_RE.test(path)
}
