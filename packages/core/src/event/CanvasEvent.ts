class CanvasEvent {
  private canvas: HTMLCanvasElement
  private eventHandlers: Record<string, Function> = {}

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    // 监听鼠标事件
    canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))

    // 监听键盘事件
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  /**
   * 注册事件处理函数
   */
  public on(type: string, handler: Function): void {
    this.eventHandlers[type] = handler
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(e: MouseEvent): void {
    const { x, y } = e
    const handler = this.eventHandlers['mousedown']
    if (handler && this.canvas === e.target) {
      handler(x, y)
    }
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(e: MouseEvent): void {
    const { x, y } = e
    const handler = this.eventHandlers['mousemove']
    if (handler && this.canvas === e.target) {
      handler(x, y)
    }
  }

  /**
   * 处理鼠标松开事件
   */
  private handleMouseUp(e: MouseEvent): void {
    const { x, y } = e
    const handler = this.eventHandlers['mouseup']
    if (handler && this.canvas === e.target) {
      handler(x, y)
    }
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(e: KeyboardEvent): void {
    const handler = this.eventHandlers['keydown']
    if (handler) {
      handler(e.key)
    }
  }
}