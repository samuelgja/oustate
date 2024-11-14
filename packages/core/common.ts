import { useSyncExternalStoreWithSelector as useSync } from 'use-sync-external-store/shim/with-selector'
import type { Emitter } from './create-emitter'
import type { IsEqual } from './types'

/**
 * Todo need to remove this
 */
export function toType<T>(object?: unknown): T {
  return object as T
}

export const useSyncExternalStore = <T, S>(
  emitter: Emitter<T>,
  selector: (stateValue: T) => S,
  isEqual?: IsEqual<S>,
): undefined extends S ? T : S => {
  const store = useSync<T, S>(
    emitter.subscribe,
    emitter.getSnapshot!,
    emitter.getServerSnapshot,
    selector ? (stateValue) => selector(stateValue) : toType,
    isEqual,
  ) as undefined extends S ? T : S
  return store
}

let id = 0
export const getId = () => {
  id++
  return `${id}:ID`
}

export function isPromise(value: unknown): value is Promise<unknown> {
  return value instanceof Promise
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}
