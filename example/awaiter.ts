export const awaiter = (waitTime: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, waitTime)
  })
}
