import { activeEffect, trackEffects, triggerEffects } from "./effect.js";
export function ref(value) {
    return createRef(value, false);
}
export function shallowRef(value) {
    return createRef(value, true);
}
export function createRef(rawValue, shallow) {
    if (rawValue.__v_isRef) {
        return rawValue;
    }
    return new RefImpl(rawValue, shallow);
}
class RefImpl {
    constructor(value, __v_isShallow) {
        this.__v_isShallow = __v_isShallow;
        this.dep = undefined;
        this.__v_isRef = true;
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
export function trackRefValue(ref) {
    if (!activeEffect) {
        console.log("当前没有activeEffect需要track");
        return;
    }
    if (!ref.dep) {
        ref.dep = new Set();
    }
    trackEffects(activeEffect, ref.dep);
}
export function triggerRefValue(ref, newVal) {
    // ref = toRaw(ref);
    if (ref.dep) {
        triggerEffects(ref.dep);
    }
}
