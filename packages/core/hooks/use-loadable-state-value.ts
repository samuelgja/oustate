import { PromiseStatus } from '../computed/computed-types'
import { IsSame, StateAll } from '../types'
import { syncExternalStore, toType } from '../utils/common'

export interface StateLoadable<T, S> {
  data: undefined extends S ? T : S
  status: PromiseStatus
  error?: any
}

/**
 * useLoadableStateValue Hook.
 * When need more control over async states. Instead of throwing the hook into the suspense it will return loading status of the state.
 *
 * @param state - state value
 * @param selector - selector function (useStateValue(state, (state) => state.value)) - it return only selected value, selector don't need to be memoized.
 * @param isEqual - equality check function for selector
 * @returns StateValue from selector if provided, otherwise whole state
 */
export const useLoadableStateValue = <T, S>(
  state: StateAll<T>,
  selector: (stateValue: T) => S = (stateValue) => toType<S>(stateValue),
  isEqual?: IsSame<S>,
): StateLoadable<T, S> => {
  const promiseData = syncExternalStore(state.__internal.__promiseEmitter, (s) => s)

  const data = syncExternalStore(
    state.__internal.__emitter,
    (stateValue) => {
      if (promiseData.status === PromiseStatus.PENDING) {
        return toType<S>(stateValue)
      }
      return selector(stateValue)
    },
    isEqual,
  )
  return { data, status: promiseData.status, error: promiseData.error }
}
