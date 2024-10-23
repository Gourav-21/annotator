import { sendMessage, updateLastReadMessage } from '@/app/actions/chat'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, Send } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { Annotator } from '../../projects/task/[projectId]/page'
import useUserGroups from '@/hooks/use-userGroups'
import { get } from 'http'

export type Message = {
  _id: string
  sender: Annotator
  group: string
  content: string
  sent_at: Date
}

export function ChatArea({ groupId }: { groupId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false)

  const { getLastReadMessage, updateLastReadMessage: updateLastRead, updateLastMessage } = useUserGroups()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  console.log(messages)

  const fetchMessages = async () => {
    const msg = await fetch(`/api/chat/getMessagesWithContext?groupId=${groupId}&&limitBefore=10&&limitAfter=20`).then(res => res.json())
    if (msg.error) {
      return console.log(msg.error)
    }
    setMessages(msg.messages as Message[])
  }

  // Polling messages every 3 seconds
  useEffect(() => {
    fetchMessages() // Fetch immediately on component mount

    // const intervalId = setInterval(() => {
    //   fetchMessages() // Fetch messages every 3 seconds
    // }, 3000)

    // return () => clearInterval(intervalId) // Clean up the interval on component unmount
  }, [groupId])

  useEffect(() => {
    async function init() {
      if (messages[messages.length - 1] && getLastReadMessage(groupId) !== messages[messages.length - 1]._id) {
        console.log(messages[messages.length - 1])

        const res = await updateLastReadMessage(groupId, messages[messages.length - 1]._id)
        if (res?.error) {
          return console.log(res.error)
        } else {
          updateLastRead(messages[messages.length - 1])
          updateLastMessage(messages[messages.length - 1])
        }
      }
    }

    init()
    scrollToBottom()
  }, [messages, groupId])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const send = async () => {
    if (newMessage.trim()) {
      setLoading(true)
      const msg = await sendMessage(groupId, newMessage)
      if (msg.error) {
        setLoading(false)
        return console.log(msg.error)
      }
      const messsge: Message = JSON.parse(msg.message as string)
      setMessages([...messages, { ...messsge, sender: { _id: session?.user?.id, name: session?.user.name } } as Message])
      setNewMessage('')
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
      }
    }

    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll)
      return () => scrollArea.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <ScrollArea
        className="flex-1 p-4"
        ref={scrollAreaRef}
      >
        {messages.map((message) => (
          <div key={message._id} className={`flex items-start space-x-2 mb-4 ${message.sender?._id === session?.user.id ? 'justify-end' : ''}`}>
            {message.sender?._id !== session?.user.id && (
              <Avatar className="w-8 h-8">
                <AvatarFallback>{message.sender?.name}</AvatarFallback>
              </Avatar>
            )}
            <div className={`max-w-[70%] ${message.sender?._id === session?.user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
              {message.sender?._id !== session?.user.id && (
                <p className="font-semibold text-sm mb-1">{message.sender?.name ? message.sender?.name : "Deleted User"}</p>
              )}
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.sender?._id === session?.user.id && (
              <Avatar className="w-8 h-8">
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-muted-foreground">No messages yet</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      {showScrollButton && (
        <Button
          className="absolute bottom-20 right-8 rounded-full shadow-md"
          size="icon"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message"
            value={newMessage}
            disabled={loading}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && send()}
            className="flex-1"
          />
          <Button onClick={send} size="icon" className="rounded-full">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </>
  )
}