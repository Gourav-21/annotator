import { SheetMenu } from "@/components/admin-panel/sheet-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle } from 'lucide-react'
import { UserGroups } from "../page"
import useUserGroups from "@/hooks/use-userGroups"
import { get } from "http"


type GroupListProps = {
  userGroups: UserGroups[]
  selectedGroup: UserGroups | null
  setSelectedGroup: (group: UserGroups) => void
  onCreateGroup: () => void
}

export function GroupList({ userGroups, selectedGroup, setSelectedGroup, onCreateGroup }: GroupListProps) {
  const { getLastReadMessage } = useUserGroups()

  return (
    <div className="w-96 border-r flex flex-col">
      <header className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Chat</h1>
          <SheetMenu />
        </div>
      </header>
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-2">
          {userGroups.map(userGroup => (
            <Button
              key={userGroup._id}
              variant={selectedGroup?._id === userGroup._id ? "secondary" : "ghost"}
              className="w-full justify-start h-auto py-2"
              onClick={() => setSelectedGroup(userGroup)}
            >
              <div className="flex items-center space-x-3 w-full">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback>{userGroup.group.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium truncate text-left">{userGroup.group.name}</p>
                  <p className="text-xs text-muted-foreground truncate text-left">
                    {userGroup?.lastReadMessage  ? (
                      <>
                        <span className="font-medium">{userGroup.lastReadMessage.sender.name}: </span>
                        {userGroup.lastReadMessage.content}
                      </>
                    ) : (
                      'No messages yet'
                    )}
                  </p>
                </div>
                {userGroup.lastReadMessage &&  userGroup.group.lastMessage?._id != getLastReadMessage(userGroup._id)   && userGroup._id != selectedGroup?._id  && (
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                )}
              </div>
            </Button>
          ))}
          {userGroups.length === 0 && (
            <div className="text-xl text-muted-foreground h-16 flex items-center justify-center">No chats yet.</div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-muted/30">
        <Button onClick={onCreateGroup} className="w-full">
          <PlusCircle className="mr-2" size={16} />
          Create New Group
        </Button>
      </div>
    </div>
  )
}