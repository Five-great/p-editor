import { IElement } from "./Element";

export interface IEditorData {
    header?: IElement[];
    main: IElement[];
    footer?: IElement[];
  }

/**
 * @description:  页边距 [top: number, right: number, bottom: number, left: number ]
 * @return {*}
 * @author: Five
 */  
export type IMargin = [ number, number, number, number]