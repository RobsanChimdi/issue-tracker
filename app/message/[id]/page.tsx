'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { socket } from '@/app/lib/socket';
import MessageInput from '@/app/components/MessageInput';
import MessageBubble from '@/app/components/MessageBubble';

interface Message {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  conversationId: string;
  createdAt?: string;
}

interface Participant {
  id: string;
  userId: string;
  name: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
}

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<Participant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await axios.get('/api/session');
        setCurrentUserId(userRes.data.userId);
        const convRes = await axios.get(`/api/conversation/${conversationId}`);
        setConversation(convRes.data);
        
        const currentUser = userRes.data.userId;
        const recipientParticipant = convRes.data.participants.find(
          (p: Participant) => p.userId !== currentUser
        );
        setRecipient(recipientParticipant);

      } catch (err) {
        console.error("Failed to load data:", err);
      }
    }

    if (conversationId) {
      fetchData();
    }
  }, [conversationId]);
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await axios.get(`/api/messages?conversationId=${conversationId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);
  useEffect(() => {
    if (!conversationId) return;

    socket.connect();
    socket.emit('joinConversation', conversationId);

    socket.on('newMessage', (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('newMessage');
      socket.disconnect();
    };
  }, [conversationId]);
  async function handleSend(text: string, file?:File|null) {
    if (!currentUserId || !recipient || !conversationId) return;
    try {
      const formData=new FormData()
      formData.append('senderId', currentUserId)
      formData.append("recipientId", recipient.userId);
      formData.append("conversationId", conversationId);
      formData.append("text", text);
      if(file) formData.append("file", file)
      const res = await axios.post('/api/messages', formData, {headers: { 'Content-Type': 'multipart/form-data' },});
      const savedMessage = res.data;
      setMessages((prev) => [...prev, savedMessage]);
      socket.emit('sendMessage', savedMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }


  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b p-4">
        <h1 className="text-xl font-semibold">
          Chat with {recipient?.name || 'User'}
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUserId={currentUserId}
          />
        ))}
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}