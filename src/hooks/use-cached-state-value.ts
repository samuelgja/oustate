import { PromiseStatus } from '../computed/computed-types'
import { IsSame, StateAll, StateOutputKeys } from '../types'
import { syncExternalStore, toType } from '../utils/common'

export interface CachedState<T, S> {
  data: undefined extends S ? T : S
  isLoading: boolean
}

export const useCachedStateValue = <T, S>(
  state: StateAll<T>,
  selector: (stateValue: T) => S = (stateValue) => toType<S>(stateValue),
  isEqual?: IsSame<S>,
): CachedState<T, S> => {
  const promiseData = syncExternalStore(state[StateOutputKeys.INTERNAL][StateOutputKeys.PROMISE_EMITTER], (s) => s)

  const data = syncExternalStore(
    state[StateOutputKeys.INTERNAL][StateOutputKeys.EMITTER],
    (stateValue) => {
      if (promiseData.status === PromiseStatus.PENDING) {
        return toType<S>(stateValue)
      }
      return selector(stateValue)
    },
    isEqual,
  )

  const cachedData = syncExternalStore(
    state[StateOutputKeys.INTERNAL][StateOutputKeys.CACHE_EMITTER],
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
