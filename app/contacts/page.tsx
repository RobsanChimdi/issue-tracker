'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  fname: string;
  lname:string;
  imageUrl:string;
  email: string;
}

export default function Contacts() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    async function fetchUsers() {
      try {
        const sessionRes = await axios.get('/api/session');
        const userId = sessionRes.data.userId;
        setCurrentUserId(userId);

        const usersRes = await axios.get('/api/users');
        const allUsers: User[] = usersRes.data.users;
        setUsers(allUsers.filter(u => u.id !== userId));

      } catch (error) {
        console.error("Error fetching users:", error);
      } 
    }

    fetchUsers();
  }, []);
  const handleStartChat = async (recipientId: string) => {
    try {
      const res = await axios.post('/api/conversation', { recipientId });
      const conversationId = res.data.id;
      router.push(`/message/${conversationId}`);
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
      {users.length === 0 ? (
        <p className="text-gray-500">No contacts available.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <div
                onClick={() => handleStartChat(user.id)}
                className="p-3 border rounded-lg mb-3 hover:bg-gray-100 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.imageUrl ?? "/default-avatar.png"}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="font-semibold">{user.fname} {user.lname}</p>
                </div>
              </div>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
