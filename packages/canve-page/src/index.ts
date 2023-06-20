
import { CoreDraw } from "@p-editor/core"
import { IEditorData } from "@p-editor/core/src/interface/Editor"

interface IPEditorOption {

}
export default class PEditor {

    public destroy: Function
  
    constructor(container: HTMLDivElement, data: IEditorData, options: IPEditorOption = {}) {
     const  coreDraw =  new CoreDraw(container, data, options as any);
    
      // 注册销毁方法
      this.destroy = () => {
        // draw.destroy()
        // shortcut.removeEvent()
        // contextMenu.removeEvent()
      }
    }
  
}


export {
    PEditor,
    IPEditorOption,
}

