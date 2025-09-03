'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Draggable from "react-draggable";
import { Resizable } from "react-resizable";

// Simple message interface
interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  isAI?: boolean;
}

interface StudyCommonsProps {
  onClose: () => void;
}

export default function StudyCommons({ onClose }: StudyCommonsProps) {
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [size, setSize] = useState({ width: 384, height: 600 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with sample messages (no external dependencies)
  useEffect(() => {
    const sampleMessages: Message[] = [
      {
        id: '1',
        user: 'Study Helper',
        text: '🎓 Welcome to Study Commons! Ask questions, share knowledge, and learn together.',
        timestamp: new Date().toLocaleTimeString(),
        isAI: true
      },
      {
        id: '2',
        user: 'Alex_92',
        text: 'Can someone explain how neural networks work in simple terms?',
        timestamp: new Date(Date.now() - 300000).toLocaleTimeString()
      },
      {
        id: '3',
        user: 'Sarah_learns',
        text: 'Think of neural networks like a brain - they learn patterns from examples and make predictions!',
        timestamp: new Date(Date.now() - 180000).toLocaleTimeString()
      }
    ];
    setMessages(sampleMessages);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simple message validation
  const isValidMessage = (msg: string): boolean => {
    const cleanMsg = msg.toLowerCase().trim();
    
    // Block inappropriate content
    if (/sex|porn|nude|drugs|scam/.test(cleanMsg)) return false;
    if (/http|www\.|\.com|\.net|\.org/.test(cleanMsg)) return false;
    if (msg.length > 500) return false;
    
    return true;
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    
    if (!isValidMessage(input)) {
      const warningMsg: Message = {
        id: Date.now().toString(),
        user: "Moderator",
        text: "⚠️ Please keep messages appropriate and under 500 characters. No links allowed.",
        timestamp: new Date().toLocaleTimeString(),
        isAI: true
      };
      setMessages(prev => [...prev, warningMsg]);
      setInput("");
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      user: nickname,
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, message]);
    setInput("");
  };

  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string): string => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Nickname entry form
  if (!joined) {
    return (
      <Draggable handle=".drag-handle" bounds="parent">
        <div className="fixed top-4 right-4 z-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-80 p-6 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.95) 0%, rgba(255, 248, 235, 0.95) 100%)'
            }}
          >
            <div className="drag-handle cursor-move p-2 -m-2 mb-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg">📚</span>
                </div>
                <h1 className="text-lg font-bold text-gray-800 mb-1">Join Study Commons</h1>
                <p className="text-gray-600 text-xs">
                  Enter your nickname to join the learning community
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70 backdrop-blur-sm text-gray-700 placeholder:text-gray-500 text-sm"
                onKeyDown={(e) => e.key === "Enter" && nickname.trim() && setJoined(true)}
                autoFocus
                maxLength={20}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => nickname.trim() && setJoined(true)}
                  disabled={!nickname.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium rounded-2xl hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Join Chat
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </Draggable>
    );
  }

  // Main chat interface
  return (
    <Draggable handle=".drag-handle" bounds="parent">
      <div className="fixed top-4 right-4 z-40">
        <Resizable
          width={size.width}
          height={size.height}
          onResize={(_, data) => setSize({ width: data.size.width, height: data.size.height })}
          minConstraints={[300, 400]}
          maxConstraints={[500, 800]}
          resizeHandles={['se']}
        >
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="flex flex-col rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 overflow-hidden"
            style={{
              width: size.width,
              height: size.height,
              background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.95) 0%, rgba(255, 248, 235, 0.95) 100%)'
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-orange-200/50 drag-handle cursor-move flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📚</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">Study Commons</h2>
                    <p className="text-xs text-gray-600">Learning Community</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-orange-200/50 rounded-xl transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex space-x-3"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                      message.isAI ? 'bg-emerald-500' : getAvatarColor(message.user)
                    }`}>
                      {message.isAI ? '🤖' : getInitials(message.user)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-800 truncate">{message.user}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{message.timestamp}</span>
                      </div>
                      <p className={`text-sm leading-relaxed break-words ${
                        message.isAI 
                          ? 'text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border-l-2 border-emerald-300' 
                          : 'text-gray-700'
                      }`}>
                        {message.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-orange-200/50 flex-shrink-0">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-4 py-2 rounded-2xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70 backdrop-blur-sm text-sm text-gray-700 placeholder:text-gray-500"
                  maxLength={500}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium rounded-2xl hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50 flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m22 2-7 20-4-9-9-4Z"/>
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Chatting as <strong>{nickname}</strong>
              </p>
            </div>
          </motion.div>
        </Resizable>
      </div>
    </Draggable>
  );
}