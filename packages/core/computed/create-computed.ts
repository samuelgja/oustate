import { createEmitter } from '../emitters/create-emitter'
import {
  IsSame,
  Key,
  StateDataInternal,
  StateInternal,
  StateKeys,
  SubscribeInternalParameters,
  SubscribeParameters,
  SubscribeParametersType,
  ComputedState,
  AtomState,
} from '../types/types'
import { getId, isPromise, toType } from '../utils/common'
import { getPromiseStatus } from '../utils/get-promise-status'
import { cancelablePromise } from '../utils/cancelable-promise'
import {
  GetSelectionOptions,
  GetState,
  InternalThrow,
  InternalThrowEnum,
  PromiseData,
  PromiseStatus,
} from '../types/computed-types'
import { computedSubscribe } from './computed-subscribe'
import { createAbortController } from '../utils/create-abort-controller'
import { clearComputedData, clearComputedPromiseData } from '../utils/computed-clears'

const isThrow = (message: unknown) => {
  const promise = toType<InternalThrow>(message)
  return isPromise(promise) && promise[InternalThrowEnum.IT_INTERNAL_THROW]
}
export interface ComputedOptions<T> {
  isSame?: IsSame<T>
  key?: Key
}

/**
 * Computed state is a state that depends on other states or other computed states.
 * It is recomputed when the states it depends on change.
 * **It can be also async**.
 * @example ```typescript
 * // global scope
 * const counterState = createState(0)
 * const userState = createState({ name: 'John', age: 20 })
 * const counterPlusUserAgeState = createComputed(
 *  ({get}) => get(counterState) + get(userState, (user) => user.age),
 * )
 *
 * // react scope
 * const counterPlusUser = useStateValue(counterPlusUserAgeState)
 * ```
 */
