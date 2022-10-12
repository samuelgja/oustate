import { SubscribeInternalParameters, IsSame, StateOutputKeys, StateAll } from '../types'

export type GetState = <T extends StateAll<any>, S>(
  state: T,
  selector?: (value: T[StateOutputKeys.TYPE]) => S,
  isSame?: IsSame<S>,
) => undefined extends S ? Awaited<T[StateOutputKeys.TYPE]> : S

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
