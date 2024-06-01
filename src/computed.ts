import { ReactiveEffect } from "./effect.js";
import { triggerRefValue, type Dep } from "./ref.js";

export class ComputedRefImpl<T> {
  public dep?: Dep = undefined
  public effect: ReactiveEffect<T>
  private _value = undefined
  public readonly __v_isRef = true

  constructor(public getter: Function, public setter?: Function) {
    this.effect = new ReactiveEffect(() => getter(this._value), () => triggerRefValue(this))
    this.effect.computed = this
  }

  get value() {

    return this._value;
  }
}

export function computed(getter: Function) {
  const cRef = new ComputedRefImpl(getter);
  return cRef as any;
}