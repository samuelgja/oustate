import { createEmitter } from './create-emitter'
import type { SetValue, StateOptions, StateSetter, StateDataInternal, StateGetter, IsEqual, StateBase } from './types'
import { isSetValueFunction, StateKeys } from './types'
import { getId, isPromise } from './common'
import { useStateValue } from './use-state-value'

/**
 * Creates a basic atom state.
 * @param defaultState - The initial state value.
 * @param options - Optional settings for the state (e.g., isEqual, onSet).
 * @returns A state object that can be used as a hook and provides state management methods.
 * @example
 * ```typescript
 * // Global scope
 * const counterState = state(0);
 * const userState = state({ name: 'John', age: 20 });
 *
 * // React component
 * const counter = counterState(); // Use as a hook
 * const user = userState();
 *
 * // Access partial data from the state using slice
 * const userAge = userState.slice((state) => state.age)();
 * ```
 */

type DefaultState<T> = T | Promise<T>
export function state<T>(defaultState: T, options?: StateOptions<T>): StateSetter<T> {
  const id = getId()
  const { onSet, isEqual } = options || {}

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

  const emitter = createEmitter<T>(get)

  const stateBase: StateBase<T> = {
    __tag: undefined as T,
    id,
    is: StateKeys.IS_STATE,
    get,
    reset() {
      set(defaultState)
    },
    select(selector, isSame) {
      const sliceState = select(useSliceState, selector, isSame)
      emitter.subscribe(() => {
        sliceState.__internal.emitter.emit()
      })
      return sliceState
    },

    __internal: {
      emitter,
      // stateData,
    },
  }

  // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
  const useSliceState: StateSetter<T> = <S>(selector?: (state: T) => S, isEqual?: IsEqual<S>) => {
    return useStateValue(useSliceState, selector, isEqual)
  }
  useSliceState.set = set
  useSliceState.__internal = stateBase.__internal
  useSliceState.__tag = stateBase.__tag
  useSliceState.is = stateBase.is
  useSliceState.id = stateBase.id
  useSliceState.get = stateBase.get
  useSliceState.reset = stateBase.reset
  useSliceState.select = stateBase.select

  return useSliceState
}

/**
 * Select a slice of state.
 */
export function select<T, S>(
  // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
  state: StateGetter<T>,
  selector: (value: T) => S,
  isEqual: IsEqual<S> = () => false,
): StateGetter<S> {
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
    select(sliceSelector, isSame) {
      const sliceState = select(useSliceState, sliceSelector, isSame)
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
  useSliceState.select = stateBase.select
  return useSliceState
}
