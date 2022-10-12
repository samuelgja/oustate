import { createEmitter } from '../emitters/create-emitter'
import { PromiseData, PromiseStatus } from '../computed/computed-types'
import {
  GetState,
  SetState,
  SetStateValue,
  StateInternal,
  StateKeys,
  StateOptions,
  SubscribeInternalParameters,
  SubscribeParameters,
  SubscribeParametersType,
  AtomState,
  StateOutputKeys,
  StateDataInternal,
} from '../types'
import { getId } from '../utils/common'
import { getPromiseStatus } from '../utils/get-promise-status'

export const createState = <T>(
  defaultState: StateInternal<T>,
  options?: StateOptions<StateInternal<T>>,
): AtomState<StateInternal<T>> => {
  const id = getId()
  type State = StateInternal<T>
  const { isSame, onSet } = options || {}
  let getSetStateValue = (state: SetStateValue<State>): State => {
    if (typeof state === 'function') {
      return (state as any)(data.cachedAwaited)
    }
    return state
  }

  let prepareState = (data: State) => {
    return data
  }

  if (onSet) {
    getSetStateValue = (state: SetStateValue<State>): State => {
      if (typeof state === 'function') {
        return onSet(data.cachedAwaited, () => {
          return (state as any)(data.cachedAwaited)
        })
      }
      return onSet(data.cachedAwaited, () => {
        return state
      })
    }

    prepareState = (data: State) => {
      return onSet(data, () => {
        return data
      })
    }
  }

  const preparedState = prepareState(defaultState)
  const data: StateDataInternal<State, State> = {
    updateVersion: 0,
    cachedAwaited: preparedState,
    isInitialized: true,
    isResolving: false,
  }

  const getState: GetState<State> = () => {
    return data.cachedAwaited
  }

  const promiseData: PromiseData = {
    status: PromiseStatus.SUCCESS,
    error: null,
    promises: [],
  }
  const emitter = createEmitter<State>(getState)
  const emitterInternal = createEmitter<State, State, SubscribeInternalParameters>(getState)
  const subscribeEmitter = createEmitter<State, State, SubscribeParameters<State>>()
  const promiseEmitter = createEmitter<PromiseData>(() => promiseData)

  const setState: SetState<State> = (stateValue) => {
    const newState = getSetStateValue(stateValue)

    const isEqual = isSame?.(data.cachedAwaited, newState)
    if (isEqual) {
      return
    } else if (data.cachedAwaited === newState) {
      return
    }

    data.updateVersion++

    const prev = data.cachedAwaited
    data.cachedAwaited = newState
    subscribeEmitter.emit({ prev, next: newState })
    emitterInternal.emit({
      type: SubscribeParametersType.END,
      stateId: id,
      updateVersion: data.updateVersion,
      isAsync: false,
      is: StateKeys.IS_STATE,
      prev: prev,
      next: newState,
      isSame: isEqual || false,
    })

    emitter.emit()
  }

  const setStatusData = (status: PromiseStatus) => {
    promiseData.status = status
    promiseEmitter.emit()
  }

  const getInternalSnapshot = () => {
    return getPromiseStatus<State, State>({ data, promiseData }, promiseData.status === PromiseStatus.PENDING)
  }

  const resolvePromises = (newData: State) => {
    const message: SubscribeInternalParameters = {
      type: SubscribeParametersType.END,
      stateId: id,
      updateVersion: data.updateVersion,
      isAsync: true,
      is: StateKeys.IS_STATE,
      prev: data.cachedAwaited,
      next: newData,
      isSame: false,
    }
    for (let index = 0; index < promiseData.promises.length; index++) {
      promiseData.promises[index].resolve(message)
    }
    promiseData.promises = []
  }

  return {
    [StateOutputKeys.TYPE]: undefined as State,
    [StateOutputKeys.ID]: id,
    [StateOutputKeys.IS]: StateKeys.IS_STATE,
    [StateOutputKeys.GET]: getState,
    [StateOutputKeys.SET]: setState,
    [StateOutputKeys.CLEAR]: () => setState(defaultState),
    [StateOutputKeys.SUBSCRIBE]: subscribeEmitter.subscribe,
    [StateOutputKeys.INTERNAL]: {
      [StateOutputKeys.GET_SNAPSHOT]: getInternalSnapshot,
      [StateOutputKeys.SUBSCRIBE_INTERNAL]: emitterInternal.subscribe,
      resolvePromises: resolvePromises,
      [StateOutputKeys.SUBSCRIBE_INTERNAL]: emitterInternal.subscribe,
      [StateOutputKeys.EMITTER]: emitter,
      [StateOutputKeys.CACHE_EMITTER]: emitter,
      [StateOutputKeys.PROMISE_EMITTER]: promiseEmitter,
      [StateOutputKeys.PROMISE_SETTER]: setStatusData,
    },
  }
}
