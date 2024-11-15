import { getId } from './common'
import { createEmitter } from './create-emitter'
import { select } from './select'
import type { IsEqual, StateBase, StateGetter } from './types'
import { StateKeys } from './types'
import { useStateValue } from './use-state-value'

export function merge<T1, T2, S>(
  state1: StateGetter<T1>,
  state2: StateGetter<T2>,
  selector: (value1: T1, value2: T2) => S,
  isEqual: IsEqual<S> = () => false,
): StateGetter<S> {
  let previousData: S | undefined
  const emitter = createEmitter(() => {
    const data = selector(state1.getState(), state2.getState())
    if (previousData !== undefined) {
      if (isEqual(previousData, data)) {
        return previousData
      }
      if (previousData === data) {
        return previousData
      }
    }
    previousData = data
    return data
  })
  state1.__internal.emitter.subscribe(() => {
    emitter.emit()
  })
  state2.__internal.emitter.subscribe(() => {
    emitter.emit()
  })

  const stateBase: StateBase<S> = {
    __internal: {
      emitter,
    },
    __tag: undefined as S,
    reset: () => {
      state1.reset()
      state2.reset()
    },
    getState: () => selector(state1.getState(), state2.getState()),
    id: getId(),
    is: StateKeys.IS_SLICE,
    select(sliceSelector, isSame) {
      return select(useSliceState, sliceSelector, isSame)
    },
    merge(state3, selector3, isEqualHook) {
      return merge(useSliceState, state3, selector3, isEqualHook)
    },
  }

  const useSliceState: StateGetter<S> = (useSelector, isEqualHook) => {
    return useStateValue(useSliceState, useSelector, isEqualHook)
  }
  useSliceState.__internal = stateBase.__internal
  useSliceState.__tag = stateBase.__tag
  useSliceState.is = stateBase.is
  useSliceState.id = stateBase.id
  useSliceState.getState = stateBase.getState
  useSliceState.reset = stateBase.reset
  useSliceState.select = stateBase.select
  useSliceState.merge = stateBase.merge
  return useSliceState
}
