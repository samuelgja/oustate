import { createEmitter } from '../emitters/create-emitter'
import { PromiseData, PromiseStatus } from '../types/computed-types'
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
  StateDataInternal,
} from '../types/types'
import { getId } from '../utils/common'
import { getPromiseStatus } from '../utils/get-promise-status'

/**
 * Creating of basic atom state.
 * @param defaultState - any value
 * @param options - optional options for state (isSame, onSet)
 * @returns AtomState
 * @example ```typescript
 * // global scope
 * const counterState = createState(0)
 * const userState = createState({ name: 'John', age: 20 })
 *
 * // react scope
 * const counter = useStateValue(counterState)
 * const user = useStateValue(userState)
 * // when need just partial data from state, it can be sliced (slice don't need to be memoized - check docs)
 * const userAge = useStateValue(userState, (state) => state.age) // this will help to avoid unnecessary re-renders
 * ```
 */
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
    __tag: undefined as State,
    id: id,
    is: StateKeys.IS_STATE,
    getState: getState,
    setState: setState,
    clear: () => setState(defaultState),
    subscribe: subscribeEmitter.subscribe,
    __internal: {
      getSnapshot: getInternalSnapshot,
      __sub: emitterInternal.subscribe,
      resolvePromises: resolvePromises,
      __emitter: emitter,
      __cacheEmitter: emitter,
      __promiseEmitter: promiseEmitter,
      __promiseSetter: setStatusData,
    },
  }
}
