import React from 'react'
import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { CounterExample } from './counter-example/counter-example'

const container = document.getElementById('app')
const root = createRoot(container) // createRoot(container!) if you use TypeScript
root.render(
  <Suspense fallback={<div>Jesus</div>}>
    <CounterExample />
  </Suspense>,
)
