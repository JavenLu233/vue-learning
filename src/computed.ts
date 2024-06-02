import { ReactiveEffect } from "./effect.js";
import { trackRefValue, triggerRefValue, type Dep } from "./ref.js";

export class ComputedRefImpl<T> {
  public dep?: Dep = undefined
  public effect: ReactiveEffect<T>
  private _value!: T;
  public readonly __v_isRef = true

  constructor(public getter: Function, public setter?: Function) {
    this.effect = new ReactiveEffect(() => {
      console.log("computed.effect 的 fn")
      return getter(this._value)
    }, () => triggerRefValue(this));
    this.effect.computed = this;
    this.effect.dirty = true;
  }

  get value() {
    trackRefValue(this);
    if (this.effect.dirty) {
      console.log(this, "computed dirty, run");
      this._value = this.effect.run()
      triggerRefValue(this);
    }
    console.log("获取computed.value");
    return this._value;
  }
}

export function computed(getter: Function) {
  const cRef = new ComputedRefImpl(getter);
  return cRef as any;
}