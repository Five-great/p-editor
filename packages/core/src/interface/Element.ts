/*
 * @Description: 
 * @Author: Five
 * @Date: 2023-06-10 20:21:11
 * @LastEditors: Five
 * @LastEditTime: 2023-06-10 20:28:06
 */
import { ElementType } from "../dataset/enum/Element";
import { RowFlex } from "../dataset/enum/Row";
import { TitleLevel } from "../dataset/enum/Title";



export interface IElementBasic {
    id?: string;
    type?: ElementType;
    value: string;
  }
  
export interface IElementStyle {
font?: string;
size?: number;
width?: number;
height?: number;
bold?: boolean;
color?: string;
highlight?: string;
italic?: boolean;
underline?: boolean;
strikeout?: boolean;
rowFlex?: RowFlex;
rowMargin?: number;
letterSpacing?: number;
}

export interface ITitleElement {
    valueList?: IElement[];
    level?: TitleLevel;
    titleId?: string;
}
export type IElement = IElementBasic
& IElementStyle
& ITitleElement
& Record<string, unknown>