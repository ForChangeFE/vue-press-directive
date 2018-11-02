import _Vue, { PluginObject, VNodeDirective } from 'vue';

type IGenerateId = () => string;
type IAddHandler = (el: HTMLElement, fn: (() => any)) => IHandler;
type IRemoveHandler = (el: HTMLElement) => void;
interface Options {
  interval?: number;
}
interface IHandler {
  uid: string;
  interval: number;

  start(evt: Event): void;
  end(evt: Event): void;
}
interface IHandlers {
  [uid: string]: IHandler | null;
}
interface HandlerCtor {
  new (uid: string, interval: number, callback: () => any): IHandler;
}

const INTERVAL = 600;

class Handler {
  public uid: string;
  public interval: number;
  private startPoint: number;
  private endPoint: number;
  private callback: (() => any);

  constructor(uid: string, interval: number, callback: (() => any)) {
    this.uid = uid;
    this.interval = interval;
    this.startPoint = 0;
    this.endPoint = 0;
    this.callback = callback;
    this.start = this.start.bind(this);
    this.end = this.end.bind(this);
  }

  public start() {
    this.startPoint = Date.now();
  }

  public end() {
    this.endPoint = Date.now();
    const isValid: boolean = (this.endPoint - this.startPoint) > this.interval;
    if (isValid) {
      try {
        this.callback();
      } catch (error) {
        console.log(error);
      }
    }
  }
}

function createHandler(ctor: HandlerCtor, uid: string, interval: number, callback: () => any): IHandler {
  return new ctor(uid, interval, callback);
}

const VPress: PluginObject<Options> = {
  install(Vue: typeof _Vue, options: Options = {}) {
    const interval: number = typeof options.interval === 'number' ? options.interval : INTERVAL;
    const handlers: IHandlers = {};
    const generateId: IGenerateId = ((id: number) => () => '$' + id++)(1);

    const addHandler: IAddHandler = (el: HTMLElement, callback: () => any): IHandler => {
      const uid: string = generateId();
      const handler: IHandler = createHandler(Handler, uid, interval, callback);
      el.dataset.longPressId = uid;
      handlers[uid] = handler;
      return handler;
    };

    const removeHandler: IRemoveHandler = (el: HTMLElement): void => {
      const uid: string | undefined = el.dataset.longPressId;
      if (uid) {
        handlers[uid] = null;
        delete handlers[uid];
      }
    };

    Vue.directive('press', {
      bind(el: HTMLElement, binding: VNodeDirective) {
        const { value: callback, arg } = binding;
        const handler: IHandler = addHandler(el, callback);

        if (arg != null) {
          const customInterval: number = parseInt(arg, 10);
          if (!isNaN(customInterval)) {
            handler.interval = customInterval;
          }
        }

        el.style.userSelect = 'none';
        el.style.webkitUserSelect = 'none';
        el.addEventListener('contextmenu', function noSelect(event) {
          event.preventDefault();
        });

        el.addEventListener('touchstart', handler.start);
        el.addEventListener('touchend', handler.end);
        el.addEventListener('touchcancel', handler.end);
      },

      unbind(el, binding) {
        const uid: string | undefined = el.dataset.longPressId;
        if (uid) {
          let handler: IHandler | null = (handlers[uid] as IHandler);
          el.removeEventListener('touchstart', handler.start);
          el.removeEventListener('touchend', handler.end);
          el.addEventListener('touchcancel', handler.end);
          removeHandler(el);
          handler = null;
        }
      },
    });
  },
};

export default VPress;
