/*
 * @Description: 
 * @Author: Five
 * @Date: 2023-06-11 09:16:11
 * @LastEditors: Five
 * @LastEditTime: 2023-06-11 09:25:48
 */
import './style.css'


// import { PEditor } from "canves-page"
//   // 1. 初始化编辑器
//   const container = document.getElementById('p-editorID')! as HTMLDivElement
//   const pEditor = new PEditor(container , {   main: [{
//     value: "Hello World Five 捏好的啊大大爱说大话妇科专科在\nasd asd 数据库的贺卡上大家撒谎大家阿萨的阿萨\n"
//   }] } ,  {})

export const ZERO = '\u200B'
export const WRAP = '\n'
export enum KeyMap {
  Backspace = 'Backspace',
  Enter = "Enter",
  Left = "ArrowLeft",
  Right = "ArrowRight",
  Up = "ArrowUp",
  Down = "ArrowDown",
  A = "a",
  C = "c",
  X = "x",
  Y = "y",
  Z = "z"
}
export interface IElement {
  type?: 'TEXT' | 'IMAGE';
  value: string;
  font?: string;
  size?: number;
  width?: number;
  height?: number;
  bold?: boolean;
  color?: string;
  italic?: boolean;
  underline?: boolean;
  strikeout?: boolean;
}

export function debounce(func: Function, delay: number) {
  let timer: number
  return function (...args: any) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      // @ts-ignore
      func.apply(this, args)
    }, delay)
  }
}

export function writeText(text: string) {
  if (!text) return
  window.navigator.clipboard.writeText(text.replaceAll(ZERO, `\n`))
}

export function deepClone(obj: any) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  let newObj: any = {};
  if (Array.isArray(obj)) {
    newObj = obj.map(item => deepClone(item));
  } else {
    Object.keys(obj).forEach((key) => {
      return newObj[key] = deepClone(obj[key]);
    })
  }
  return newObj;
}
export interface IElementPosition {
  index: number;
  value: string,
  rowNo: number;
  lineHeight: number;
  metrics: TextMetrics;
  isLastLetter: boolean,
  coordinate: {
    leftTop: number[];
    leftBottom: number[];
    rightTop: number[];
    rightBottom: number[];
  }
}
export interface IRange {
  startIndex: number;
  endIndex: number
}


export type IRowElement = IElement & {
  metrics: TextMetrics
}

export interface IRow {
  width: number;
  height: number;
  ascent: number;
  elementList: IRowElement[];
}
export interface IEditorOption {
  defaultType?: string;
  defaultFont?: string;
  defaultSize?: number;
  rangeColor?: string;
  rangeAlpha?: number;
  marginIndicatorSize?: number;
  marginIndicatorColor?: string,
  margins?: [top: number, right: number, bootom: number, left: number]
}
export interface IDrawOption {
  curIndex?: number;
  isSetCursor?: boolean
  isSubmitHistory?: boolean;
}


export class HistoryManager {

  private readonly MAX_RECORD_COUNT = 1000
  private undoStack: Array<Function> = []
  private redoStack: Array<Function> = []

  undo() {
    if (this.undoStack.length > 1) {
      const pop = this.undoStack.pop()!
      this.redoStack.push(pop)
      if (this.undoStack.length) {
        this.undoStack[this.undoStack.length - 1]()
      }
    }
  }

  redo() {
    if (this.redoStack.length) {
      const pop = this.redoStack.pop()!
      this.undoStack.push(pop)
      pop()
    }
  }

  execute(fn: Function) {
    this.undoStack.push(fn)
    if (this.redoStack.length) {
      this.redoStack = []
    }
    while (this.undoStack.length > this.MAX_RECORD_COUNT) {
      this.undoStack.shift()
    }
  }

}
export default class Editor {

