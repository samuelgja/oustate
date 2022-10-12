import { PromiseStatus } from '../computed/computed-types'
import { IsSame, StateAll } from '../types'
import { toType } from '../utils/common'
import { useLoadableStateValue } from './use-loadable-state-value'

export const useStateValue = <T, S>(
  state: StateAll<T>,
  selector: (stateValue: T) => S = (stateValue) => toType<S>(stateValue),
  isEqual?: IsSame<S>,
): undefined extends S ? T : S => {
  const { data, status, error } = useLoadableStateValue(state, selector, isEqual)

  if (status === PromiseStatus.PENDING) {
    throw data
  } else if (status === PromiseStatus.ERROR) {
    throw error
  } else {
    return data
  }
}
