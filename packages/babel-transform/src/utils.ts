export const arrayToRecord = (array: string[]) => {
  const output: Record<string, boolean> = {}
  for (const item of array) {
    output[item] = true
  }
  return output
}

let id = 0
export const getId = () => {
  id++
  return id.toString(36)
}
