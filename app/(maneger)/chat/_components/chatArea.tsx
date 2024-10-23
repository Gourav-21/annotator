import { sendMessage, updateLastReadMessage } from '@/app/actions/chat'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import useUserGroups from '@/hooks/use-userGroups'
import { ChevronDown, Send } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { Annotator } from '../../projects/task/[projectId]/page'

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
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const { getLastReadMessage, updateLastReadMessage: updateLastRead, updateLastMessage } = useUserGroups()
  const [loadingMessage, setLoadingMessage] = useState(false)
  const [showNewMessagesIndicator, setShowNewMessagesIndicator] = useState(false)
  const [hide,sethide]=useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastReadMessageRef = useRef<HTMLDivElement>(null)


  console.log(messages)

  const fetchMessages = async () => {
    const msg = await fetch(`/api/chat/getMessages?groupId=${groupId}&&limitBefore=10&&limitAfter=20`).then(res => res.json())
    if (msg.error) {
      return console.log(msg.error)
    }
    setMessages(msg.messages as Message[])
  }

  async function fetchOldMessages() {
    if(loadingMessage) return
    setLoadingMessage(true)
    if (messages.length === 0) return
    const oldScrollHeight = scrollAreaRef.current?.scrollHeight || 0
    const oldScrollTop = scrollAreaRef.current?.scrollTop || 0
    const msg = await fetch(`/api/chat/getMessages?groupId=${groupId}&&limitBefore=20&&messageId=${messages[0]._id}`).then(res => res.json())
    if (msg.error) {
      return console.log(msg.error)
    }
    if(msg.messages.length === 0){
      sethide(true)
    }
    setMessages((p) => [...msg.messages, ...p])
    setLoadingMessage(false)
    requestAnimationFrame(() => {
      if (scrollAreaRef.current) {
        const newScrollHeight = scrollAreaRef.current.scrollHeight
        scrollAreaRef.current.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop
      }
    })
  }

  useEffect(() => {
    fetchMessages()

    // const intervalId = setInterval(() => {
    //   fetchMessages() // Fetch messages every 3 seconds
    // }, 3000)

    // return () => clearInterval(intervalId) 
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
  }, [messages, groupId])

  useEffect(() => {
    const lastReadMessageId = getLastReadMessage(groupId)
    const lastReadMessageIndex = messages.findIndex(msg => msg._id === lastReadMessageId)
    
    if (lastReadMessageIndex !== -1) {
      lastReadMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else if (isAtBottom) {
      scrollToBottom()
    }
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
      setIsAtBottom(true)
    }
  }

  useEffect(() => {
    const scrollViewport = scrollAreaRef.current
    if (!scrollViewport) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollViewport
      const isBottom = scrollHeight - scrollTop - clientHeight < 1
      setIsAtBottom(isBottom)
      setShowScrollButton(!isBottom)

      if (scrollTop === 0 && messages.length > 0) {
        fetchOldMessages()
      }

      // Check for new messages indicator
      const lastReadMessageId = getLastReadMessage(groupId)
      const lastReadMessageIndex = messages.findIndex(msg => msg._id === lastReadMessageId)
      if (lastReadMessageIndex !== -1 && lastReadMessageIndex < messages.length - 1) {
        const lastReadMessagePosition = lastReadMessageRef.current?.offsetTop || 0
        setShowNewMessagesIndicator(scrollTop + clientHeight < lastReadMessagePosition)
      } else {
        setShowNewMessagesIndicator(false)
      }
    }

    scrollViewport.addEventListener('scroll', handleScroll)
    return () => scrollViewport.removeEventListener('scroll', handleScroll)
  }, [messages, groupId])

  

  return (
    <>
      <div 
        className="flex-1 px-4 overflow-y-auto overflow-x-hidden h-full flex flex-col"
        ref={scrollAreaRef}
      >
        {!hide && <div className="text-center p-4 text-medium">Loading...</div>}
        {messages.map((message) => (
          <div key={message._id} className={`flex items-start space-x-2 my-4 ${message.sender?._id === session?.user.id ? 'justify-end' : ''}`} 
           ref={message._id === getLastReadMessage(groupId) ? lastReadMessageRef : null} >
            {message.sender?._id !== session?.user.id && (
              <Avatar className="w-8 h-8">
                <AvatarFallback>{message.sender?.name[0]}</AvatarFallback>
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
      </div>
      {showScrollButton && (
        <Button
          className="absolute bottom-20 right-8 rounded-full shadow-md"
          size="icon"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
      {showNewMessagesIndicator && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <Button
            className="rounded-full shadow-md"
            size="sm"
            onClick={scrollToBottom}
          >
            New Messages
          </Button>
        </div>
      )}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && send()}
            className="flex-1"
          />
          <Button onClick={send} disabled={loading} size="icon" className="rounded-full">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </>
  )
}