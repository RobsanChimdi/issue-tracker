import { DateTime } from "luxon";

export default function MessageBubble({
  message,
  currentUserId,
  timezone = "Africa/Addis_Ababa" // default timezone
}: { 
  message: any; 
  currentUserId: string | null; 
  timezone?: string;
}) {
  const isMine = message.senderId === currentUserId;

  const localTime = message.createdAt
    ? DateTime.fromISO(message.createdAt)
        .setZone(timezone)
        .toFormat("yyyy-MM-dd HH:mm")
    : "";

  const renderAttachment = (attachment: any) => {
    const url = attachment.url;
    if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
      return (
        <div className="relative inline-block">
          <a href={url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
            <div className="w-80 h-48 bg-black rounded-lg overflow-hidden">
              <video controls className="w-full h-full object-contain" preload="metadata">
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </a>
          <button
            onClick={() => window.open(url, "_blank")}
            className={`absolute top-2 right-2 ${isMine ? 'bg-blue-500' : 'bg-gray-500'} text-white p-1 rounded text-xs`}
          >
            ⬇️
          </button>
        </div>
      );
    }

    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
      return (
        <div className="relative inline-block">
          <a href={url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
            <img src={url} alt="Attachment" className="max-w-full h-auto rounded-lg max-h-64 object-cover" />
          </a>
          <button
            onClick={() => window.open(url, "_blank")}
            className={`absolute top-2 right-2 ${isMine ? 'bg-blue-500' : 'bg-gray-500'} text-white p-1 rounded text-xs`}
          >
            ⬇️
          </button>
        </div>
      );
    }

    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-2 ${isMine ? 'text-blue-200' : 'text-blue-600'}`}>
        <span>📎</span>
        <span>Download File</span>
        <span className="text-xs opacity-75">({(attachment.fileSize / (1024 * 1024)).toFixed(2)} MB)</span>
      </a>
    );
  };

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-md px-2 py-1 rounded-xl ${
        isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 rounded-bl-none'
      }`}>
        {message.attachments && message.attachments.map((attachment: any) => (
          <div key={attachment.id} className="mt-1">
            {renderAttachment(attachment)}
          </div>
        ))}
        {message.text && <p className={isMine ? 'text-white' : 'text-black'}>{message.text}</p>}

        {localTime && <div className="text-xs text-gray-400 mt-1 text-right">{localTime}</div>}
      </div>
    </div>
  );
}
