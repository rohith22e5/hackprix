import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaPaperPlane, FaTimes, FaRobot, FaMicrophone } from 'react-icons/fa';

// Import the authorized api instance from your auth client
import { api } from '../lib/authClient';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm your educational assistant. How can I help you learn today?", sender: 'bot' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInput(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, []);

  const handleVoiceClick = () => {
    if (recognitionRef.current) {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    const currentMessages = [...messages, userMsg];
    
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(1).map(msg => ({
        text: msg.text,
        sender: msg.sender
      }));
      
      const response = await api.post("/lectures/chat/", {
        message: userMsg.text,
        history: history,
      });

      const data = response.data;
      
      const botMsg: Message = { 
        id: Date.now() + 1, 
        text: data.response, 
        sender: 'bot' 
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat API Error:", error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please check your connection.",
        sender: 'bot'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col items-end sm:bottom-20 sm:right-6">
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[90vw] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl sm:w-[350px]">
          <div className="flex items-center justify-between bg-blue-600 p-4 text-white">
            <div className="flex items-center gap-2">
              <FaRobot className="text-xl" />
              <h3 className="font-semibold">EduSupport</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleVoiceClick} className={`text-white hover:text-gray-200 ${isListening ? 'animate-pulse' : ''}`} title="Voice Mode">
                <FaMicrophone />
              </button>
              <button onClick={toggleChat} className="text-white hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-500 shadow-sm border border-gray-100 rounded-lg px-4 py-2 text-sm animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
                {isListening && (
                  <div className="flex justify-center">
                    <div className="bg-white text-gray-500 shadow-sm border border-gray-100 rounded-lg px-4 py-2 text-sm">
                      Listening...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
          </div>

            <form onSubmit={handleSend} className="border-t border-gray-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask a question..."}
                  disabled={isLoading}
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </div>
            </form>
        </div>
      )}

      <button
        onClick={toggleChat}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus:outline-none"
        aria-label="Open chat"
      >
        {isOpen ? <FaTimes className="text-2xl" /> : <FaCommentDots className="text-2xl" />}
      </button>
    </div>
  );
};

export default ChatWidget;