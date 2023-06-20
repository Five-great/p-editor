/*
 * @Description: 
 * @Author: Five
 * @Date: 2023-06-10 21:56:03
 * @LastEditors: Five
 * @LastEditTime: 2023-06-10 22:06:27
 */
export interface Plugin {
    getMetadata?: () => { name: string; url: string };
    init?: (editor: any, url: string) => void;
  
    // Allow custom apis
    [key: string]: any;
}
export interface UrlObject {
    prefix: string;
    resource: string;
    suffix: string;
  }
  
export type WaitState = 'added' | 'loaded';
  
export type AddOnConstructor<T> = (editor: any, url: string) => T;

export interface AddOnManager<T> {
    items: AddOnConstructor<T>[];
    urls: Record<string, string>;
    lookup: Record<string, { instance: AddOnConstructor<T> }>;
    get: (name: string) => AddOnConstructor<T> | undefined;
    requireLangPack: (name: string, languages?: string) => void;
    add: (id: string, addOn: AddOnConstructor<T>) => AddOnConstructor<T>;
    remove: (name: string) => void;
    createUrl: (baseUrl: UrlObject, dep: string | UrlObject) => UrlObject;
    load: (name: string, addOnUrl: string | UrlObject) => Promise<void>;
    waitFor: (name: string, state?: WaitState) => Promise<void>;
}

export type PluginManager = AddOnManager<void | Plugin>;