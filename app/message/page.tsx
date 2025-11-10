'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Participant {
  id: string;
  userId: string;
  name: string;
}

interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  participants: Participant[];
  lastMessage?: { text: string };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Message() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await axios.get('/api/session');
        const userId = userRes.data.userId;
        setCurrentUserId(userId);
        const convRes = await axios.get('/api/conversation');
        setConversations(convRes.data);
        const usersRes = await axios.get('/api/users');
        setUsers(usersRes.data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  const startConversation = async (recipientId: string) => {
    try {
      const res = await axios.post('/api/conversation', { recipientId });
      const newdata=res.data
      setConversations((prev)=>{
        
      const exist= prev.find((c)=>c.id==newdata.id);
      if(exist){
         return prev
      }
       
      return  [res.data, ...prev]
      }
      );
        
      setUsers(users.filter(u => u.id !== recipientId));
    } catch (error) {
      console.error(error);
    }
  };

  if (!currentUserId) return <p>No Users</p>;

  return (
    <div className="w-96 ml-100 whitespace-nowrap overflow-auto bg-slate-50 p-4">
      <h2 className="font-bold mb-3">Conversations</h2>
      <ul>
  {conversations.map((conv) => (
    <li key={conv.id}>
      <Link href={`/message/${conv.id}`}>
        <div className="p-3 border rounded-lg mb-3 hover:bg-gray-100 transition cursor-pointer">
          <p className="font-semibold">
            {conv.isGroup
              ? conv.name
              : conv.participants
                  .filter((p) => p.userId !== currentUserId)
                  .map((p) => p.name)
                  .join(', ')}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {conv.lastMessage?.text || 'No messages yet'}
          </p>
        </div>
      </Link>
    </li>
  ))}
</ul>
 </div>
  );
}