  private readonly defaultOptions: Required<IEditorOption> = {
    defaultType: 'TEXT',
    defaultFont: 'Yahei',
    defaultSize: 16,
    rangeAlpha: 0.6,
    rangeColor: '#AECBFA',
    marginIndicatorSize: 35,
    marginIndicatorColor: '#BABABA',
    margins: [100, 120, 100, 120]
  }

  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private options: Required<IEditorOption>
  private elementList: IElement[]
  private position: IElementPosition[]
  private range: IRange

  private cursorPosition: IElementPosition | null
  private cursorDom: HTMLDivElement
  private textareaDom: HTMLTextAreaElement
  private isCompositing: boolean
  private isAllowDrag: boolean
  private rowCount: number
  private mouseDownStartIndex: number

  private historyManager: HistoryManager

  constructor(canvas: HTMLCanvasElement, data: IElement[], options: IEditorOption = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options
    };
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio;
    canvas.width = parseInt(canvas.style.width) * dpr;
    canvas.height = parseInt(canvas.style.height) * dpr;
    canvas.style.cursor = 'text'
    this.canvas = canvas
    this.ctx = ctx as CanvasRenderingContext2D
    this.ctx.scale(dpr, dpr)
    this.elementList = []
    this.position = []
    this.cursorPosition = null
    this.isCompositing = false
    this.isAllowDrag = false
    this.range = {
      startIndex: 0,
      endIndex: 0
    }
    this.rowCount = 0
    this.mouseDownStartIndex = 0

    // 历史管理
    this.historyManager = new HistoryManager()

    // 全局事件
    document.addEventListener('click', (evt) => {
      const innerDoms = [this.canvas, this.cursorDom, this.textareaDom, document.body]
      if (innerDoms.includes(evt.target as any)) return
      this.recoveryCursor()
    })
    document.addEventListener('mouseup', () => {
      this.isAllowDrag = false
    })

    // 事件监听转发
    const textarea = document.createElement('textarea')
    textarea.autocomplete = 'off'
    textarea.classList.add('inputarea')
    textarea.innerText = ''
    textarea.onkeydown = (evt: KeyboardEvent) => this.handleKeydown(evt)
    textarea.oninput = (evt: Event) => {
     
      
      const data = (evt as InputEvent).data
      console.log(evt,data);
      setTimeout(() => this.handleInput(data || ''))
    }
    textarea.onpaste = (evt: ClipboardEvent) => this.handlePaste(evt)
    textarea.addEventListener('compositionstart', this.handleCompositionstart.bind(this))
    textarea.addEventListener('compositionend', this.handleCompositionend.bind(this))
    this.canvas.parentNode?.append(textarea)
    this.textareaDom = textarea

    // 光标
    this.cursorDom = document.createElement('div')
    this.cursorDom.classList.add('cursor')
    this.canvas.parentNode?.append(this.cursorDom)

    // canvas原生事件
    canvas.addEventListener('mousedown', this.setCursor.bind(this))
    canvas.addEventListener('mousedown', this.handleMousedown.bind(this))
    canvas.addEventListener('mouseleave', this.handleMouseleave.bind(this))
    canvas.addEventListener('mousemove', this.handleMousemove.bind(this))

