import React, { useState, inter } from 'react'
import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import { App } from './App'
import { awaiter } from './awaiter'
import { BenchmarkStates } from './benchmark/bencmark'

const container = document.getElementById('app')
const root = createRoot(container) // createRoot(container!) if you use TypeScript
root.render(
  <RecoilRoot>
    <Suspense fallback={<div>Jesus</div>}>
      <BenchmarkStates />
    </Suspense>
  </RecoilRoot>,
)
