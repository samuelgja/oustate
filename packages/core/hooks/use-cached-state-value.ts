import { PromiseStatus } from '../computed/computed-types'
import { IsSame, StateAll } from '../types'
import { syncExternalStore, toType } from '../utils/common'

export interface CachedState<T, S> {
  data: undefined extends S ? T : S
  isLoading: boolean
}

/**
 * useCachedStateValue Hook.
 * On first load it triggers suspense but after second load it will return cached value & loading status.
 *
 * @param state - state value
 * @param selector - selector function (useStateValue(state, (state) => state.value)) - it return only selected value, selector don't need to be memoized.
 * @param isEqual - equality check function for selector
 * @returns StateValue from selector if provided, otherwise whole state
 */
export const useCachedStateValue = <T, S>(
  state: StateAll<T>,
  selector: (stateValue: T) => S = (stateValue) => toType<S>(stateValue),
  isEqual?: IsSame<S>,
): CachedState<T, S> => {
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

  const cachedData = syncExternalStore(
    state.__internal.__cacheEmitter,
    (stateValue) => {
      if (promiseData.status === PromiseStatus.PENDING) {
        return toType<S>(stateValue)
      }
      return selector(stateValue)
    },
    isEqual,
  )

  if (promiseData.status === PromiseStatus.PENDING) {
    if (cachedData) {
      return { data: cachedData, isLoading: true }
    }
    throw data
  } else if (promiseData.status === PromiseStatus.ERROR) {
    throw promiseData.error
  } else {
    return { data, isLoading: false }
  }
}