    // 启动
    const isZeroStart = data[0].value === ZERO
    if (!isZeroStart) {
      data.unshift({
        value: ZERO
      })
    }
    data.forEach(text => {
      if (text.value === '\n') {
        text.value = ZERO
      }
    })
    this.elementList = data
    this.draw()
  }

  private draw(options?: IDrawOption) {
    let { curIndex, isSubmitHistory = true, isSetCursor = true } = options || {}
    // 清除光标
    this.recoveryCursor()
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.position = []
    // 基础信息
    const { defaultSize, defaultFont, margins, marginIndicatorColor, marginIndicatorSize } = this.options
    const canvasRect = this.canvas.getBoundingClientRect()
    const canvasWidth = canvasRect.width
    const canvasHeight = canvasRect.height

    console.log("canvasRect",canvasRect);
    
    // 绘制页边距
    this.ctx.save()
    this.ctx.strokeStyle = marginIndicatorColor
    this.ctx.beginPath()
    const leftTopPoint: [number, number] = [margins[3], margins[0]]
    const rightTopPoint: [number, number] = [canvasWidth - margins[1], margins[0]]
    const leftBottomPoint: [number, number] = [margins[3], canvasHeight - margins[2]]
    const rightBottomPoint: [number, number] = [canvasWidth - margins[1], canvasHeight - margins[2]]
    // 上左
    this.ctx.moveTo(leftTopPoint[0] - marginIndicatorSize, leftTopPoint[1])
    this.ctx.lineTo(...leftTopPoint)
    this.ctx.lineTo(leftTopPoint[0], leftTopPoint[1] - marginIndicatorSize)
    // 上右
    this.ctx.moveTo(rightTopPoint[0] + marginIndicatorSize, rightTopPoint[1])
    this.ctx.lineTo(...rightTopPoint)
    this.ctx.lineTo(rightTopPoint[0], rightTopPoint[1] - marginIndicatorSize)
    // 下左
    this.ctx.moveTo(leftBottomPoint[0] - marginIndicatorSize, leftBottomPoint[1])
    this.ctx.lineTo(...leftBottomPoint)
    this.ctx.lineTo(leftBottomPoint[0], leftBottomPoint[1] + marginIndicatorSize)
    // 下右
    this.ctx.moveTo(rightBottomPoint[0] + marginIndicatorSize, rightBottomPoint[1])
    this.ctx.lineTo(...rightBottomPoint)
    this.ctx.lineTo(rightBottomPoint[0], rightBottomPoint[1] + marginIndicatorSize)
    this.ctx.stroke()
    this.ctx.restore()
    // 计算行信息
    const rowList: IRow[] = []
    if (this.elementList.length) {
      rowList.push({
        width: 0,
        height: 0,
        ascent: 0,
        elementList: []
      })
    }
    for (let i = 0; i < this.elementList.length; i++) {
      this.ctx.save()
      const curRow: IRow = rowList[rowList.length - 1]
      const element = this.elementList[i]
      this.ctx.font = `${element.bold ? 'bold ' : ''}${element.size || defaultSize}px ${element.font || defaultFont}`
      const metrics = this.ctx.measureText(element.value)
      const width = metrics.width
      const fontBoundingBoxAscent = metrics.fontBoundingBoxAscent
      const fontBoundingBoxDescent = metrics.fontBoundingBoxDescent
      const height = fontBoundingBoxAscent + fontBoundingBoxDescent
      const lineText = { ...element, metrics }
      if (curRow.width + width > rightTopPoint[0] - leftTopPoint[0] || (i !== 0 && element.value === ZERO)) {
        rowList.push({
          width,
          height: 0,
          elementList: [lineText],
          ascent: fontBoundingBoxAscent
        })
      } else {
        curRow.width += width
        if (curRow.height < height) {
          curRow.height = height
          curRow.ascent = fontBoundingBoxAscent
        }
        curRow.elementList.push(lineText)
      }
      this.ctx.restore()
    }
    // 渲染元素
    let x = leftTopPoint[0]
    let y = leftTopPoint[1]
    let index = 0
    for (let i = 0; i < rowList.length; i++) {
      const curRow = rowList[i];
      for (let j = 0; j < curRow.elementList.length; j++) {
        this.ctx.save()
        const element = curRow.elementList[j];
        const metrics = element.metrics
        this.ctx.font = `${element.bold ? 'bold ' : ''}${element.size || defaultSize}px ${element.font || defaultFont}`
        if (element.color) {
          this.ctx.fillStyle = element.color
        }
        const positionItem: IElementPosition = {
          index,
          value: element.value,
          rowNo: i,
          metrics,
          lineHeight: curRow.height,
          isLastLetter: j === curRow.elementList.length - 1,
          coordinate: {
            leftTop: [x, y],
            leftBottom: [x, y + curRow.height],
            rightTop: [x + metrics.width, y],
            rightBottom: [x + metrics.width, y + curRow.height]
          }
        }
        this.position.push(positionItem)
        this.ctx.fillText(element.value, x, y + curRow.ascent)
        // 选区绘制
        const { startIndex, endIndex } = this.range
        if (startIndex !== endIndex && startIndex < index && index <= endIndex) {
          this.ctx.save()
          this.ctx.globalAlpha = this.options.rangeAlpha
          this.ctx.fillStyle = this.options.rangeColor
          this.ctx.fillRect(x, y, metrics.width, curRow.height)
          this.ctx.restore()
        }
        index++
        x += metrics.width
        this.ctx.restore()
      }
      x = leftTopPoint[0]
      y += curRow.height
    }
    // 光标重绘
    if (curIndex === undefined) {
      curIndex = this.position.length - 1
    }
    if (isSetCursor) {
      this.cursorPosition = this.position[curIndex!] || null
      this.drawCursor()
    }
    // canvas高度自适应计算
    const lastPosition = this.position[this.position.length - 1]
    const { coordinate: { leftBottom, leftTop } } = lastPosition
    if (leftBottom[1] > this.canvas.height) {
      const height = Math.ceil(leftBottom[1] + (leftBottom[1] - leftTop[1]))
      this.canvas.height = height
      this.canvas.style.height = `${height}px`
      this.draw({ curIndex, isSubmitHistory: false })
    }
    this.rowCount = rowList.length
    // 历史记录用于undo、redo
    if (isSubmitHistory) {
      const self = this
      const oldelementList = deepClone(this.elementList)
      this.historyManager.execute(function () {
        self.elementList = deepClone(oldelementList)
        self.draw({ curIndex, isSubmitHistory: false })
      })
    }
  }

  private getCursorPosition(evt: MouseEvent): number {
    const x = evt.offsetX
    const y = evt.offsetY
    let isTextArea = false
    for (let j = 0; j < this.position.length; j++) {
      const { index, coordinate: { leftTop, rightTop, leftBottom } } = this.position[j];
      // 命中元素
      if (leftTop[0] <= x && rightTop[0] >= x && leftTop[1] <= y && leftBottom[1] >= y) {
        let curPostionIndex = j
        // 判断是否元素中间前后
        if (this.elementList[index].value !== ZERO) {
          const valueWidth = rightTop[0] - leftTop[0]
          if (x < leftTop[0] + valueWidth / 2) {
            curPostionIndex = j - 1
          }
        }
        isTextArea = true
        return curPostionIndex
      }
    }
    // 非命中区域
    if (!isTextArea) {
      let isLastArea = false
      let curPostionIndex = -1
      // 判断所属行是否存在元素
      const firstLetterList = this.position.filter(p => p.isLastLetter)
      for (let j = 0; j < firstLetterList.length; j++) {
        const { index, coordinate: { leftTop, leftBottom } } = firstLetterList[j]
        if (y > leftTop[1] && y <= leftBottom[1]) {
          curPostionIndex = index
          isLastArea = true
          break
        }
      }
      if (!isLastArea) {
        return this.position.length - 1
      }
      return curPostionIndex
    }
    return -1
  }

  private setCursor(evt: MouseEvent) {
    const positionIndex = this.getCursorPosition(evt)
    if (~positionIndex) {
      this.range.startIndex = 0
      this.range.endIndex = 0
      setTimeout(() => {
        this.draw({ curIndex: positionIndex, isSubmitHistory: false })
      })
    }
  }

  private drawCursor() {
    if (!this.cursorPosition) return
    // 设置光标代理
    const { lineHeight, metrics, coordinate: { rightTop } } = this.cursorPosition
    const height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
    this.textareaDom.focus()
    this.textareaDom.setSelectionRange(0, 0)
    const lineBottom = rightTop[1] + lineHeight
    const curosrleft = `${rightTop[0]}px`
    this.textareaDom.style.left = curosrleft
    this.textareaDom.style.top = `${lineBottom - 12}px`
    // 模拟光标显示
    this.cursorDom.style.left = curosrleft
    this.cursorDom.style.top = `${lineBottom - height}px`
    this.cursorDom.style.display = 'block'
    this.cursorDom.style.height = `${height}px`
    setTimeout(() => {
      this.cursorDom.classList.add('cursor--animation')
    }, 200)
  }

  private recoveryCursor() {
    this.cursorDom.style.display = 'none'
    this.cursorDom.classList.remove('cursor--animation')
  }

  private strokeRange() {
    this.draw({
      isSubmitHistory: false,
      isSetCursor: false
    })
  }

  private clearRange() {
    this.range.startIndex = 0
    this.range.endIndex = 0
  }

  private handleMousemove(evt: MouseEvent) {
    if (!this.isAllowDrag) return
    // 结束位置
    const endIndex = this.getCursorPosition(evt)
    let end = ~endIndex ? endIndex : 0
    // 开始位置
    let start = this.mouseDownStartIndex
    if (start > end) {
      [start, end] = [end, start]
    }
    this.range.startIndex = start
    this.range.endIndex = end
    if (start === end) return
    // 绘制选区
    this.strokeRange()
  }

  private handleMousedown(evt: MouseEvent) {
    this.isAllowDrag = true
    this.mouseDownStartIndex = this.getCursorPosition(evt) || 0
  }

  private handleMouseleave(evt: MouseEvent) {
    // 是否还在canvas内部
    const { x, y, width, height } = this.canvas.getBoundingClientRect()
    if (evt.x >= x && evt.x <= x + width && evt.y >= y && evt.y <= y + height) return
    this.isAllowDrag = false
  }

  private handleKeydown(evt: KeyboardEvent) {
    if (!this.cursorPosition) return
    const { index } = this.cursorPosition
    const { startIndex, endIndex } = this.range
    const isCollspace = startIndex === endIndex
    if (evt.key === KeyMap.Backspace) {
      // 判断是否允许删除
      if (this.elementList[index].value === ZERO && index === 0) {
        evt.preventDefault()
        return
      }
      if (!isCollspace) {
        this.elementList.splice(startIndex + 1, endIndex - startIndex)
      } else {
        this.elementList.splice(index, 1)
      }
      this.clearRange()
      this.draw({ curIndex: isCollspace ? index - 1 : startIndex })
    } else if (evt.key === KeyMap.Enter) {
      const enterText: IElement = {
        value: ZERO
      }
      if (isCollspace) {
        this.elementList.splice(index + 1, 0, enterText)
      } else {
        this.elementList.splice(startIndex + 1, endIndex - startIndex, enterText)
      }
      this.clearRange()
      this.draw({ curIndex: index + 1 })
    } else if (evt.key === KeyMap.Left) {
      if (index > 0) {
        this.clearRange()
        this.draw({ curIndex: index - 1, isSubmitHistory: false })
      }
    } else if (evt.key === KeyMap.Right) {
      if (index < this.position.length - 1) {
        this.clearRange()
        this.draw({ curIndex: index + 1, isSubmitHistory: false })
      }
    } else if (evt.key === KeyMap.Up || evt.key === KeyMap.Down) {
      const { rowNo, index, coordinate: { leftTop, rightTop } } = this.cursorPosition
      if ((evt.key === KeyMap.Up && rowNo !== 0) || (evt.key === KeyMap.Down && rowNo !== this.rowCount)) {
        // 下一个光标点所在行位置集合
        const probablePosition = evt.key === KeyMap.Up
          ? this.position.slice(0, index).filter(p => p.rowNo === rowNo - 1)
          : this.position.slice(index, this.position.length - 1).filter(p => p.rowNo === rowNo + 1)
        // 查找与当前位置元素点交叉最多的位置
        let maxIndex = 0
        let maxDistance = 0
        for (let p = 0; p < probablePosition.length; p++) {
          const position = probablePosition[p]
          // 当前光标在前
          if (position.coordinate.leftTop[0] >= leftTop[0] && position.coordinate.leftTop[0] <= rightTop[0]) {
            const curDistance = rightTop[0] - position.coordinate.leftTop[0]
            if (curDistance > maxDistance) {
              maxIndex = position.index
              maxDistance = curDistance
            }
          }
          // 当前光标在后
          else if (position.coordinate.leftTop[0] <= leftTop[0] && position.coordinate.rightTop[0] >= leftTop[0]) {
            const curDistance = position.coordinate.rightTop[0] - leftTop[0]
            if (curDistance > maxDistance) {
              maxIndex = position.index
              maxDistance = curDistance
            }
          }
          // 匹配不到
          if (p === probablePosition.length - 1 && maxIndex === 0) {
            maxIndex = position.index
          }
        }
        this.clearRange()
        this.draw({ curIndex: maxIndex, isSubmitHistory: false })
      }
    } else if (evt.ctrlKey && evt.key === KeyMap.Z) {
      this.historyManager.undo()
      evt.preventDefault()
    } else if (evt.ctrlKey && evt.key === KeyMap.Y) {
      this.historyManager.redo()
      evt.preventDefault()
    } else if (evt.ctrlKey && evt.key === KeyMap.C) {
      if (!isCollspace) {
        writeText(this.elementList.slice(startIndex + 1, endIndex + 1).map(p => p.value).join(''))
      }
    } else if (evt.ctrlKey && evt.key === KeyMap.X) {
      if (!isCollspace) {
        writeText(this.position.slice(startIndex + 1, endIndex + 1).map(p => p.value).join(''))
        this.elementList.splice(startIndex + 1, endIndex - startIndex)
        this.clearRange()
        this.draw({ curIndex: startIndex })
      }
    } else if (evt.ctrlKey && evt.key === KeyMap.A) {
      this.range.startIndex = 0
      this.range.endIndex = this.position.length - 1
      this.draw({ isSubmitHistory: false, isSetCursor: false })
    }
  }

  private handleInput(data: string) {
    if (!data || !this.cursorPosition || this.isCompositing) return
    this.textareaDom.value = ''
    const { index } = this.cursorPosition
    const { startIndex, endIndex } = this.range
    const isCollspace = startIndex === endIndex
    const inputData: IElement[] = data.split('').map(value => ({
      value
    }))
    if (isCollspace) {
      this.elementList.splice(index + 1, 0, ...inputData)
    } else {
      this.elementList.splice(startIndex + 1, endIndex - startIndex, ...inputData)
    }
    this.clearRange()
    this.draw({ curIndex: (isCollspace ? index : startIndex) + inputData.length })
  }

  private handlePaste(evt: ClipboardEvent) {
    const text = evt.clipboardData?.getData('text')
    this.handleInput(text || '')
    evt.preventDefault()
  }

  private handleCompositionstart() {
    this.isCompositing = true
  }

  private handleCompositionend() {
    this.isCompositing = false
  }

}

