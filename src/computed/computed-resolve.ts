import { Emitter } from '../emitters/create-emitter'
import {
  Key,
  OnFinish,
  StateDataInternal,
  StateInternal,
  StateKeys,
  SubscribeInternalParameters,
  SubscribeParametersType,
} from '../types'
import { cancelablePromise } from '../utils/cancelable-promise'
import { isPromise, toType } from '../utils/common'
import { createAbortController } from '../utils/create-abort-controller'
import { GetState, InternalThrow, InternalThrowEnum, PromiseData, PromiseStatus } from './computed-types'

interface ResolveOptions<T> {
  data: StateDataInternal<StateInternal<T>, Awaited<StateInternal<T>>>
  emitterInternal: Emitter<StateInternal<T>, StateInternal<T>, SubscribeInternalParameters>
  promiseData: PromiseData
  id: Key
  statesUpdateVersions: Map<Key, number>
  message?: unknown
  startLoading: () => void
  onThrowError: (error: unknown) => void
  onFinish?: OnFinish<T>
  onUpdate: (options: OnUpdateOptions<T>) => void
  isDataSame: (prev: T, next: T) => boolean
  getSelection: (options: {
    get: GetState
    abortSignal?: AbortSignal
    isCanceled: () => boolean
  }) => StateInternal<T> | Promise<StateInternal<T>>
  get: GetState
}
export interface OnUpdateOptions<T> {
  newState: T | Promise<T>
  status: PromiseStatus
  isSame?: boolean
  isAsync: boolean
}

const isThrow = (message: unknown) => {
  const promise = toType<InternalThrow>(message)
  return isPromise(promise) && promise[InternalThrowEnum.IT_INTERNAL_THROW]
}

const resolveInternalThrow = <T>(options: ResolveOptions<T>) => {
  const { message, startLoading, statesUpdateVersions } = options
  const promise = toType<InternalThrow>(message)
  startLoading()

  if (isThrow(promise)) {
    promise?.then((resolvedInfo: SubscribeInternalParameters) => {
      statesUpdateVersions.set(resolvedInfo.stateId, resolvedInfo.updateVersion)

      resolveSelection(options)
    })

    return true
  }
  return false
}

export const resolveSelection = <T>(options: ResolveOptions<T>) => {
  const {
    data,
    emitterInternal,
    promiseData,
    id,
    startLoading,
    onThrowError,
    onUpdate,
    isDataSame,
    onFinish,
    getSelection,
    get,
  } = options
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
    })

    startLoading()
    if (isPromise(newState)) {
      const promiseValue = cancelablePromise(toType<Promise<T>>(newState), promiseData.abortController!)
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
          const isThrow = resolveInternalThrow(options)
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
    })

    data.isDead = false

    if (!isPromise(newState) && isDataSame(data.cachedAwaited, toType<T>(newState))) {
      onUpdate({ newState, status: PromiseStatus.SUCCESS, isSame: true, isAsync: false })
      onFinish?.({ hasError: false, data: data.cachedAwaited })

      return
    }

    onUpdate({ newState, status: PromiseStatus.SUCCESS, isAsync: false })
    onFinish?.({ hasError: false, data: newState })

    return newState
  } catch (error: any) {
    const isThrow = resolveInternalThrow(options)

    if (isThrow) {
      return
    }
    onFinish?.({ hasError: true, data: error })
    onThrowError(error)
    throw new Error(error?.message)
  }
}
