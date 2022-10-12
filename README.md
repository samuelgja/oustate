### Omg state library

[![Build](https://github.com/samuelgjabel/oustate/actions/workflows/build.yml/badge.svg)](https://github.com/samuelgjabel/oustate/actions/workflows/build.yml) [![Code quality check](https://github.com/samuelgjabel/oustate/actions/workflows/code-check.yml/badge.svg)](https://github.com/samuelgjabel/oustate/actions/workflows/code-check.yml)

Another small, fast but robust ☝️ **React state management library** with aim 🎯 on simplicity and scalability in real world scenarios.

Still experimental / beta. **Do not use it in productions yet!** 👻

Based on React [hooks](https://reactjs.org/docs/hooks-reference.html) api. Inspired by [recoil](https://recoiljs.org/) and [zustand](https://github.com/pmndrs/zustand/blob/main/readme.md) while try to achieve the best from these two worlds.

Solving problems like the dreaded [zombie child problem](https://react-redux.js.org/api/hooks#stale-props-and-zombie-children), [react concurrency](https://reactjs.org/blog/2022/03/29/react-v18.html) and [context loss](https://github.com/facebook/react/issues/13332) between mixed renderers with focus on **re-renders reduction**.

#### Install

```bash
yarn add omg-state  # or npm i omg-state
```

#### Simple state API

There is few options how to create new state:

1. `createState` - creating basic atom state
2. `createStateFamily` - creating basic atom state with passing variable while calling
3. `createComputed` - sync / async computed state
4. `createSlice` - it's just slice wrapped around `createComputed`

Passing functions into the state (like setting state) is not recommended.

_Note: State need to be used in **global js context** (🤫 it can be used also in `React` context, but carefully!)_

#### Calling the state in React

After state is created you can easily use it in `useStateValue` hook.

Keep in mind that using selector functions in `useStateValue` hook don't need to be memoized!
[Selectors no longer need to be memoized](https://github.com/reactwg/react-18/discussions/86)

**👋 Welcome back inline functions 👋**

TODO:

1. add `SSR` implementation
2. add `createComputedFamily` implementation

Well `tested`, written in `typescript`.

Library was created during one rainy weekend. So if somebody can look at the code and give some feedback (positive or negative), I will appreciate it 🤗
