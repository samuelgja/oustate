import { Key, StateInternal, FamilySubscribe, SubscribeFamilyParameters, ComputedFamilyState, ComputedState } from '../types'
import { getId } from '../utils/common'
import { ComputedOptions, createComputed } from './create-computed'
import { GetSelectionOptions } from './computed-types'

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
  const id: Key = getId()
  type State = StateInternal<T>
  const family = new Map<Key, ComputedState<StateInternal<T>>>()
  const listeners: Set<(parameter: SubscribeFamilyParameters<StateInternal<T>>) => void> = new Set()

  const getFamily = (key: Key): ComputedState<StateInternal<T>> => {
    let state = family.get(key)
    if (!state) {
      const familyOptions: ComputedOptions<StateInternal<T>> = { ...options, key }
      state = createComputed(getSelection as any, familyOptions)
      family.set(key, state)
    }
    return state
  }

  const addSubscribe = (
    state: ComputedState<State>,
    key: Key,
    listener: (parameter: SubscribeFamilyParameters<State>) => void,
  ) => {
    return state.subscribe(({ next, prev }) => {
      listener({ next, prev, key })
    })
  }

  const subscribe: FamilySubscribe<State> = (key: Key, listener) => {
    listeners.add(listener)

    let unsubscribeList: Array<() => void> = []

    if (key) {
      const state = getFamily(key)
      unsubscribeList.push(addSubscribe(state, key, listener))
    } else {
      for (const [key, state] of family) {
        unsubscribeList.push(addSubscribe(state, key, listener))
      }
    }
    return () => {
      for (const unsubscribe of unsubscribeList) {
        unsubscribe()
      }
      listeners.delete(listener)
    }
  }

  const getState: ComputedFamilyState<StateInternal<T>> = (key: Key) => {
    const state = getFamily(key)
    return state
  }
  getState.subscribe = subscribe
  getState.clear = family.clear
  getState.id = id

  return getState
}
