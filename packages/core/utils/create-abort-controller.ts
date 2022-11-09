import { PromiseData } from '../computed/computed-types'

export const createAbortController = (promiseData: PromiseData) => {
  if (promiseData.cancel) {
    promiseData.cancel()
  }
  promiseData.abortController = new AbortController()
}
