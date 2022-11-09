import { PromiseData, PromiseStatus } from '../types/computed-types'

export const clearComputedPromiseData = (): PromiseData => ({
  status: PromiseStatus.SUCCESS,
  promises: [],
  error: null,
})

export const clearComputedData = (isAsync: boolean) => ({
  cached: undefined!,
  cachedAwaited: undefined!,
  isAsync,
  isDead: true,
  isResolving: false,
  updateVersion: 0,
  isInitialized: false,
})
