import type { Emitter } from './create-emitter'
import { isFunction, isPromise } from './is'

/**
 * Key identifier for family state.
 */
export type Key = string | number | symbol
/**
 * Equality check function.
 */
export type IsEqual<T = unknown> = (a: T, b: T) => boolean

export interface StateOptions<T> {
  isEqual?: IsEqual<T>
  onSet?: (newValue: T) => void
}

export type Setter<T> = (value: T) => T
/**
 * Set new state value function.
 */
export type SetValue<T> = T | Setter<T>

/**
 * Set new state function
 */
export type StateValue<T, S> = undefined extends S ? T : S
export type Set<T> = (state: SetValue<T>) => void

/**
 * Getting state value function.
 */
export type GetState<T> = () => T
export interface StateDataInternal<T = unknown> {
  value?: T
  updateVersion: number
}

// eslint-disable-next-line no-shadow
export enum StateKeys {
  IS_STATE = 'isState',
  IS_SLICE = 'isSlice',
}

export interface StateBase<T> {
  __tag: T
  /**
   * State identifier
   */
  is: StateKeys
  /**
   * Subscribe to computed state changes
   */

  /**
   * Reset state to default value if it's basic atom - if it's family - it will clear all family members
   */
  reset: () => void
  /**
   * Get current state value
   */
  getState: GetState<T>
  /**
   * unique state id - generated by library
   */
  id: Key

  select: <S>(selector: (value: T) => S, isEqual?: IsEqual<S>) => StateGetter<S>
  merge: <T2, S>(state2: StateGetter<T2>, selector: (value1: T, value2: T2) => S, isEqual?: IsEqual<S>) => StateGetter<S>

  /**
   * Internal state data
   */
  __internal: {
    emitter: Emitter<T>
  }
}

export interface StateGetter<T> extends StateBase<T> {
  // use use as the function call here
  <S>(selector?: (state: T) => S, isEqual?: IsEqual<S>): StateValue<T, S>
}
export interface StateSetter<T> extends StateGetter<T> {
  /**
   * Set new state value
   */
  setState: Set<T>
}

export type State<T> = StateSetter<T> | StateGetter<T>

export type DefaultValue<T> = T | (() => T)

export function getDefaultValue<T>(initValue: DefaultValue<T>): T {
  if (isPromise(initValue)) {
    return initValue
  }
  if (isFunction(initValue)) {
    return (initValue as () => T)()
  }
  return initValue
}

export interface Ref<T> {
  current: T | undefined
  readonly isRef: true
}