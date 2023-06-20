/*
 * @Description: 
 * @Author: Five
 * @Date: 2023-06-10 19:37:28
 * @LastEditors: Five
 * @LastEditTime: 2023-06-10 20:12:20
 */
import { noop , isIOS , isAndroid , handleError,} from "./base"
import * as BaseType from "./type"
import {isArray,isString,isBoolean,isFunction ,isObject} from "./type"
import { nextTick } from "./nextTick"

export {
    noop, BaseType, isIOS , isAndroid, handleError,nextTick,isArray,isString,isBoolean,isFunction ,isObject
}