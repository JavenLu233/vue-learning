import { ReactiveEffect } from "./effect.js";
import { trackRefValue, triggerRefValue } from "./ref.js";
export class ComputedRefImpl {
    constructor(getter, setter) {
        this.getter = getter;
        this.setter = setter;
        this.dep = undefined;
        this.__v_isRef = true;
        this.effect = new ReactiveEffect(() => {
            console.log("computed.effect 的 fn");
            return getter(this._value);
        }, () => triggerRefValue(this));
        this.effect.computed = this;
        this.effect.dirty = true;
    }
    get value() {
        trackRefValue(this);
        if (this.effect.dirty) {
            console.log(this, "computed dirty, run");
            this._value = this.effect.run();
            triggerRefValue(this);
        }
        console.log("获取computed.value");
        return this._value;
    }
}
export function computed(getter) {
    const cRef = new ComputedRefImpl(getter);
    return cRef;
}
