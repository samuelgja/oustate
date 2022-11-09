import { PromiseStatus } from '../computed/computed-types'
import { IsSame, StateAll } from '../types'
import { syncExternalStore, toType } from '../utils/common'

export interface StateLoadable<T, S> {
  data: undefined extends S ? T : S
  status: PromiseStatus
  error?: any
}

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
