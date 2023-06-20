type ScriptLoadEventHandler = (script: HTMLScriptElement) => void;

export  class ScriptLoader {
  private loadedUrls: Set<string> = new Set();
  private eventHandlers: ScriptLoadEventHandler[] = [];

  public load(id: string): void {
    if (this.loadedUrls.has(id)) {
      return;
    }

    const script = document.createElement('script');
    script.src = id;

    const onLoad = () => {
      this.loadedUrls.add(id);
      this.eventHandlers.forEach(handler => handler(script));
    };

    script.addEventListener('load', onLoad);

    document.head.appendChild(script);
  }

  public onLoaded(handler: ScriptLoadEventHandler): void {
    this.eventHandlers.push(handler);
  }
  public remove(id: string){
    if (this.loadedUrls.has(id)) {
       
      }else{
        console.log(`未找到 ${id}`);
      }
   }
  public removeHandler(handler: ScriptLoadEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index !== -1) {
      this.eventHandlers.splice(index, 1);
    }
  }
}