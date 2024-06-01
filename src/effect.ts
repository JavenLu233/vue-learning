import { ComputedRefImpl } from "./computed.js";
import { Dep } from "./ref.js";

export let activeEffect: any;
export let shouldTrack = true;

export class ReactiveEffect<T = any> {
  // active = true
  deps: Dep[] = []
  dirty: boolean = false
  computed?: ComputedRefImpl<T>

  constructor(
    public fn: () => T,
    public trigger: () => void,
    public scheduler?: Function
  ) {
  }

  run() {
    this.dirty = false;
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn()
    } finally {
      activeEffect = lastEffect;
    }
  }
}

export interface ReactiveEffectRunner<T = any> {
  (): T
  effect: ReactiveEffect
}


export function effect<T = any>(fn: () => T): any {
  console.log("生成effect实例", fn);
  // 如果已经生成过实例了，就直接返回实例上挂载的fn即可，不需要重复生成
  if ((fn as ReactiveEffectRunner).effect instanceof ReactiveEffect) {
    fn = (fn as ReactiveEffectRunner).effect.fn
  }

  const _effect = new ReactiveEffect(fn, () => { }, () => {
    if (_effect.dirty) {
      _effect.run()
    }
  })
  _effect.run() // 第一次进行一下执行

  // 返回一个runner，并且绑定this为effect实例本身
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect
  return runner
}


export function cleanupDepEffect(dep: Dep, effect: ReactiveEffect) {
  if (dep.has(effect)) {
    dep.delete(effect);
  }
}



export function trackEffects(
  effect: ReactiveEffect,
  dep: Dep,
) {
  // 先清理旧dep然后再重新绑定
  cleanupDepEffect(dep, effect);
  const idx = activeEffect.deps.indexOf(dep);
  console.log("idx", idx);
  if (idx >= 0) {
    activeEffect.deps.splice(idx, 1);
  }

  dep.add(activeEffect);
  activeEffect.deps.push(dep);
  console.log("dep<->effect", dep, activeEffect,);
}



export function triggerEffects(dep: Dep) {
  
  for (const effect of Array.isArray(dep) ? dep : [...dep]) {
    let tracking = dep.has(effect);
    if (!tracking) continue;

    effect.dirty = true;
    effect.trigger();
    effect.scheduler && effect.scheduler();
  }
}