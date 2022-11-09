import { SubscribeInternalParameters, IsSame, StateAll, Key } from '../types'

export type GetState = <T extends StateAll<any>, S>(
  state: T,
  selector?: (value: T['__tag']) => S,
  isSame?: IsSame<S>,
) => undefined extends S ? Awaited<T['__tag']> : S

export enum PromiseStatus {
  PENDING = 'pending',
  ERROR = 'error',
  SUCCESS = 'success',
}

export interface PromiseData {
  status: PromiseStatus
  error: any
  promises: Array<{
    resolve: (message: SubscribeInternalParameters) => void
    reject: (message: unknown) => void
  }>
  cancel?: () => void
  abortController?: AbortController
}

export enum InternalThrowEnum {
  IT_INTERNAL_THROW = '___is_internal_throw_',
}

interface InternalThrowInterface {
  [InternalThrowEnum.IT_INTERNAL_THROW]?: boolean
}

export type InternalThrow = Promise<SubscribeInternalParameters> & InternalThrowInterface

interface GetSelectionOptionsBase {
  get: GetState
  abortSignal?: AbortSignal
  isCanceled: () => boolean
  key?: Key
}

export type GetSelectionOptions<T = unknown> = GetSelectionOptionsBase & T
