import { PromiseStatus } from '../types/computed-types'
import { IsSame, StateAll } from '../types/types'
import { toType } from '../utils/common'
import { useLoadableStateValue } from './use-loadable-state-value'

/**
 * useCachedStateValue Hook.
 * Hook for use state inside react scope. If the state is async - component need to be wrapped with Suspense.
 * For more control over async states use `useLoadableStateValue` hook which provide loading status of the state instead of throwing the hook into the suspense.
 *
 * @param state - state value
 * @param selector - selector function (useStateValue(state, (state) => state.value)) - it return only selected value, selector don't need to be memoized.
 * @param isEqual - equality check function for selector
 * @returns StateValue from selector if provided, otherwise whole state
 */
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
