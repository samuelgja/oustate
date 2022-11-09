import { createState } from './create-state'
import { StateInternal, StateOptions, AtomFamily, AtomState } from '../types/types'
import { createFamily } from '../family/create-family'

/**
 * Create atom family state. It's same as createState but instead of return `AtomState` it returns `AtomFamily`.
 * `AtomFamily` is function that accepts `key` and returns `AtomState`.
 * @param defaultState - any value
 * @param options - optional options for state (isSame, onSet)
 * @returns AtomFamily
 * @example ```typescript
 * // global scope
 * const counterState = createStateFamily(0)
 * const userState = createStateFamily({ name: 'John', age: 20 })
 *
 * // react scope
 * const counter = useStateValue(counterState('key'))
 * const user = useStateValue(userState('key'))
 * ```
 */
export const createStateFamily = <T>(
  defaultState: StateInternal<T>,
  options?: StateOptions<StateInternal<T>>,
): AtomFamily<StateInternal<T>> => {
  type State = StateInternal<T>
  const state = createFamily<State, AtomState<State>>((family, key) => {
    let state = family.get(key)
    if (!state) {
      state = createState(defaultState, options)
      family.set(key, state)
    }

    return state
  })

  return state
}
