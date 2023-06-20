/*
 * @Description:
 * @Author: Five
 * @Date: 2023-06-10 14:21:13
 * @LastEditors: Five
 * @LastEditTime: 2023-06-10 19:09:02
 */
//
/**
 *
 * 编辑器模式
 * @export
 * @enum {number}
 */
export enum EditorMode {
  /**
   * 编辑模式
   */
  EDIT = "edit",
  /**
   * 清洁模式
   */
  CLEAN = "clean",
  /**
   *只读模式
   */
  READONLY = "readonly",
}

//

/**
 *
 * @description 纸张方向
 *
 * @export
 * @enum {number}
 */
export enum PaperDirection {
  /**
   * 垂直
   */
  VERTICAL = "vertical",
  /**
   *水平
   */
  HORIZONTAL = "horizontal",
}

/**
 * @description:
 *
 *
 */
export enum EditorComponent {
  // 组件
  COMPONENT = "component",
  //菜单
  MENU = "menu",
  //主体
  MAIN = "main",
  //页尾
  FOOTER = "footer",
  //上下文菜单
  CONTEXTMENU = "contextmenu",

  POPUP = "popup",
  CATALOG = "catalog",
}

/**
 * @description 页模式
 *
 * @description:
 *
 */
// 页模式
export enum PageMode {
  /** 分页 */
  PAGING = "paging",
  /** 连续 */
  CONTINUITY = "continuity",
}

/**
 * @description: 编辑器文本方向 实验性🧪: 这是一项实验性技术在将其用于生产之前，请仔细检查浏览器兼容性表格。
 * @see ⚠ see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/direction
 * @enum {string}
 *
 * */
export enum EditorDirection {
  /** 文本方向从左向右 */
  LTR = "ltr",
  /** 文本方向从右到左 */
  RTL = "rtl",
  /** 默认值 根据情况继承 <canvas> 元素或者 Document */
  INHERIT = "inherit",
}

/**
 *
 * @description 编辑区域
 * @export tt tring|'页头'|'主体'|'页尾'
 * @enum {string|'页头'|'主体'|'页尾'}
 */
export enum EditorZone {
  /**
   * 页头
   */
  HEADER = "header",

  /**
   * 主体
   */
  MAIN = "main",

  /**
   * 页尾
   */
  FOOTER = "footer",
}
