/*
 * @Description: 核心
 * @Author: Five
 * @Date: 2023-06-08 21:27:06
 * @LastEditors: Five
 * @LastEditTime: 2023-06-10 20:46:14
 */
import { nextTick } from "@p-editor/tools"

import {
  EditorMode,
  EditorComponent,
  PaperDirection,
} from "./dataset/enum/Editor";

import DefaultOptions from "./dataset/Options";
import { IEditorData } from "./interface/Editor";
import RenderManager from "./renderManager"
import PluginManager from "./pluginManager"
import { EDITOR_COMPONENT } from "./dataset/constant/Editor";

export class CoreDraw {
  private container: HTMLDivElement;
  //private mode: EditorMode;
  private options: any;
  // private elementList: IElement[];
  private PluginManager: PluginManager;
  private renderManager: RenderManager;

  constructor(rootContainer: HTMLElement,data: IEditorData, options: any) {
    this.options = { ...DefaultOptions,...options};
    this.container = this._wrapContainer(rootContainer);
    this.options._pageWidth = this.getWidth();
    this.options._pageHeight = this.getHeight();
    this.PluginManager = new PluginManager()//插件管理

    this._formatContainer();
    // this.pageContainer = this._createPageContainer();
    // this._createPage(0);
    // this.elementList = data.main
    this.renderManager = new RenderManager(this.container,data, this.options)
    // this.renderManager.render({content: this.elementList,})
    // this.render({ isSetCursor: false })
    
  }

  public getWidth(): number {
    return Math.floor(this.getOriginalWidth() * this.options.scale);
  }
  public getOriginalWidth(): number {
    const { paperDirection, width, height } = this.options;
    return paperDirection === PaperDirection.VERTICAL ? width : height;
  }
  public getHeight(): number {
    return Math.floor(this.getOriginalHeight() * this.options.scale);
  }
  public getOriginalHeight(): number {
    const { paperDirection, width, height } = this.options;
    return paperDirection === PaperDirection.VERTICAL ? height : width;
  }

  /**
   * @description:
   * @return {*}
   * @author: Five
   */

  private _wrapContainer(rootContainer: HTMLElement): HTMLDivElement {
    const container = document.createElement("div");
    rootContainer.append(container);
    return container;
  }

   /**
   * @description:  格式层
   * @return {*}
   * @author: five
   */

   private _formatContainer() {
    // 容器宽度需跟随纸张宽度
    this.container.style.position = "relative";
    this.container.style.width = `${this.options._pageWidth}px`;
    this.container.setAttribute(EDITOR_COMPONENT, EditorComponent.MAIN);
  }
}
