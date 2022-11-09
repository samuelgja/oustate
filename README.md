### Oustate

[![Build](https://github.com/samuelgjabel/oustate/actions/workflows/build.yml/badge.svg)](https://github.com/samuelgjabel/oustate/actions/workflows/build.yml) [![Code quality check](https://github.com/samuelgjabel/oustate/actions/workflows/code-check.yml/badge.svg)](https://github.com/samuelgjabel/oustate/actions/workflows/code-check.yml)

Another small, fast but robust ☝️ **React state management library** with aim 🎯 on simplicity and scalability in real world scenarios.

Still experimental / beta. **Do not use it in productions yet!** 👻

Based on React [hooks](https://reactjs.org/docs/hooks-reference.html) api. Inspired by [recoil](https://recoiljs.org/) and [zustand](https://github.com/pmndrs/zustand/blob/main/readme.md) while try to achieve the best from these two worlds.

Solving problems like the dreaded [zombie child problem](https://react-redux.js.org/api/hooks#stale-props-and-zombie-children), [react concurrency](https://reactjs.org/blog/2022/03/29/react-v18.html) and [context loss](https://github.com/facebook/react/issues/13332) between mixed renderers with focus on **re-renders reduction**.

#### Install

```bash
yarn add oustate  # or npm i oustate
```

#### API

##### `createState`

creating basic atom state - it can be almost any value - object / atom / ...

```typescript
import { createState } from 'oustate'

const defaultState = 2
const state = createState(defaultState, {
  // options are optional
  isSame: (prev, next) => true,
  onSet(oldValue, setStateCallback) {
    const newValue = setStateCallback()
    console.log(oldValue, newValue)
  },
})

// get state out of react scope
state.getState()

// set new state
state.setState(3)

// use state in react scope
const stateValue = useStateValue(state)
```

returns `AtomState` type

##### `createStateFamily`

same as `createState` but instead of returning `AtomState`, it **returns function** where first parameter (key) is unique state identifier and returns `AtomState`

```typescript
import { createStateFamily } from 'oustate'

const defaultState = 2
const state = createStateFamily(defaultState, {
  // options are optional
  isSame: (prev, next) => true,
  onSet(oldValue, setStateCallback) {
    const newValue = setStateCallback()
    console.log(oldValue, newValue)
    return newValue
  },
})

// get state out of react scope
state('some-key').getState()

// set new state
state('some-key').setState(3)

// use state in react scope
const stateValue = useStateValue(state('some-key'))
```

##### `createComputed`

computed state is a state that depends on other states or other computed states. It is recomputed when the states it depends on change.
**It can be also async**

```typescript
import { createState, createComputed } from 'oustate'

const counterState = createState(0)
const userState = createState({ name: 'John', age: 20 })

// creating computed depends on counterState & userState
const counterPlusUserAgeState = createComputed(({ get }) => get(counterState) + get(userState, (user) => user.age))
// get state
await counterPlusUserAgeState.getState()

// react scope
const counterPlusUser = useStateValue(counterPlusUserAgeState)
```

_Note: Keep in mind when using **useStateValue** and **async computed state**, component need to be wrapped into the [Suspense](https://reactjs.org/docs/react-api.html#reactsuspense)! For more control over `computed` loading states use `useLoadableState` instead `useStateValue`_

##### `createComputedFamily`

same as `createComputed`, but instead of returning `ComputedState`, it **returns function** where first parameter (key) is unique state identifier and returns `ComputedState`

```typescript
import { createState, createComputed } from 'oustate'

const counterState = createState(0)
const userState = createState({ name: 'John', age: 20 })

// creating computed depends on counterState & userState
const counterPlusUserAgeState = createComputedFamily(({ get }) => get(counterState) + get(userState, (user) => user.age))
// get state
await counterPlusUserAgeState('key').getState()

// react scope
const counterPlusUser = useStateValue(counterPlusUserAgeState('key'))
```

##### `createSlice`

it's just helper function - slice wrapped around `createComputed`.
There are scenarios when need to slice 1 state in same way in multiple components (`typescript const userAge = useStateValue(userState, user => user.age) `),
instead of writing same logic multiple times in react scope,
`createSlice` helps to bring it to the global scope (`typescript const userAgeState = createSlice(userState, user => user.age) `).

```typescript
import { createState, createSlice } from 'oustate'

const userState = createState({ name: 'John', age: 20 })

const userAgeState = createSlice(userState, (user) => user.age)
// get state
await userAgeState.getState()

// react scope
const counterPlusUser = useStateValue(userAgeState)
```

Passing functions into the state (like setting state) is not recommended.

_Note: State need to be used in **global js context** (🤫 it can be used also in `React` context, but carefully!)_

#### Calling the state in React

After state is created you can easily use it in `useStateValue` hook.

Keep in mind that using selector functions in `useStateValue` hook don't need to be memoized!
[Selectors no longer need to be memoized](https://github.com/reactwg/react-18/discussions/86)

**👋 Welcome back inline functions 👋**

TODO:

1. add `SSR` implementation

Well `tested`, written in `typescript`.

Library was created during one rainy weekend. So if somebody can look at the code and give some feedback (positive or negative), I will appreciate it 🤗
