import { PromiseStatus } from '../types/computed-types'
import { AtomState, IsSame, StateInternal } from '../types/types'
import { createState } from './create-state'

export interface CreateSyncStateOptions<T> {
  /**
   * On set new state value
   */
  onSet?: (newValue: StateInternal<T>) => void
  /**
   * On load state
   */
  onLoad?: () => StateInternal<T>
  /**
   * On snapshot state
   */
  onSnapshot: (snapshot: (newValue: StateInternal<T>) => void) => void
  /**
   * Checking is state value is same - can be useful to avoid unnecessary rerenders - but it's not recommended to use it
   */
  isSame?: IsSame<StateInternal<T>>
}
/**
 * Creating of sync state - it's useful when need to sync state between external sources (like chat, realtime-messages, etc...).
 * @param options
 * @returns
 * @example ```typescript
 * const chatState = createSyncState({
 *  onLoad: () => {
 *    // load state from external source
 *    return { messages: [] }
 *  },
 *  onSet: (newValue) => {
 *
 *  },
 *  onSnapshot: (snapshot) => {
 *    // subscribe to external source
 *  }
 * })
 * ```
 */
export const createSyncState = <T>(options: CreateSyncStateOptions<T>): AtomState<StateInternal<T>> => {
  const { onSet, isSame, onLoad, onSnapshot } = options

  let resolveOnLoad: ((value: null) => void) | null = null
  const initialValue = new Promise((resolve) => {
    resolveOnLoad = resolve
  })

  const state = createState(initialValue as StateInternal<T>, {
    isSame,
    onSet: (oldValue, getValue) => {
      const newValue = getValue(oldValue)
      if (onSet && !isSame?.(oldValue, newValue)) {
        onSet(newValue)
      }
      return newValue
    },
  })

  const setPromiseStatus = state.__internal.__promiseSetter
  setPromiseStatus(PromiseStatus.PENDING)
  onSnapshot?.(async (snapshot) => {
    const oldState = state.get()
    if (isSame?.(oldState, snapshot) || oldState === snapshot) {
      return
    }
    state.set(snapshot)
    if (resolveOnLoad !== null) {
      state.__internal.resolvePromises(snapshot)
      setPromiseStatus(PromiseStatus.SUCCESS)
      resolveOnLoad(null)
      resolveOnLoad = null
    }
  })
  if (onLoad) {
    state.set(onLoad())
  }

  return state
}