window.onload = function () {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas')
  if (!canvas) return
  const text = `\n主诉：\n发热三天，咳嗽五天。\n现病史：\n发病前14天内有病历报告社区1天 传染性疾病是的是的撒旦`
  // 模拟加粗字
  const boldText = ['主诉：', '现病史：', '既往史：', '体格检查：', '辅助检查：', '门诊诊断：', '处置治疗：']
  const boldIndex: number[] = boldText.map(b => {
    const i = text.indexOf(b)
    return ~i ? Array(b.length).fill(i).map((_, j) => i + j) : []
  }).flat()
  // 模拟颜色字
  const colorText = ['传染性疾病']
  const colorIndex: number[] = colorText.map(b => {
    const i = text.indexOf(b)
    return ~i ? Array(b.length).fill(i).map((_, j) => i + j) : []
  }).flat()
  // 组合数据
  const data = text.split('').map((value, index) => {
    if (boldIndex.includes(index)) {
      return {
        value,
        size: 18,
        bold: true
      }
    }
    if (colorIndex.includes(index)) {
      return {
        value,
        color: 'red',
        size: 16
      }
    }
    return {
      value,
      size: 16
    }
  })
  // 初始化编辑器
  const instance = new Editor(canvas, data, {
    margins: [120, 120, 200, 120]
  })
  console.log('编辑器实例: ', instance);
}

 let text = `
  以下是使用 Canvas 元素代理不同控件实现可编辑的富文本编辑器引擎，并支持复制、拖动光标和选区功能，同时由每一个区块构成且这些区块的类型有文本、段落、图片等的 TypeScript 实现代码。并以段落区块为例来实现编辑、拖动、选取和更新：

  typescript
  interface Block {
    type: "text" | "paragraph" | "image";
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  class Editor {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private blocks: Block[] = [];
    private selectedBlockIndex: number = -1;
    private draggingBlockIndex: number = -1;
  
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.canvas.addEventListener("mousedown", this.handleMouseDown);
      this.canvas.addEventListener("mousemove", this.handleMouseMove);
      this.canvas.addEventListener("mouseup", this.handleMouseUp);
    }
  
    public addTextBlock(x: number, y: number, content: string): void {
      const block: Block = {
        type: "text",
        content,
        x,
        y,
        width: this.measureTextWidth(content),
        height: 20,
      };
      this.blocks.push(block);
      this.draw();
    }
  
    public addParagraphBlock(x: number, y: number, content: string): void {
      const lines = content.split("\n");
      const lineHeight = 20;
      let offsetY = y;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const block: Block = {
          type: "paragraph",
          content: line,
          x,
          y: offsetY,
          width: this.measureTextWidth(line),
          height: lineHeight,
        };
        offsetY += lineHeight;
        this.blocks.push(block);
      }
      this.draw();
    }
  
    public addImageBlock(x: number, y: number, width: number, height: number): void {
      // TODO: Implement adding image blocks
    }
  
    private measureTextWidth(text: string): number {
      return this.ctx.measureText(text).width;
    }
  
    private handleMouseDown = (event: MouseEvent): void => {
      const mouseX = event.clientX - this.canvas.offsetLeft;
      const mouseY = event.clientY - this.canvas.offsetTop;
      this.selectedBlockIndex = this.getBlockIndexAt(mouseX, mouseY);
      this.draggingBlockIndex = this.selectedBlockIndex;
      this.draw();
    };
  
    private handleMouseMove = (event: MouseEvent): void => {
      if (this.draggingBlockIndex !== -1) {
        const mouseX = event.clientX - this.canvas.offsetLeft;
        const mouseY = event.clientY - this.canvas.offsetTop;
        const block = this.blocks[this.draggingBlockIndex];
        block.x = mouseX;
        block.y = mouseY;
        this.draw();
      }
    };
  
    private handleMouseUp = (): void => {
      this.draggingBlockIndex = -1;
    };
  
    private getBlockIndexAt(x: number, y: number): number {
      for (let i = this.blocks.length - 1; i >= 0; i--) {
        const block = this.blocks[i];
        if (x >= block.x && x <= block.x + block.width && y >= block.y && y <= block.y + block.height) {
          return i;
        }
      }
      return -1;
    }
  
    private draw(): void {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let i = 0; i < this.blocks.length; i++) {
        const block = this.blocks[i];
        if (i === this.selectedBlockIndex) {
          this.ctx.fillStyle = "#eee";
          this.ctx.fillRect(block.x, block.y, block.width, block.height);
        }
        this.ctx.strokeRect(block.x, block.y, block.width, block.height);
        if (block.type === "text" || block.type === "paragraph") {
          this.ctx.fillText(block.content, block.x, block.y + block.height - 5);
        } else if (block.type === "image") {
          // TODO: Implement drawing image blocks
        }
      }
    }
  }
  这段代码定义了 Block 类型和 Editor 类。Block 表示一个文本、段落或图片区块，包含了该区块的类型、内容、位置和大小等信息。` 