import { PromiseStatus } from '../computed/computed-types'
import { AtomState, IsSame, StateInternal, StateOutputKeys } from '../types'
import { createState } from './create-state'

export const createSyncState = <T>(options: {
  onSet?: (newValue: StateInternal<T>) => void
  onLoad?: () => StateInternal<T>
  onSnapshot: (snapshot: (newValue: StateInternal<T>) => void) => void
  isSame?: IsSame<StateInternal<T>>
}): AtomState<StateInternal<T>> => {
  const { onSet, isSame, onLoad, onSnapshot } = options

  let resolveOnLoad: ((value: null) => void) | null = null
  const initialValue = new Promise((resolve) => {
    resolveOnLoad = resolve
  })

  const state = createState(initialValue as StateInternal<T>, {
    isSame,
    onSet: (oldValue, getValue) => {
      const newValue = getValue()
      if (onSet && !isSame?.(oldValue, newValue)) {
        onSet(newValue)
      }
      return newValue
    },
  })

  const setPromiseStatus = state[StateOutputKeys.INTERNAL][StateOutputKeys.PROMISE_SETTER]
  setPromiseStatus(PromiseStatus.PENDING)
  onSnapshot?.(async (snapshot) => {
    const oldState = state.getState()
    if (isSame?.(oldState, snapshot) || oldState === snapshot) {
      return
    }
    state.setState(snapshot)
    if (resolveOnLoad !== null) {
      state[StateOutputKeys.INTERNAL].resolvePromises(snapshot)
      setPromiseStatus(PromiseStatus.SUCCESS)
      resolveOnLoad(null)
      resolveOnLoad = null
    }
  })
  if (onLoad) {
    state.setState(onLoad())
  }

  return state
}
