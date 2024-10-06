import { create } from 'zustand'

type Timer = {
  time: number
  inc: (time: number) => void
}

const useTimer = create<Timer>()((set) => ({
  time: 0,
  inc: (time) => set((state) => ({ time: state.time + time })),
}))

export default useTimer