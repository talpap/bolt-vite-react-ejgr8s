import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface Message {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
}

const ChatSystem: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messageList: Message[] = [];
      querySnapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messageList.reverse());
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      userId: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-bold">{message.userId}: </span>
            <span>{message.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Type your message..."
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatSystem;