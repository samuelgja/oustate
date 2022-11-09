export const cancelablePromise = <T>(
  promise: Promise<T>,
  abortController: AbortController,
): { promise: Promise<T>; cancel: () => void } => {
  let isCanceled = false
  const promiseWrapper = new Promise<T>((resolve, reject: (value: { isCanceled: boolean }) => void) => {
    const onCancel = (): void => {
      isCanceled = true
      abortController.signal.removeEventListener('abort', onCancel)
      reject({ isCanceled: true })
    }

    abortController.signal.addEventListener('abort', onCancel)
    promise
      .then((value) => {
        abortController.signal.removeEventListener('abort', onCancel)
        isCanceled ? onCancel() : resolve(value)
      })
      .catch((error) => {
        abortController.signal.removeEventListener('abort', onCancel)
        isCanceled ? onCancel() : reject(error)
      })
  })

  return {
    promise: promiseWrapper,
    cancel() {
      abortController.abort()
      isCanceled = true
    },
  }
}
