import { Emitter } from '../emitters/create-emitter'
import {
  IsSame,
  StateDataInternal,
  StateInternal,
  SubscribeInternal,
  SubscribeParametersType,
  Key,
  SubscribeInternalParameters,
} from '../types/types'
import { toType } from '../utils/common'

/**
 * Subscribe to the computed state - it's used for internal purposes.
 */
export const computedSubscribe = <T, S>(options: {
  unsubscribeListeners: Map<Key, () => void>
  stateId: Key
  subscribe: SubscribeInternal
  selector: (value: S) => S
  isSame: IsSame<S> | undefined
  startLoading: () => void
  onThrowError: (error: unknown) => void
  stopLoading: () => void
  getData: () => StateInternal<T> | Promise<StateInternal<T>> | undefined
  emitterInternal: Emitter<StateInternal<T>, StateInternal<T>, SubscribeInternalParameters>
  statesUpdateVersions: Map<Key, number>
  data: StateDataInternal<StateInternal<T>, Awaited<StateInternal<T>>>
}) => {
  const {
    isSame,
    selector,
    stateId,
    subscribe,
    unsubscribeListeners,
    onThrowError,
    startLoading,
    stopLoading,
    statesUpdateVersions,
    data,
    getData,
    emitterInternal,
  } = options
  if (unsubscribeListeners.has(stateId)) {
    return
  }
  unsubscribeListeners.set(
    stateId,
    subscribe((message) => {
      switch (message.type) {
        case SubscribeParametersType.THROW: {
          onThrowError(message.error)
          return
        }
        case SubscribeParametersType.START: {
          if (!message.isAsync) {
            return
          }

          startLoading()

          if (!data.isInitialized) {
            return
          }
          break
        }
        case SubscribeParametersType.END: {
          if (message.isSame) {
            stopLoading()
            return
          }

          const isParent = message.stateId === stateId
          if (isParent && (!data.isResolving || data.isResolvingStateId !== stateId)) {
            const previousSelected = selector(toType<S>(message.prev))
            const nextSelected = selector(toType<S>(message.next))

            if (isSame?.(previousSelected, nextSelected)) {
              stopLoading()
              return
            } else if (previousSelected === nextSelected) {
              stopLoading()
              return
            }
          }

          const myUpdateVersion = statesUpdateVersions.get(stateId) || 0

          // check if its parent...
          if (isParent && myUpdateVersion !== message.updateVersion) {
            getData()
          } else if (message.isAsync) {
            startLoading()
          } else if (message.isAsync === false) {
            return
          }

          break
        }
      }
      statesUpdateVersions.set(message.stateId, message.updateVersion)
      emitterInternal.emit(message)
    }),
  )
}
