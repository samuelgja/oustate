import { PromiseData } from '../types/computed-types'

export const createAbortController = (promiseData: PromiseData) => {
  if (promiseData.cancel) {
    promiseData.cancel()
  }
  promiseData.abortController = new AbortController()
}
