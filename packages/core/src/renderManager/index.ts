import {
    EditorMode,
    PaperDirection,
    EditorComponent,
    EditorDirection
  } from "../dataset/enum/Editor";
  import { EDITOR_COMPONENT, EDITOR_PREFIX } from "../dataset/constant/Editor";
  import { IEditorData, IMargin } from "../interface/Editor";
import { IElement } from "../interface/Element";
import { Margin } from "../draw/Margin";


interface RenderProps {
    content: string;
    pageWidth: number;
    pageHeight: number;
  }
export default class RenderManager{

    private totalPages: number = 0;
    private container: HTMLDivElement;
    private options: any;
    private pageContainer: HTMLDivElement;
    private pageList: HTMLCanvasElement[];
    private ctxList: CanvasRenderingContext2D[];
    private elementList: IElement[];
    private pageNo: number;
    private margin: Margin;
 
    constructor(container: HTMLDivElement,data: IEditorData, options: any) {
        this.container = container;
        this.options = options;
        this.pageContainer = this._createPageContainer()
        this.pageList = [];
        this.ctxList = [];
        this.pageNo = 0;
        this.elementList = data.main
        this._createPage(0)
        this.margin = new Margin(this)
    
        //this.render({content: data.main[0]?.value,pageWidth: this.options._pageWidth,pageHeight:this.options._pageHeight})
    }

  public render(props:RenderProps){

   const { content, pageWidth, pageHeight } = props;
    const lines = content.split('\n');
    const numLines = lines.length;
    const lineHeight = 20; // 以像素为单位

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    this.pageContainer.append(canvas);
    if (!ctx) {
      throw new Error('Unable to create 2D context for canvas');
    }

    canvas.width = pageWidth;
    canvas.height = pageHeight;

    ctx.font = '14px Arial';

    let currLine = 0;
    let currPage = 1;

    while (currLine < numLines) {
      let y = 0;

      for (; currLine < numLines && y + lineHeight <= pageHeight; currLine++) {
        const line = lines[currLine];
        const measuredWidth = ctx.measureText(line).width;

        if (measuredWidth > pageWidth) {
          // 如果这一行超过页面宽度，则将其拆分成多个行
          const words = line.split(' ');
          let currentLine = '';

          for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + ' ';
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth > pageWidth) {
              this.drawPage(canvas, currPage, currentLine, y);
              y += lineHeight;
              currentLine = words[i] + ' ';
            } else {
              currentLine = testLine;
            }
          }

          this.drawPage(canvas, currPage, currentLine, y);
          y += lineHeight;
        } else {
          this.drawPage(canvas, currPage, line, y);
          y += lineHeight;
        }
      }

      currPage++;
    }

    this.totalPages = currPage - 1;

    // 在此处插入将canvas放到DOM中的代码
  }


  
  public getOptions(): any {
    return this.options
  }
  public getInnerWidth(): number {
    const width = this.options._pageWidth;
    const margins = this.getMargins()
    return width - margins[1] - margins[3]
  }

  public getMargins(): IMargin {
    return <IMargin>this.getOriginalMargins().map(m => m * this.options.scale)
  }

  public getOriginalMargins(): number[] {
    const { margins, paperDirection } = this.options
    return paperDirection === PaperDirection.VERTICAL
      ? margins
      : [margins[1], margins[2], margins[3], margins[0]]
  }

  /**
   * @description:  获取页面间隙
   * @return { number }
   * @author: Five
   */

  public getPageGap(): number {
    return this.options.pageGap * this.options.scale;
  }


  /**
   * @description: 创建内容页容器
   * @return {*}
   * @author: Five
   */

  private _createPageContainer(): HTMLDivElement {
    const pageContainer = document.createElement("div");
    pageContainer.classList.add(`${EDITOR_PREFIX}-page-container`);
    this.container.append(pageContainer);
    return pageContainer;
  }

  /**
   * @description: 创建内容页
   * @param {number} pageNo
   * @return {*}
   * @author: Five
   */

  private _createPage(pageNo: number) {
    const width = this.options._pageWidth;
    const height = this.options._pageHeight;
    const canvas = document.createElement("canvas");
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.display = "block";
    canvas.style.backgroundColor = "#fafafa";
    canvas.style.marginBottom = `${this.getPageGap()}px`;
    canvas.setAttribute("data-index", String(pageNo));
    this.pageContainer.append(canvas);
    // 调整分辨率
    const dpr = window.devicePixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.cursor = "text";
    const ctx = canvas.getContext("2d")!;
    // 初始化上下文配置
    this._initPageContext(ctx);
    // 缓存上下文
    this.pageList.push(canvas);
    this.ctxList.push(ctx);
  }

  private _initPageContext(ctx: CanvasRenderingContext2D) {
    const dpr = window.devicePixelRatio
    ctx.scale(dpr, dpr)
    // 重置以下属性是因部分浏览器(chrome)会应用css样式
    
    // ctx.letterSpacing = '0px'
    // ctx.wordSpacing = '0px'
    ctx.direction = this.options.direction ||EditorDirection.LTR
  }

  private drawPage(canvas: HTMLCanvasElement, pageNum: number, content: string, yPos: number) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to create 2D context for canvas');
    }

    ctx.fillText(`Page ${pageNum}`, 10, yPos + 20);
    ctx.fillText(content, 10, yPos + 40);
  }

  public getTotalPages() {
    return this.totalPages;
  }
}