import React, { useState, useEffect, useRef } from 'react';
import { Send, ImagePlus, User, Bot, Loader2, Copy, Check, ArrowDown, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

export default function AiDoctor({ onActionSuccess }) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const defaultChat = [
    { sender: 'ai', text: 'Hello! I am your **Farm Keep AI**. I can help you diagnose diseases, recommend **fungicides**, or log your **expenses**. How can I help you today?' }
  ];
  
  const [chatHistory, setChatHistory] = useState(defaultChat);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [farmStats, setFarmStats] = useState({ income: 0, expenses: 0, profit: 0 });
  const [recentActivities, setRecentActivities] = useState([]);

  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // 1. Initial Load from MongoDB
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const savedProfile = localStorage.getItem('farmerProfile');
        if (!savedProfile) return;
        const profileData = JSON.parse(savedProfile);

        const chatRes = await axios.get(`http://localhost:5000/api/chat?userId=${profileData._id}`);
        if (chatRes.data.success && chatRes.data.data.length > 0) {
          setChatHistory(chatRes.data.data);
        }

        const statsResponse = await axios.get(`http://localhost:5000/api/expenses/summary?userId=${profileData._id}`);
        if (statsResponse.data.success) {
           const { income, expenses } = statsResponse.data.data;
           setFarmStats({ income, expenses, profit: income - expenses });
        }

        const logsResponse = await axios.get(`http://localhost:5000/api/logs?userId=${profileData._id}`);
        if (logsResponse.data.success) {
           setRecentActivities(logsResponse.data.data.slice(0, 3)); 
        }
      } catch (error) {
        console.error("Initialization Error:", error);
      }
    };
    fetchInitialData();
  }, [onActionSuccess]);

  // 2. Persistent Save to MongoDB (with 2s debounce to prevent race conditions)
  useEffect(() => {
    const syncChat = async () => {
      const savedProfile = localStorage.getItem('farmerProfile');
      if (savedProfile && chatHistory.length > 1) {
        const profileData = JSON.parse(savedProfile);
        setIsSyncing(true);
        try {
          await axios.post('http://localhost:5000/api/chat', {
            userId: profileData._id,
            messages: chatHistory
          });
        } catch (error) {
          console.error("Sync Error:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    const debounceSave = setTimeout(syncChat, 2000);
    return () => clearTimeout(debounceSave);
  }, [chatHistory]);

  const scrollToBottom = (behavior = 'smooth') => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: behavior
      });
    }
  };

  useEffect(() => {
    if (chatHistory.length > 1 || isLoading) {
      scrollToBottom('smooth');
    }
  }, [chatHistory.length, isLoading]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isOverflowing = scrollHeight > clientHeight;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollButton(isOverflowing && isScrolledUp);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = async () => {
    if (window.confirm("Delete all conversation history?")) {
      const savedProfile = localStorage.getItem('farmerProfile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        try {
          await axios.delete('http://localhost:5000/api/chat', { data: { userId: profileData._id } });
          setChatHistory(defaultChat);
        } catch (error) {
          console.error("Clear Error:", error);
        }
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;

    const userText = message;
    setMessage('');
    
    // OPTIMISTIC UPDATE: Functional state update for user message
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const savedProfile = localStorage.getItem('farmerProfile');
      const profileData = savedProfile ? JSON.parse(savedProfile) : { _id: 'guest', fullName: 'stargenius' };

      const farmContext = JSON.stringify({
        farmerName: profileData.fullName,
        region: profileData.region,
        financials: farmStats,
        recentFarmHistory: recentActivities.map(log => `- ${new Date(log.date).toLocaleDateString()}: ${log.activityType}`).join(', ')
      });

      const response = await axios.post('http://localhost:5000/api/ai/diagnose', {
        userId: profileData._id,
        prompt: userText,
        context: farmContext
      });

      if (response.data.success) {
         // FUNCTIONAL UPDATE: Prevents the "disappearing message" race condition
         setChatHistory(current => [...current, { sender: 'ai', text: response.data.response }]);
         if (response.data.actionTaken && onActionSuccess) onActionSuccess();
      }
    } catch (error) {
       setChatHistory(current => [...current, { sender: 'ai', text: "Connection lost. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[600px] overflow-hidden relative font-sans">
      
      {/* HEADER */}
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              Farm Keep AI
              {isSyncing && <span className="text-[10px] text-gray-400 font-normal animate-pulse tracking-widest uppercase">Saving...</span>}
            </h2>
            <p className="text-xs text-gray-500 font-medium">Agronomist & Accountant</p>
          </div>
        </div>
        <button onClick={handleClearChat} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
          <Trash2 size={18} />
        </button>
      </div>

      {/* CHAT MESSAGES */}
      <div 
        ref={chatContainerRef} 
        onScroll={handleScroll} 
        className="flex-1 p-4 overflow-y-auto space-y-6 bg-white relative"
      >
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group animate-fadeIn`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-2 mt-1 shrink-0"><Bot size={16} /></div>
            )}
            <div className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user' ? 'bg-green-600 text-white rounded-tr-sm' : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm'
              }`}>
                {msg.sender === 'ai' ? (
                  <div className="markdown-container space-y-2 [&_strong]:font-black [&_strong]:text-green-800 [&_ul]:list-disc [&_ul]:ml-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-2">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                )}
              </div>
              <button onClick={() => handleCopy(msg.text, index)} className="flex items-center gap-1 mt-1 text-[10px] font-bold text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                {copiedIndex === index ? <><Check size={12} className="text-green-500"/> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Bot size={16} /></div>
            <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-sm border border-gray-100 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Generating...</span>
            </div>
          </div>
        )}
      </div>

      {/* BACK TO BOTTOM BUTTON */}
      {showScrollButton && (
        <button 
          onClick={() => scrollToBottom('smooth')} 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-full p-2 text-blue-600 hover:scale-110 transition-transform z-20 animate-bounce"
        >
          <ArrowDown size={20} />
        </button>
      )}

      {/* INPUT FIELD */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <label className="cursor-pointer text-gray-400 hover:text-blue-600 p-3 bg-gray-50 rounded-2xl border border-gray-100 transition-colors mb-1">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files[0];
              if (file) setPreviewUrl(URL.createObjectURL(file));
            }} />
            <ImagePlus size={20} />
          </label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
            placeholder="Type your message..." 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all resize-none h-12 max-h-32"
          />
          <button type="submit" disabled={!message.trim() || isLoading} className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all mb-1 shadow-md">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}