import { useEffect, useState } from 'react'

export const ImpureRender = () => {
  return <div>{Math.random()}</div>
}

export const StateInEffect = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(count + 1)
  }, [count])

  return <div>{count}</div>
}
