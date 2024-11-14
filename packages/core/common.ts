import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import type { Emitter } from './create-emitter'
import type { IsEqual } from './types'

/**
 * Todo need to remove this
 */
export function toType<T>(object?: unknown): T {
  return object as T
}

export const syncExternalStore = <T, S>(
  emitter: Emitter<T>,
  selector: (stateValue: T) => S = (stateValue) => toType<S>(stateValue),
  isEqual?: IsEqual<S>,
): undefined extends S ? T : S => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useSyncExternalStoreWithSelector<T, S>(
    emitter.subscribe,
    emitter.getSnapshot!,
    emitter.getServerSnapshot,
    selector,
    isEqual,
  ) as undefined extends S ? T : S
}

let id = 0
export const getId = () => {
  id++
  return `${id}:ID`
}

export function isPromise(value: unknown): value is Promise<unknown> {
  return value instanceof Promise
}
