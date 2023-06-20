import { ScriptLoader } from "../dom/ScriptLoader";

export type AddOnConstructor<T> = (editor: any, url: string) => T;
export default class PluginManager{
  private loader: ScriptLoader;
  constructor(options?: any) {
   this.loader = new ScriptLoader();
   this.loader.onLoaded(script => {
    console.log(`Loaded script ${script.src}`);
  });
  }
  public add<T>(id: string,addOn:AddOnConstructor<T>) {
    this.loader.load(id);
  }
  public remove<T>(id: string,addOn:AddOnConstructor<T>) {
    this.loader.remove(id);
  }
}