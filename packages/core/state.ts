import { isPromise } from 'node:util/types'
import { createEmitter } from './create-emitter'
import type { SetValue, StateOptions, StateSetter, StateDataInternal, StateGetter, IsEqual, StateBase } from './types'
import { isSetValueFunction, StateKeys } from './types'
import { getId } from './common'
import { useStateValue } from './use-state-value'

/**
 * Creating of basic atom state.
 * @param defaultState - any value
 * @param options - optional options for state (isSame, onSet)
 * @returns AtomState
 * @example ```typescript
 * // global scope
 * const counterState = createState(0)
 * const userState = createState({ name: 'John', age: 20 })
 *
 * // react scope
 * const counter = useStateValue(counterState)
 * const user = useStateValue(userState)
 * // when need just partial data from state, it can be sliced (slice don't need to be memoized - check docs)
 * const userAge = useStateValue(userState, (state) => state.age) // this will help to avoid unnecessary re-renders
 * ```
 */
export function state<T>(defaultState: T, options?: StateOptions<T>): StateSetter<T> {
  const id = getId()
  const { onSet, onInit, isEqual } = options || {}

  function getSetValue(stateSetter: SetValue<T>): T {
    if (isSetValueFunction(stateSetter)) {
      return stateSetter(stateData.cached)
    }
    return stateSetter
  }

  const stateData: StateDataInternal<T> = {
    updateVersion: 0,
    cached: defaultState,
    isInitialized: true,
    isResolving: false,
  }

  function get() {
    return stateData.cached
  }

  function set(stateValue: SetValue<T>) {
    const newState = getSetValue(stateValue)
    const isEqualResult = isEqual?.(stateData.cached, newState)
    if (isEqualResult || newState === stateData.cached) {
      return
    }
    stateData.updateVersion++
    stateData.cached = newState
    if (onSet) {
      onSet(newState)
    }
    emitter.emit()
  }

  if (onInit) {
    if (isPromise(onInit)) {
      onInit.then((result) => {
        set(result as T)
      })
    } else {
      set(onInit)
    }
  }

  const emitter = createEmitter<T>(get)

  const stateBase: StateBase<T> = {
    __tag: undefined as T,
    id,
    is: StateKeys.IS_STATE,
    get,
    reset() {
      set(defaultState)
    },
    slice(selector, isSame) {
      const sliceState = slice(useSliceState, selector, isSame)
      emitter.subscribe(() => {
        sliceState.__internal.emitter.emit()
      })
      return sliceState
    },

    __internal: {
      emitter,
    },
  }

  const useSliceState: StateSetter<T> = (useSelector, isEqualHook) => {
    return useStateValue(useSliceState, useSelector, isEqualHook)
  }
  useSliceState.set = set
  useSliceState.__internal = stateBase.__internal
  useSliceState.__tag = stateBase.__tag
  useSliceState.is = stateBase.is
  useSliceState.id = stateBase.id
  useSliceState.get = stateBase.get
  useSliceState.reset = stateBase.reset
  useSliceState.slice = stateBase.slice

  return useSliceState
}

// eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
export function slice<T, S>(state: StateGetter<T>, selector: (value: T) => S, isEqual: IsEqual<S> = () => false): StateGetter<S> {
  let previousData: S | undefined
  const emitter = createEmitter(() => {
    const data = selector(state.get())
    if (previousData && isEqual(previousData, data)) {
      return previousData
    }
    previousData = data
    return data
  })

  const stateBase: StateBase<S> = {
    __internal: {
      emitter,
    },
    __tag: undefined as S,
    reset: () => {},
    get: () => selector(state.get()),
    id: getId(),
    is: StateKeys.IS_SLICE,
    slice(sliceSelector, isSame) {
      const sliceState = slice(useSliceState, sliceSelector, isSame)
      emitter.subscribe(() => {
        sliceState.__internal.emitter.emit()
      })
      return sliceState
    },
  }

  const useSliceState: StateGetter<S> = (useSelector, isEqualHook) => {
    return useStateValue(useSliceState, useSelector, isEqualHook)
  }
  useSliceState.__internal = stateBase.__internal
  useSliceState.__tag = stateBase.__tag
  useSliceState.is = stateBase.is
  useSliceState.id = stateBase.id
  useSliceState.get = stateBase.get
  useSliceState.reset = stateBase.reset
  useSliceState.slice = stateBase.slice
  return useSliceState
}
