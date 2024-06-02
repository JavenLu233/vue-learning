export let activeEffect;
export let shouldTrack = true;
export class ReactiveEffect {
    constructor(fn, trigger, scheduler) {
        this.fn = fn;
        this.trigger = trigger;
        this.scheduler = scheduler;
        // active = true
        this.deps = [];
        this.dirty = false;
        this._running = 0;
    }
    run() {
        this.dirty = false;
        let lastEffect = activeEffect;
        try {
            this._running++;
            activeEffect = this;
            return this.fn();
        }
        finally {
            this._running--;
            activeEffect = lastEffect;
        }
    }
}
export function effect(fn) {
    // 如果已经生成过实例了，就直接返回实例上挂载的fn即可，不需要重复生成
    if (fn.effect instanceof ReactiveEffect) {
        fn = fn.effect.fn;
    }
    const _effect = new ReactiveEffect(fn, () => { }, () => {
        if (_effect.dirty) {
            _effect.run();
        }
    });
    _effect.run(); // 第一次进行一下执行
    // 返回一个runner，并且绑定this为effect实例本身
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
export function cleanupDepEffect(dep, effect) {
    if (dep.has(effect)) {
        dep.delete(effect);
    }
}
export function trackEffects(effect, dep) {
    // 先清理旧dep然后再重新绑定
    // console.log("trackEffects当前的activeEffect", activeEffect);
    cleanupDepEffect(dep, effect);
    const idx = activeEffect.deps.indexOf(dep);
    if (idx >= 0) {
        activeEffect.deps.splice(idx, 1);
    }
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
    console.log("dep<->effect", dep, activeEffect);
}
export function triggerEffects(dep) {
    for (const effect of Array.isArray(dep) ? dep : [...dep]) {
        let tracking = dep.has(effect);
        if (!tracking || effect._running)
            continue;
        effect.dirty = true;
        effect.trigger();
        effect.scheduler && effect.scheduler();
    }
}
