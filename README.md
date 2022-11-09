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

#### Simple state API

There is few options how to create new state:

##### `createState` - creating basic atom state

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

##### `createStateFamily` - creating basic atom state where created state is actually function where first (key) parameter is unique state identifier.

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

##### `createComputed` - sync / async computed state

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

##### `createComputedFamily` - sync / async computed family state - where created computed is actually function where first (key) parameter is unique computed identifier.

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

##### `createSlice` - it's just slice wrapped around `createComputed`

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
