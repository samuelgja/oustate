import { CommonFunctions, Family, FamilySubscribe, Key, StateInternal, SubscribeFamilyParameters } from '../types/types'
import { getId } from '../utils/common'
/**
 * Create family internal function - used for create `stateFamily` and `computedFamily`
 */
export const createFamily = <S extends StateInternal<unknown>, P extends CommonFunctions<S>>(
  getFamily: (family: Map<Key, P>, key: Key) => P,
): Family<S, P> => {
  const id: Key = getId()
  type State = S
  const family = new Map<Key, P>()
  const listeners: Set<(parameter: SubscribeFamilyParameters<State>) => void> = new Set()

  const addSubscribe = (state: P, key: Key, listener: (parameter: SubscribeFamilyParameters<State>) => void) => {
    return state.subscribe(({ next, prev }) => {
      listener({ next, prev, key })
    })
  }

  const subscribe: FamilySubscribe<State> = (key: Key, listener) => {
    listeners.add(listener)

    let unsubscribeList: Array<() => void> = []

    if (key) {
      const state = getFamily(family, key)
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

  const get = (key: Key) => {
    const state = getFamily(family, key)
    return state
  }

  const clear = () => {
    for (const [, state] of family) {
      state.clear()
    }
    family.clear()
  }
  get.subscribe = subscribe
  get.clear = clear
  get.id = id

  return get
}
