import React, { useState, useRef, useEffect } from 'react';
import { useSafety } from '../contexts/SafetyContext';
import { api } from '../services/api';
import { Bot, Send, User, Sparkles, Volume2, Mic, MicOff, ShieldCheck, VolumeX } from 'lucide-react';
import { AIMessage } from '../types';

export const AIChatPage: React.FC = () => {
  const { location } = useSafety();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'm_1',
      sender: 'ai',
      text: 'Namaste! I am Auralis AI Safety Companion powered by Gemini. How can I keep you safe today? Ask about night travel, de-escalation tips, cab safety, or first aid.',
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '🚕 Late night Auto/Cab safety rules',
    '🚶‍♀️ Walking alone in dark area',
    '🏥 First aid emergency protocol',
    '🚨 How to deal with harassment'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Web Speech API Voice Recognition
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser viewport.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Text-To-Speech Synthesis
  const handleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.sendAIChat(query, { city: location.city, lat: location.latitude, lng: location.longitude });
      const aiMsgText = res.reply || 'Stay calm. Always keep your live location shared with guardians via Journey Protection.';
      const aiMsg: AIMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      // Auto speak response
      handleSpeak(aiMsg.id, aiMsgText);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: 'Prioritize well-lit paths, keep phone battery above 20%, and trigger Auralis Quick SOS if in danger.',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col h-[82vh] pb-24 text-slate-100 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-3 mb-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 p-0.5 shadow-md">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-rose-400">
            <Bot className="w-5 h-5" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold font-heading text-white flex items-center gap-1.5">
            Auralis AI Companion <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </h2>
          <p className="text-[10px] text-slate-400">Powered by Gemini 2.5 • Contextual Voice Assistance</p>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none text-xs">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-rose-400 border border-white/10'}`}>
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[82%] p-3 rounded-2xl border space-y-1 relative group ${m.sender === 'user' ? 'bg-rose-600/90 text-white border-rose-500' : 'glass-panel text-slate-200 border-white/10'}`}>
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
              
              <div className="flex items-center justify-between text-[9px] opacity-70 pt-1 border-t border-white/10">
                <span>{m.timestamp}</span>
                {m.sender === 'ai' && (
                  <button
                    onClick={() => handleSpeak(m.id, m.text)}
                    className="p-1 rounded-lg hover:bg-white/10 text-rose-300 flex items-center gap-1 font-semibold"
                    title="Read text out loud"
                  >
                    {speakingId === m.id ? (
                      <>
                        <VolumeX className="w-3 h-3 text-rose-400 animate-pulse" />
                        <span>Mute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-rose-400" />
                        <span>Speak</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <Bot className="w-4 h-4 text-rose-400 animate-spin" />
            <span>Auralis AI analyzing safety protocols...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Pills */}
      <div className="py-2 flex gap-1.5 overflow-x-auto scrollbar-none">
        {quickPrompts.map(p => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-[10px] shrink-0 font-medium transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box with Speech Recognition */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-2xl border transition-all ${isListening ? 'bg-rose-500 text-white border-rose-400 animate-pulse' : 'bg-slate-900 text-slate-300 border-white/10 hover:bg-slate-800'}`}
          title="Voice input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          placeholder={isListening ? "Listening..." : "Ask Auralis AI about safety..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-lg active:scale-95 transition-transform"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

