import { ReactiveEffect, activeEffect, trackEffects, triggerEffects } from "./effect.js"

export function ref(value?: unknown) {
  return createRef(value, false);
}

export function shallowRef(value?: unknown) {
  return createRef(value, true);
}

export function createRef(rawValue: any, shallow: boolean) {
  if (rawValue.__v_isRef) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T
  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(value: T, public readonly __v_isShallow: boolean) {
    // this._rawValue = __v_isShallow ? value : toRaw(value);
    // this._value = __v_isShallow ? value : toReactive(value);
    this._rawValue = this._value = value; // TEMP
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newVal) {
    console.log("触发了 set value", newVal);
    // newVal = this.__v_isShallow ? newVal : toRaw(newVal);
    if (!Object.is(newVal, this._rawValue)) {
      this._rawValue = this._value = newVal;
      triggerRefValue(this, newVal);
    }
  }
}

export type Dep = Set<ReactiveEffect>;
export type RefBase<T> = {
  dep?: Dep;
  value: T;
}

export function trackRefValue(ref: RefBase<any>) {
  if (!activeEffect) {
    console.log("当前没有activeEffect需要track");
    return;
  }
  if (!ref.dep) {
    ref.dep = new Set();
  }
  trackEffects(activeEffect, ref.dep);
}


export function triggerRefValue(ref: RefBase<any>, newVal?: any) {
  // ref = toRaw(ref);
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}
