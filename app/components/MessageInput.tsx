import { useState, useEffect } from "react";
interface MessageInputProps {
  onSend: (text: string, file?: File | null) => void;
}
export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    
    onSend(text, file);
    setText('');
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t flex flex-col bg-white">
      {file && (
        <div className="flex items-center justify-between mb-2 ml-36 p-2 bg-gray-100 rounded">
          <span className="text-sm truncate">{file.name}</span>
          <button 
            type="button" 
            onClick={() => setFile(null)}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <input 
          id="file-input" 
          type="file" 
          onChange={handleFileChange}
          className="text-sm hidden"
        />
        <label 
          htmlFor="file-input"
          className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
        >
          📎
        </label>
        
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none" 
          placeholder="Type a message..." 
        />
        
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </form>
  );
}