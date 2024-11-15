import { getId } from './common'
import { createEmitter } from './create-emitter'
import { merge } from './merge'
import type { IsEqual, StateBase, StateGetter } from './types'
import { StateKeys } from './types'
import { useStateValue } from './use-state-value'

export function select<T, S>(
  state: StateGetter<T>,
  selector: (value: T) => S,
  isEqual: IsEqual<S> = () => false,
): StateGetter<S> {
  let previousData: S | undefined
  const emitter = createEmitter(() => {
    const data = selector(state.getState())
    if (previousData !== undefined && isEqual(previousData, data)) {
      return previousData
    }
    previousData = data
    return data
  })
  state.__internal.emitter.subscribe(() => {
    emitter.emit()
  })

  const stateBase: StateBase<S> = {
    __internal: {
      emitter,
    },
    __tag: undefined as S,
    reset: () => {},
    getState: () => selector(state.getState()),
    id: getId(),
    is: StateKeys.IS_SLICE,
    select(sliceSelector, isSame) {
      return select(useSliceState, sliceSelector, isSame)
    },
    merge(state2, selector2, isEqualHook) {
      return merge(useSliceState, state2, selector2, isEqualHook)
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
