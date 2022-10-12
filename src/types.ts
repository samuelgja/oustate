import { Emitter, EmitterSubscribe } from './emitters/create-emitter'
import { PromiseData, PromiseStatus } from './computed/computed-types'

export type Key = string | number | symbol
export type IsSame<T = unknown> = (a: T, b: T) => boolean
export type Primitive = string | number | boolean | bigint | symbol | null | undefined
export type OnFinish<T> = (options: { hasError: boolean; data: T | unknown }) => void
export type StateInternal<T> = T extends Record<Key, unknown> ? T : T
export interface StateOptions<T> {
  isSame?: IsSame<T>
  onSet?: (oldValue: T, setStateCallback: () => T) => T
}

export type SetStateValue<T> = ((value: T) => T) | T
export type StateValue<T, S> = undefined extends S ? T : S
export type SetState<T> = (state: SetStateValue<T>) => void
export type GetState<T> = () => T

export type FamilySubscribe<T> = (key: Key, listener: (parameter: SubscribeFamilyParameters<T>) => void) => void
export interface SubscribeParameters<T = unknown> {
  prev: T
  next: T
}

export interface SubscribeFamilyParameters<T> extends SubscribeParameters<T> {
  key: Key
}

export enum SubscribeParametersType {
  END = 'end',
  CANCELED = 'canceled',
  THROW = 'throw',
  START = 'start',
}
export interface SubscribeParametersMessage {
  type: SubscribeParametersType
  updateVersion: number
  isAsync?: boolean
  is: StateKeys
}
export interface SubscribeInternalParametersEnd extends SubscribeParametersMessage {
  type: SubscribeParametersType.END
  stateId: Key
  prev: unknown
  next: unknown
  isSame: boolean
}

export interface SubscribeInternalParametersStart extends SubscribeParametersMessage {
  type: SubscribeParametersType.START
  stateId: Key
}

export interface SubscribeInternalParametersCanceled extends SubscribeParametersMessage {
  type: SubscribeParametersType.CANCELED
  stateId: Key
}
export interface SubscribeInternalParametersThrow extends SubscribeParametersMessage {
  type: SubscribeParametersType.THROW
  stateId: Key
  error: unknown
}

export type SubscribeInternalParameters =
  | SubscribeInternalParametersEnd
  | SubscribeInternalParametersStart
  | SubscribeInternalParametersCanceled
  | SubscribeInternalParametersThrow

export type StateSubscribe<T> = EmitterSubscribe<SubscribeParameters<T>>
export type SubscribeInternal = EmitterSubscribe<SubscribeInternalParameters>

export interface StateDataInternal<T = unknown, A = Awaited<T>> {
  cachedAwaited: A
  cached?: T
  isAsync?: boolean
  isDead?: boolean
  isResolving?: boolean
  isResolvingStateId?: Key
  isInitialized: boolean
  updateVersion: number
}

export enum StateKeys {
  IS_COMPUTED = 'isSelector',
  IS_STATE = 'isState',
  IS_STATE_FAMILY = 'isFamily',
}

export enum StateOutputKeys {
  GET_SNAPSHOT = 'getSnapshot',
  GET = 'getState',
  SET = 'setState',
  SUBSCRIBE = 'subscribe',
  SUBSCRIBE_INTERNAL = '__sub',
  PROMISE_EMITTER = '__promiseEmitter',
  PROMISE_SETTER = '__promiseSetter',
  CLEAR = 'clear',
  IS = 'is',
  TYPE = '__tag',
  INTERNAL = '__internal',
  EMITTER = '__emitter',
  CACHE_EMITTER = '__cacheEmitter',
  ID = 'id',
}

export interface CommonFunctions<T> {
  [StateOutputKeys.TYPE]: T
  [StateOutputKeys.IS]: StateKeys
}
export interface AtomState<T> extends CommonFunctions<T> {
  [StateOutputKeys.SET]: SetState<T>
  [StateOutputKeys.GET]: GetState<T>
  [StateOutputKeys.SUBSCRIBE]: StateSubscribe<T>
  [StateOutputKeys.INTERNAL]: {
    [StateOutputKeys.GET_SNAPSHOT]: GetState<SelectorSnapshotData<T, T>>
    [StateOutputKeys.SUBSCRIBE_INTERNAL]: SubscribeInternal
    [StateOutputKeys.EMITTER]: Emitter<T>
    [StateOutputKeys.CACHE_EMITTER]: Emitter<T>
    [StateOutputKeys.PROMISE_EMITTER]: Emitter<PromiseData>
    [StateOutputKeys.PROMISE_SETTER]: (status: PromiseStatus) => void
    resolvePromises: (data: T) => void
  }
  [StateOutputKeys.CLEAR]: () => void
  [StateOutputKeys.ID]: Key
  [StateOutputKeys.IS]: StateKeys.IS_STATE | StateKeys.IS_STATE_FAMILY
}

export interface SelectorSnapshotData<T = unknown, A = Awaited<T>> {
  promise?: Promise<SubscribeInternalParameters>
  status: PromiseStatus
  data: A
}
export interface ComputedFunctions<T> extends CommonFunctions<T> {
  [StateOutputKeys.GET]: GetState<Promise<T>>
  [StateOutputKeys.INTERNAL]: {
    [StateOutputKeys.SUBSCRIBE_INTERNAL]: SubscribeInternal
    [StateOutputKeys.EMITTER]: Emitter<T>
    [StateOutputKeys.CACHE_EMITTER]: Emitter<T>
    [StateOutputKeys.GET_SNAPSHOT]: GetState<SelectorSnapshotData<T>>
    [StateOutputKeys.PROMISE_EMITTER]: Emitter<PromiseData>
  }
  [StateOutputKeys.SUBSCRIBE]: StateSubscribe<T>
  [StateOutputKeys.ID]: Key
  [StateOutputKeys.IS]: StateKeys.IS_COMPUTED
}

export type ComputedState<T> = ComputedFunctions<T>

export type SetStateFamily<T> = (key: Key, state: T) => void
export type GetStateFamily<T> = (key: Key) => T

export interface AtomFamily<T> {
  (key: Key): AtomState<T>
  [StateOutputKeys.SUBSCRIBE]: FamilySubscribe<T>
  [StateOutputKeys.CLEAR]: () => void
  [StateOutputKeys.ID]: Key
}

export type StateAll<T> = AtomState<T> | ComputedState<T>
