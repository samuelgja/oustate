import { Key, StateInternal, ComputedFamilyState, ComputedState } from '../types/types'
import { ComputedOptions, createComputed } from './create-computed'
import { GetSelectionOptions } from '../types/computed-types'
import { createFamily } from '../family/create-family'

type GetSelectionFamily = GetSelectionOptions<{ key: Key }>

/**
 * Create computed family - same as state family - but for computed.
 *
 * @example ```typescript
 * // global scope
 * const counterState = createState(0)
 * const userState = createState({ name: 'John', age: 20 })
 * const counterPlusUserAgeState = createComputed(
 *  ({get}) => get(counterState) + get(userState, (user) => user.age),
 * )
 *
 * // react scope
 * const counterPlusUser = useStateValue(counterPlusUserAgeState('key'))
 * ```
 */
export const createComputedFamily = <T>(
  getSelection: (options: GetSelectionFamily) => StateInternal<T> | Promise<StateInternal<T>>,
  options?: ComputedOptions<StateInternal<T>>,
): ComputedFamilyState<StateInternal<T>> => {
  type State = StateInternal<T>
  const state = createFamily<State, ComputedState<State>>((family, key) => {
    let state = family.get(key)
    if (!state) {
      const familyOptions: ComputedOptions<StateInternal<T>> = { ...options, key }
      state = createComputed(getSelection as any, familyOptions)
      family.set(key, state)
    }
    return state
  })

  return state
}
