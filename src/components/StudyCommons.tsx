'use client';

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Draggable from "react-draggable";
import { Resizable } from "react-resizable";

// ✅ Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ Moderation rules
const checkMessage = (msg: string) => {
  const lower = msg.toLowerCase();

  // 🚫 Hard bans
  if (/sex|porn|nude|drugs|sell|buy|scam/.test(lower)) return { allowed: false, reason: "Explicit or illegal content" };
  if (/http|www\.|\.com|\.net|\.org/.test(lower)) return { allowed: false, reason: "External links not allowed" };

  // 🚫 Cheating keywords
  if (/write.*essay|solve.*exam|give.*answers/.test(lower)) return { allowed: false, reason: "Cheating is not allowed" };

  // 🚫 Off-topic (dating, flirting, gossip)
  if (/date|single|love|cute|handsome|beautiful/.test(lower)) return { allowed: false, reason: "Dating or flirting not allowed" };

  // 🚫 Non-academic religious use (preaching, conversion)
  if (/convert|repent|hell|heaven/.test(lower)) return { allowed: false, reason: "Non-academic religious content" };

  // 🚫 Non-STEM/general topics (unless framed academically)
  if (/lgbt|pride|gender|politics|celebrity|movie|kpop|gossip/.test(lower)) {
    return { allowed: false, reason: "Topic outside academic STEM/Research scope" };
  }

  // 🚫 Long pasted texts (spam/article dumping)
  if (msg.length > 800) return { allowed: false, reason: "Please summarize instead of pasting long articles" };

  // ✅ Allowed messages
  return { allowed: true };
};

interface StudyCommonsProps {
  onClose: () => void;
  currentUser: { full_name?: string; email: string };
}

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  isAI?: boolean;
}

export default function StudyCommons({ onClose }: StudyCommonsProps) {
  const nickname = "Anonymous";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [warnings, setWarnings] = useState<Record<string, number>>({});
  const [size, setSize] = useState({ width: 384, height: 600 });

  // Initialize with sample messages
  useEffect(() => {
    const sampleMessages: Message[] = [
      {
        id: '1',
        user: 'Study Moderator',
        text: '👋 Welcome to Study Commons! This is a space for collaborative learning with AI assistance.',
        timestamp: new Date().toLocaleTimeString(),
        isAI: true
      },
      {
        id: '2',
        user: 'Alex_92',
        text: 'Can someone help me understand how neural networks backpropagate?',
        timestamp: new Date(Date.now() - 300000).toLocaleTimeString()
      },
      {
        id: '3',
        user: 'Gawin AI',
        text: 'Backpropagation works by calculating gradients layer by layer, from output to input. The chain rule helps compute how each weight contributes to the final error.',
        timestamp: new Date(Date.now() - 240000).toLocaleTimeString(),
        isAI: true
      },
      {
        id: '4',
        user: 'Sarah_learns',
        text: 'That makes sense! Is there a good visualization for this?',
        timestamp: new Date(Date.now() - 180000).toLocaleTimeString()
      }
    ];
    setMessages(sampleMessages);
  }, []);

  useEffect(() => {
    const channel = supabase.channel("study-commons")
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const check = checkMessage(input);

    if (!check.allowed) {
      const count = (warnings[nickname] || 0) + 1;
      setWarnings({ ...warnings, [nickname]: count });

      if (count >= 3) {
        alert("You have been removed from the study space due to repeated violations.");
        setJoined(false);
        return;
      } else {
        const warningMsg: Message = {
          id: Date.now().toString(),
          user: "AI Moderator",
          text: `${nickname}, ${check.reason}. (Warning ${count}/3)`,
          timestamp: new Date().toLocaleTimeString(),
          isAI: true
        };
        setMessages((prev) => [...prev, warningMsg]);
      }
      setInput("");
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      user: nickname,
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    // Add to local state immediately
    setMessages((prev) => [...prev, message]);
    
    // Broadcast to other users
    await supabase.channel("study-commons").send({
      type: "broadcast",
      event: "chat",
      payload: message
    });

    setInput("");
  };

  const getInitials = (name: string) => {
    return name.split('_')[0].charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'];
    const index = name.length % colors.length;
    return colors[index];
  };


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
            className="flex flex-col rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20"
            style={{
              width: size.width,
              height: size.height,
              background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.95) 0%, rgba(255, 248, 235, 0.95) 100%)'
            }}
          >
      {/* Header */}
      <div className="p-4 border-b border-orange-200/50 drag-handle cursor-move">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📚</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Study Commons</h2>
              <p className="text-xs text-gray-600">AI + Community Learning</p>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                <span className="text-xs font-medium text-gray-800">{message.user}</span>
                <span className="text-xs text-gray-500">{message.timestamp}</span>
              </div>
              <p className={`text-sm leading-relaxed ${
                message.isAI 
                  ? 'text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border-l-2 border-emerald-300' 
                  : 'text-gray-700'
              }`}>
                {message.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-orange-200/50">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Ask the community..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-2 rounded-2xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70 backdrop-blur-sm text-sm text-gray-700 placeholder:text-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium rounded-2xl hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m22 2-7 20-4-9-9-4Z"/>
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Logged in as <strong>{nickname}</strong>
        </p>
      </div>
          </motion.div>
        </Resizable>
      </div>
    </Draggable>
  );
}