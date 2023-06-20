/*
 * @Description: 
 * @Author: Five
 * @Date: 2023-06-10 19:52:42
 * @LastEditors: Five
 * @LastEditTime: 2023-06-10 20:12:01
 */


/**
 * @description: 定义一个空函数 no-op
 * @return {*}
 * @author: Five
 */
export function noop(): void {}

/**
 * @description: 判断当前环境是否是 iOS，可以根据具体情况实现
 * @return {*}
 * @author: Five
 */
export const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod|ios/i.test(navigator.userAgent)

// 判断当前浏览器是否是 IE，可以根据具体情况实现
//export const isIE = typeof document !== 'undefined' && /msie|trident/.test(document.documentMode)

/**
 * @description: 判断当前环境是否是 isAndroid 可以根据具体情况实现
 * @return {*}
 * @author: Five
 */
export const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)


/**
 * @description: 处理错误信息的方法，可以根据具体情况实现
 * @return {*}
 * @author: Five
 */
export function handleError(error: Error, vm: Record<string, unknown> | undefined, info: string): void {
  if (vm) {
    // do something
  } else {
    console.error(`Error in ${info}: "${error.toString()}"`, error)
  }
}