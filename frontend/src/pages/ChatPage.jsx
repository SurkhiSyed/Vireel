import './chatpage.css'
import React from 'react'
import Chat from '../components/chat/Chat'
import List from '../components/list/List'
import Detail from '../components/detail/Detail'
import Notification from '../components/notification/Notification'
import { useChatStore } from '../lib/chatStore'

const ChatPage = () => {
  const {chatId} = useChatStore()

  return (
    <div className='container'>
        <List/>
        {chatId && <Chat/>}
        {chatId && <Detail/>}
    </div>
  )
}

export default ChatPage