export const createComputed = <T>(
  getSelection: (options: GetSelectionOptions) => StateInternal<T> | Promise<StateInternal<T>>,
  options?: ComputedOptions<StateInternal<T>>,
): ComputedState<StateInternal<T>> => {
  type State = StateInternal<T>
  type AwaitedState = Awaited<State>
  type OnFinish = (options: { hasError: boolean; data: State | unknown }) => void

  let onFinishCallbacks: OnFinish[] = []

  const unsubscribeListeners = new Map<Key, () => void>()

  const { isSame } = options || {}
  const id = getId()
  const statesUpdateVersions = new Map<Key, number>()

  // DATA
  let promiseData = clearComputedPromiseData()

  let data: StateDataInternal<State> = clearComputedData(getSelection.constructor.name === 'AsyncFunction')

  // START LOADERS
  const startLoading = () => {
    if (promiseData.status === PromiseStatus.PENDING) {
      return
    }

    data.isResolving = true

    data.cached = new Promise((resolve, reject) => promiseData.promises.push({ resolve, reject })) as State
    promiseData.status = PromiseStatus.PENDING
    emitter.emit()
    promiseEmitter.emit()
  }

  // STOP ALL LOADERS
  const stopLoading = () => {
    const message: SubscribeInternalParameters = {
      type: SubscribeParametersType.CANCELED,
      is: StateKeys.IS_COMPUTED,
      stateId: id,
      updateVersion: data.updateVersion,
      isAsync: data.isAsync,
    }

    resolvePromises(message)
    data.isResolving = false
    data.cached = data.cachedAwaited
    promiseData.status = PromiseStatus.SUCCESS
    promiseEmitter.emit()
    emitter.emit()
  }

  // ON ERROR
  const onThrowError = (error: unknown) => {
    const message: SubscribeInternalParameters = {
      type: SubscribeParametersType.THROW,
      is: StateKeys.IS_COMPUTED,
      stateId: id,
      updateVersion: data.updateVersion,
      isAsync: data.isAsync,
      error,
    }

    data.isResolving = false
    rejectPromises(message.error)

    data.isResolving = false
    promiseData.status = PromiseStatus.ERROR
    promiseData.error = error
    emitterInternal.emit(message)
    promiseEmitter.emit()
    emitter.emit()
    resolveOnFinish({ hasError: true, data: error })
  }

  const resolveOnFinish = (data: { hasError: boolean; data: State | unknown }) => {
    for (let index = 0; index < onFinishCallbacks.length; index++) {
      onFinishCallbacks[index](data)
    }
    onFinishCallbacks = []
  }

  // ON DATA UPDATE
  const onUpdate = (options: { newState: State | Promise<State>; status: PromiseStatus; isSame?: boolean; isAsync: boolean }) => {
    const { newState, status, isSame, isAsync } = options

    if (!isSame) {
      data.updateVersion++
    }

    const message: SubscribeInternalParameters = {
      type: SubscribeParametersType.END,
      stateId: id,
      updateVersion: data.updateVersion,
      isAsync,
      is: StateKeys.IS_COMPUTED,
      prev: data.cachedAwaited,
      next: newState,
      isSame: isSame || false,
    }
    data.isResolving = false

    if (!isSame || data.cachedAwaited === undefined) {
      data.cachedAwaited = newState as AwaitedState
    }

    data.cached = data.cachedAwaited

    resolvePromises(message)
    subscribeEmitter.emit({ prev: message.prev as StateInternal<T>, next: message.next as StateInternal<T> })
    promiseData.status = status
    emitter.emit()
    promiseEmitter.emit()
    emitterInternal.emit(message)
    data.isInitialized = true
    resolveOnFinish({ hasError: false, data: data.cached })
  }

  // SUBSCRIBES

  const get: GetState = <T extends AtomState<any> | ComputedState<any>, S>(
    state: T,
    selectorFunction?: (value: T['__tag']) => S,
    isSame?: IsSame<S>,
  ): any => {
    const { is } = state
    const selector = selectorFunction ? selectorFunction : (value: T['__tag']) => value

    data.isResolvingStateId = state.id
    switch (is) {
      case StateKeys.IS_COMPUTED: {
        computedSubscribe({
          stateId: state.id,
          subscribe: state.__internal.__sub,
          data,
          emitterInternal,
          getData,
          statesUpdateVersions,
          unsubscribeListeners,
          isSame,
          selector,
          onThrowError,
          startLoading,
          stopLoading,
        })

        const snapshot = state.__internal.getSnapshot()

        switch (snapshot.status) {
          case PromiseStatus.PENDING: {
            const promise = toType<InternalThrow>(snapshot.promise)
            promise[InternalThrowEnum.IT_INTERNAL_THROW] = true
            throw promise
          }
          case PromiseStatus.SUCCESS: {
            return selector(snapshot.data)
          }
        }
        return
      }

      case StateKeys.IS_STATE_FAMILY:
      case StateKeys.IS_STATE: {
        computedSubscribe({
          stateId: state.id,
          subscribe: state.__internal.__sub,
          data,
          emitterInternal,
          getData,
          statesUpdateVersions,
          unsubscribeListeners,
          isSame,
          selector,
          onThrowError,
          startLoading,
          stopLoading,
        })

        const snapshot = state.__internal.getSnapshot()

        switch (snapshot.status) {
          case PromiseStatus.PENDING: {
            const promise = toType<InternalThrow>(snapshot.promise)
            promise[InternalThrowEnum.IT_INTERNAL_THROW] = true

            throw promise
          }
          case PromiseStatus.SUCCESS: {
            return selector(snapshot.data)
          }
        }
        return
      }

      default:
        return null
    }
  }

  // PROMISES
  const resolvePromises = (message: SubscribeInternalParameters) => {
    for (let index = 0; index < promiseData.promises.length; index++) {
      promiseData.promises[index].resolve(message)
    }
    promiseData.promises = []
  }

  const rejectPromises = (message: unknown) => {
    for (let index = 0; index < promiseData.promises.length; index++) {
      promiseData.promises[index].reject(message)
    }
    promiseData.promises = []
  }

  // UTILS

  const isDataSame = (prev: State, next: State) => {
    if (isSame?.(prev, next)) {
      return true
    }
    return prev === next
  }

  // MAIN GET DATA
  const resolveSelection = (onFinish?: OnFinish) => {
    // FOR ASYNC

    if (data.isAsync) {
      createAbortController(promiseData)

      emitterInternal.emit({
        is: StateKeys.IS_COMPUTED,
        stateId: id,
        type: SubscribeParametersType.START,
        updateVersion: data.updateVersion,
        isAsync: true,
      })
      let isCanceled = false
      const onThrow = () => {
        isCanceled = true
      }

      promiseData.abortController!.signal.removeEventListener('abort', onThrow)
      promiseData.abortController!.signal.addEventListener('abort', onThrow)

      const newState = getSelection({
        get,
        abortSignal: promiseData.abortController?.signal,
        isCanceled: () => isCanceled,
        key: options?.key,
      })

      startLoading()
      if (isPromise(newState)) {
        const promiseValue = cancelablePromise(toType<Promise<State>>(newState), promiseData.abortController!)
        promiseData.cancel = promiseValue.cancel
        promiseValue.promise
          .then((newState) => {
            if (isDataSame(data.cachedAwaited, newState)) {
              onUpdate({ newState, status: PromiseStatus.SUCCESS, isSame: true, isAsync: true })
              onFinish?.({ hasError: false, data: data.cachedAwaited })

              return
            }

            onUpdate({ newState, status: PromiseStatus.SUCCESS, isAsync: true })
            onFinish?.({ hasError: false, data: newState })
          })
          .catch((error) => {
            if (error.isCanceled) {
              onFinish?.({ hasError: false, data: data.cachedAwaited })
              return
            }
            const isThrow = resolveInternalThrow(error, onFinish)
            if (isThrow) {
              return
            }

            onThrowError(error)
            onFinish?.({ hasError: true, data: error })

            throw new Error(error)
          })
      }
      return
    }

    // FOR NORMAL
    try {
      const newState = getSelection({
        get,
        abortSignal: promiseData.abortController?.signal,
        isCanceled: () => false,
        key: options?.key,
      })

      data.isDead = false

      if (!isPromise(newState) && isDataSame(data.cachedAwaited, toType<State>(newState))) {
        onUpdate({ newState, status: PromiseStatus.SUCCESS, isSame: true, isAsync: false })
        onFinish?.({ hasError: false, data: data.cachedAwaited })

        return
      }

      onUpdate({ newState, status: PromiseStatus.SUCCESS, isAsync: false })
      onFinish?.({ hasError: false, data: newState })

      return newState
    } catch (error: any) {
      const isThrow = resolveInternalThrow(error, onFinish)

      if (isThrow) {
        return
      }
      onFinish?.({ hasError: true, data: error })
      onThrowError(error)
      throw new Error(error?.message)
    }
  }

  const getData = () => {
    data.isDead = false
    return resolveSelection()
  }

  const resolveInternalThrow = (message: unknown, onFinish?: OnFinish) => {
    const promise = toType<InternalThrow>(message)
    startLoading()

    if (isThrow(promise)) {
      promise?.then((resolvedInfo: SubscribeInternalParameters) => {
        statesUpdateVersions.set(resolvedInfo.stateId, resolvedInfo.updateVersion)

        resolveSelection(onFinish)
      })

      return true
    }
    return false
  }

  // GET SNAPSHOTS
  const getPromiseSnapshot = () => promiseData
  const getInternalSnapshot = () => {
    if (data.isDead) {
      getData()
    }
    return getPromiseStatus({ data, promiseData }, data.isResolving || data.cachedAwaited === undefined)
  }

  const getStateSnapshot = () => {
    if (data.isDead) {
      getData()
    }
    // need to use assertion here - cuz cached can be promise / or state, but user will always see state
    return data.cached as AwaitedState
  }

  // EMITTERS

  type SubParameter = SubscribeParameters<State>
  const emitter = createEmitter<State, AwaitedState>(getStateSnapshot)
  const cacheEmitter = createEmitter<State, AwaitedState>(getStateSnapshot)
  const promiseEmitter = createEmitter<PromiseData>(getPromiseSnapshot)
  const emitterInternal = createEmitter<State, State, SubscribeInternalParameters>()
  const subscribeEmitter = createEmitter<State, AwaitedState, SubParameter>()

  // HOOK

  // this will cause loading on get data...
  const getPromiseData = (): Promise<AwaitedState> => {
    if (data.isDead) {
      data.isDead = false
      return new Promise((resolve, reject) => {
        resolveSelection((data) => {
          if (data.hasError) {
            return reject(data.data)
          }
          return resolve(data.data as AwaitedState)
        })
      })
    }

    return new Promise((resolve, reject) => {
      if (!data.isResolving) {
        return resolve(data.cachedAwaited)
      }

      onFinishCallbacks.push((data) => {
        if (data.hasError) {
          return reject(data.data)
        }
        return resolve(data.data as AwaitedState)
      })
    })
  }

  const clear = () => {
    for (let index = 0; index < promiseData.promises.length; index++) {
      const promise = promiseData.promises[index]
      promise.reject(null)
    }
    promiseData = clearComputedPromiseData()
    data = clearComputedData(getSelection.constructor.name === 'AsyncFunction')
  }

  return {
    __tag: undefined as AwaitedState,
    id: id,
    is: StateKeys.IS_COMPUTED,
    getState: getPromiseData,
    subscribe: subscribeEmitter.subscribe,
    clear,
    __internal: {
      getSnapshot: getInternalSnapshot,
      __emitter: emitter,
      __cacheEmitter: cacheEmitter,
      __sub: emitterInternal.subscribe,
      __promiseEmitter: promiseEmitter,
    },
  }
}
