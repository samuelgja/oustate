import { createEmitter } from './create-emitter'
import type { SetValue, StateOptions, StateSetter, StateDataInternal, IsEqual, StateBase, DefaultValue } from './types'
import { getDefaultValue, isSetValueFunction, StateKeys } from './types'
import { getId, isPromise } from './common'
import { useStateValue } from './use-state-value'
import { select } from './select'
import { merge } from './merge'

/**
 * Creates a basic atom state.
 * @param defaultValue - The initial state value.
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

export function create<T>(defaultValue: DefaultValue<T>, options?: StateOptions<T>): StateSetter<Awaited<T>> {
  const id = getId()
  const { onSet, isEqual } = options || {}

  function resolveSetter(value: T, stateSetter: SetValue<T>): T {
    if (isSetValueFunction(stateSetter)) {
      return stateSetter(value)
    }
    return stateSetter
  }

  const stateData: StateDataInternal<T> = {
    updateVersion: 0,
    value: undefined,
  }

  function getValue(): T {
    if (stateData.value === undefined) {
      stateData.value = getDefaultValue(defaultValue)
    }
    return stateData.value
  }
  function get(): T {
    const stateValue = getValue()
    if (isPromise(stateValue)) {
      stateValue.then((data) => {
        stateData.value = data as Awaited<T>
        emitter.emit()
      })
    }
    return stateValue
  }

  function set(stateValue: SetValue<T>) {
    const stateValueData = getValue()
    const newState = resolveSetter(stateValueData, stateValue)
    const isEqualResult = isEqual?.(stateValueData, newState)
    if (isEqualResult || newState === stateValueData) {
      return
    }
    stateData.updateVersion++
    stateData.value = newState
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
    getState: get,
    reset() {
      const value = getDefaultValue(defaultValue)
      if (isPromise(value)) {
        value.then((data) => {
          set(data as T)
        })
        return
      }
      set(value)
    },
    select(selector, isSame) {
      return select(stateValue, selector, isSame)
    },
    merge(state2, selector, isEqualHook) {
      return merge(stateValue, state2, selector, isEqualHook)
    },

    __internal: {
      emitter,
    },
  }

  // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
  const stateValue: StateSetter<T> = <S>(selector?: (state: T) => S, isEqual?: IsEqual<S>) => {
    return useStateValue(stateValue, selector, isEqual)
  }
  stateValue.setState = set
  stateValue.__internal = stateBase.__internal
  stateValue.__tag = stateBase.__tag
  stateValue.is = stateBase.is
  stateValue.id = stateBase.id
  stateValue.getState = stateBase.getState
  stateValue.reset = stateBase.reset
  stateValue.select = stateBase.select
  stateValue.merge = stateBase.merge

  return stateValue as StateSetter<Awaited<T>>
}
