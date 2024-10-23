import { Message } from '@/app/(maneger)/chat/_components/chatArea'
import { UserGroups } from '@/app/(maneger)/chat/page'
import { create } from 'zustand'

type Status = {
  userGroups: UserGroups[]
  setUserGroups: (data: UserGroups[]) => void
  removeUserGroup: (id: string) => void;
  getLastReadMessage: (id: string) => string | undefined;
  updateLastReadMessage: (data: Message) => void;
  updateLastMessage: (data: Message) => void
}

const useUserGroups = create<Status>()((set, get) => ({
  userGroups: [],
  setUserGroups: (data: UserGroups[]) => set(() => ({ userGroups: data })),
  removeUserGroup: (id: string) => set((state) => ({ userGroups: state.userGroups.filter((group) => group.group._id !== id) })),
  updateLastReadMessage: (data: Message) => set((state) => ({ userGroups: state.userGroups.map((group) => group.group._id === data.group ? { ...group, lastReadMessage: data } : group) })),
  getLastReadMessage: (id: string) => {
    const { userGroups } = get();
    return userGroups.find((group) => group.group._id === id)?.lastReadMessage?._id
  },
  updateLastMessage: (data: Message) => set((state) => ({
    userGroups: state.userGroups.map((group) =>
      group.group._id === data.group ? { ...group, group: { ...group.group, lastMessage: data } } : group
    )}))
}))

export default useUserGroups