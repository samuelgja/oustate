import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import { Emitter } from '../emitters/create-emitter'
import { IsSame } from '../types/types'

/**
 * Todo need to remove this
 */
export function toType<T>(obj?: unknown): T {
  return obj as T
}

export const syncExternalStore = <T, S>(
  emitter: Emitter<T>,
  selector: (stateValue: T) => S = (stateValue) => toType<S>(stateValue),
  isEqual?: IsSame<S>,
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

export const isPromise = <T>(value: T): boolean => {
  const promiseValue = value as unknown as { then: unknown; catch: unknown } | undefined
  if (
    promiseValue !== null &&
    typeof promiseValue === 'object' &&
    typeof promiseValue.then === 'function' &&
    typeof promiseValue.catch === 'function'
  ) {
    return true
  }
  return false
}
