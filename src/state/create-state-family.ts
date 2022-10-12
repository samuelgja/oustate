import { createState } from './create-state'
import { Key, StateInternal, StateOptions, AtomFamily, FamilySubscribe, SubscribeFamilyParameters, AtomState } from '../types'
import { getId } from '../utils/common'

export const createStateFamily = <T>(
  defaultState: StateInternal<T>,
  options?: StateOptions<StateInternal<T>>,
): AtomFamily<StateInternal<T>> => {
  const id: Key = getId()
  type State = StateInternal<T>
  const family = new Map<Key, AtomState<StateInternal<T>>>()
  const listeners: Set<(parameter: SubscribeFamilyParameters<StateInternal<T>>) => void> = new Set()

  const getFamily = (key: Key): AtomState<StateInternal<T>> => {
    let state = family.get(key)
    if (!state) {
      state = createState(defaultState, options)
      family.set(key, state)
    }
    return state
  }

  const addSubscribe = (state: AtomState<State>, key: Key, listener: (parameter: SubscribeFamilyParameters<State>) => void) => {
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
  const clear = () => {
    for (const [, state] of family) {
      state.clear()
    }
    family.clear()
  }

  const getState: AtomFamily<StateInternal<T>> = (key: Key) => {
    const state = getFamily(key)
    return state
  }
  getState.subscribe = subscribe
  getState.clear = clear
  getState.id = id

  return getState
}
