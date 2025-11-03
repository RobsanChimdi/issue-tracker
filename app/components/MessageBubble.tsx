export default function MessageBubble({ message, currentUserId }: { message: any; currentUserId: string|null; }) {
  const isMine = message.senderId === currentUserId;

  const renderAttachment = (attachment: any) => {
    const url = attachment.url;
    if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
      return (
        <div className="relative inline-block">
          <div className="w-80 h-48 bg-black rounded-lg overflow-hidden">
            <video controls className="w-full h-full object-contain" preload="metadata">
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <a href={url} download className={`absolute top-2 right-2 ${isMine ? 'bg-blue-500' : 'bg-gray-500'} text-white p-1 rounded text-xs`}>
            ⬇️
          </a>
        </div>
      );
    }
    
    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
      return (
        <div className="relative inline-block">
          <img src={url} alt="Attachment" className="max-w-full h-auto rounded-lg max-h-64 object-cover" />
          <a href={url} download className={`absolute top-2 right-2 ${isMine ? 'bg-blue-500' : 'bg-gray-500'} text-white p-1 rounded text-xs`}>
            ⬇️
          </a>
        </div>
      );
    }
    
    return (
      <div className="relative">
        <a href={url} target="_blank" rel="noopener noreferrer" className={`flex items-center ${isMine ? 'text-blue-200' : 'text-blue-600'}`}>
          <span className="mr-2">📎</span>
          <span>Download File</span>
          <span className="text-xs ml-2 opacity-75">
            ({(attachment.fileSize / (1024 * 1024)).toFixed(2)} MB)
          </span>
        </a>
      </div>
    );
  };

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-md px-1 py-1 rounded-xl ${
        isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 rounded-bl-none'
      }`}>
        {message.text && <p className={isMine ? 'text-white' : 'text-black'}>{message.text}</p>}
        
        {message.attachments && message.attachments.map((attachment: any) => (
          <div key={attachment.id} className="mt-1">
            {renderAttachment(attachment)}
          </div>
        ))}
      </div>
    </div>
  );
}