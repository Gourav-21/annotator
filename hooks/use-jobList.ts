import { create } from 'zustand'

interface Job {
  _id: string
  user: string
  projectid: string
  taskid: string
  modelid: string
  completed: boolean
}

type Status = {
  Jobs: Job[]
  getJobs: () => Job[]
  setJob: (data: Job) => void
  removeJob: (id: string) => void
  getcompletedJobCount: () => number
}

const useJobList = create<Status>()((set, get) => ({
  Jobs: [],
  getJobs: () => get().Jobs,
  setJob: (data: Job) => set({ Jobs: [...get().Jobs, data] }),
  removeJob: (id: string) => set({ Jobs: get().Jobs.filter((Job) => Job._id !== id) }),
  getcompletedJobCount: () => get().Jobs.filter((Job) => Job.completed == true).length,
}))

export default useJobList