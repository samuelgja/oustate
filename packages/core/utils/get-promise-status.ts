import { PromiseData, PromiseStatus } from '../types/computed-types'
import { SelectorSnapshotData, StateDataInternal, SubscribeInternalParameters } from '../types/types'

interface Options<T, A = Awaited<T>> {
  data: StateDataInternal<T, A>
  promiseData: PromiseData
}
export const getPromiseStatus = <T, A = Awaited<T>>(options: Options<T, A>, isPending: boolean): SelectorSnapshotData<T, A> => {
  const { data, promiseData } = options

  if (!isPending) {
    return { status: PromiseStatus.SUCCESS, data: data.cachedAwaited }
  }

  const promise: Promise<SubscribeInternalParameters> = new Promise(
    (resolve: (message: SubscribeInternalParameters) => void, reject: () => void) =>
      promiseData.promises.push({ resolve, reject }),
  )
  return { promise, status: PromiseStatus.PENDING, data: data.cachedAwaited }
}
