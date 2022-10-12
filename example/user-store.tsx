import { createComputed, createState } from '../src'
const userState = createState({
  samko: 2,
  sae: 10,
  hello: [1, 2, 3],
  samko2: 0,
})

const useComputedState3 = createComputed(async ({ get, abortSignal }) => {
  console.log('COMPUTE_CALL___3')
  const vavavva = get(userState)
  vavavva.hello
  vavavva.samko
  const b = await fetch('https://petstore.swagger.io/v2/swagger.json', { signal: abortSignal })
  //
  const aaa = 2
  console.log(aaa)

  console.log('COMPUTE_CALL___END3')

  return aaa
})
