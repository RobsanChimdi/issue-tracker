'use client';

export default function MessageBubble({
  message,
  currentUserId,
}: {
  message: any;
  currentUserId: string;
}) {
  const isMine = message.senderId === currentUserId;

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl ${
          isMine
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 rounded-bl-none'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
