import { ReactiveEffect } from "./effect.js";
import { triggerRefValue } from "./ref.js";
export class ComputedRefImpl {
    constructor(getter, setter) {
        this.getter = getter;
        this.setter = setter;
        this.dep = undefined;
        this._value = undefined;
        this.__v_isRef = true;
        this.effect = new ReactiveEffect(() => getter(this._value), () => triggerRefValue(this));
        this.effect.computed = this;
    }
    get value() {
        return this._value;
    }
}
export function computed(getter) {
    const cRef = new ComputedRefImpl(getter);
    return cRef;
}
