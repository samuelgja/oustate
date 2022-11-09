import { SubscribeInternalParameters, IsSame, StateAll, Key } from './types'

/**
 * Computed Get state type (get)
 */
export type GetState = <T extends StateAll<any>, S>(
  /**
   * State parameter - can be computed, state or slice
   */
  state: T,
  /**
   * Selector - slice
   * @example (state) => state.value
   */
  selector?: (value: T['__tag']) => S,
  /**
   * equality check function
   * @example (a, b) => a === b // isSame
   */
  isSame?: IsSame<S>,
) => undefined extends S ? Awaited<T['__tag']> : S

export enum PromiseStatus {
  PENDING = 'pending',
  ERROR = 'error',
  SUCCESS = 'success',
}

export interface PromiseData {
  /**
   * Promise status
   */
  status: PromiseStatus
  /**
   * if there is any error
   */
  error: any
  /**
   * List of promises to resolve  - when working with async computed
   */
  promises: Array<{
    resolve: (message: SubscribeInternalParameters) => void
    reject: (message: unknown) => void
  }>
  /**
   * cancel abort controller function
   */
  cancel?: () => void
  /**
   * Abort controller - used for for example fetching the data - signal - abort signal
   */
  abortController?: AbortController
}

/**
 * Internal enum
 */
export enum InternalThrowEnum {
  IT_INTERNAL_THROW = '___is_internal_throw_',
}

/**
 * Internal throw interface - used for internal purposes
 */
interface InternalThrowInterface {
  [InternalThrowEnum.IT_INTERNAL_THROW]?: boolean
}

export type InternalThrow = Promise<SubscribeInternalParameters> & InternalThrowInterface

/**
 * Get selection options
 */
interface GetSelectionOptionsBase {
  /**
   * get - function where first parameter is state and second selector, third equality check function
   */
  get: GetState
  /**
   * Abort signal - used for for example fetching the data - signal - abort signal
   */
  abortSignal?: AbortSignal
  /**
   * Sometime, especially when working with async computed, promise is canceled but actually (trowed away) but function inside computed is still running.
   * check if computed is cancelled - can help to stop the computation - break the code / loop when `isCancelled` is true
   */
  isCanceled: () => boolean
  /**
   * Parameter key
   * If using createComputed - key will be undefined
   * If using createComputedFamily - key will be the key of the family
   */
  key?: Key
}

export type GetSelectionOptions<T = unknown> = GetSelectionOptionsBase & T
