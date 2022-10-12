import { RecoilRoot, atom, selector, useRecoilValue, useSetRecoilState } from 'recoil'
import { Suspense } from 'react'

const state = atom({
  key: '12321',
  default: {
    samko: 2,
    sae: 10,
    hello: [1, 2, 3],
    samko2: 0,
  },
})

const useComputedAsync = selector({
  key: '2231114',
  get: async ({ get }) => {
    const fetchDataa = await fetch('https://petstore.swagger.io/v2/swagger.json')

    const data = get(state)
    //

    return { omg: fetchDataa }
  },
})

const useComputedSync = selector({
  key: '223114',
  get: ({ get }) => {
    const data = get(useComputedAsync)
    //

    return data
  },
})
export const App = () => {
  return (
    <RecoilRoot>
      <AppSet />
      <Suspense fallback={'Loading this...'}>
        <App3 />
      </Suspense>
    </RecoilRoot>
  )
}

const AppSet = () => {
  let time = performance.now()
  console.log('re-render-AppSet')
  const aaa = useSetRecoilState(state)

  return <div onClick={() => aaa((old) => ({ ...old, samko: old.samko + 1 }))}>Countaaa</div>
}
const App3 = () => {
  let time = performance.now()
  console.log('re-render-3')
  const state = useRecoilValue(useComputedSync)

  return <div onClick={() => {}}>Count {JSON.stringify(state)}</div>
}
