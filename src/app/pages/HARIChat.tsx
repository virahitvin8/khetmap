import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, MicOff, ChevronLeft, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  getHARIResponse,
  HARI_QUICK_QUESTIONS,
  HARIMessage,
  FarmContext,
} from '../../services/hariService';

export default function HARIChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<HARIMessage[]>([
    {
      id: '0',
      role: 'hari',
      text: `🌾 Namaskar ${user?.name?.split(' ')[0] || 'Bhai'}! Main HARI hun — tumhara satellite-powered krishi sahayak.\n\nMain tumhare khhet ka NDVI, mausam, aur satellite data dekh ke real advice deta hun. Kya poochna chahte ho?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const farmContext: FarmContext = {
    cropType: 'Rice',
    ndvi: 0.52,
    state: user ? 'Telangana' : undefined,
    weather: { temperature: 32, rainfall: 0, humidity: 65, et0: 5.2 },
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: HARIMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await getHARIResponse(text, farmContext);
      const hariMsg: HARIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'hari',
        text: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, hariMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'hari',
        text: '⚠️ Network issue hai bhai. Thodi der baad try karo.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Voice input (Web Speech API)
  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="h-full flex flex-col bg-[#050D05]">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0A1F0A] border-b border-[#1B4D2E]">
        <button onClick={() => navigate('/map')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1B4D2E] transition-colors">
          <ChevronLeft size={20} className="text-[#95D5B2]" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#52B788] to-[#2D6A4F] flex items-center justify-center shadow-lg">
          <Leaf size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-[#E8F5E9] font-bold text-sm">HARI AI</h2>
          <p className="text-[#52B788] text-xs">Holistic Agricultural Response Intelligence</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
          <span className="text-[#52B788] text-xs">Online</span>
        </div>
      </div>

      {/* ─── Farm context badge ─── */}
      <div className="px-4 py-2 bg-[#0D2818]/60 border-b border-[#1B4D2E]/50 flex gap-2 overflow-x-auto scrollbar-none">
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#1B4D2E] text-[#95D5B2] whitespace-nowrap">🌾 Rice · 0.8 ha</span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#1B4D2E] text-[#95D5B2] whitespace-nowrap">🌿 NDVI: 52</span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#1B4D2E] text-[#95D5B2] whitespace-nowrap">🌡️ 32°C</span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#1B4D2E] text-[#95D5B2] whitespace-nowrap">💧 ET₀: 5.2mm</span>
      </div>

      {/* ─── Messages ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
            >
              {msg.role === 'hari' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#52B788] to-[#2D6A4F] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs">🤖</span>
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-[#52B788] text-[#0A1F0A] font-medium rounded-br-sm'
                  : 'bg-[#0D2818] border border-[#1B4D2E] text-[#E8F5E9] rounded-bl-sm'
              }`}>
                {msg.text}
                <div className={`text-xs mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#52B788] to-[#2D6A4F] flex items-center justify-center flex-shrink-0">
              <span className="text-xs">🤖</span>
            </div>
            <div className="bg-[#0D2818] border border-[#1B4D2E] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0, 0.2, 0.4].map((d, i) => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-[#52B788]"
                  animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: d }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ─── Quick questions ─── */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none">
        {HARI_QUICK_QUESTIONS.map(q => (
          <button
            key={q.text}
            onClick={() => sendMessage(q.text)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-[#0D2818] border border-[#1B4D2E] text-[#95D5B2] hover:border-[#52B788] hover:text-[#52B788] transition-colors whitespace-nowrap active:scale-95"
          >
            {q.icon} {q.label}
          </button>
        ))}
      </div>

      {/* ─── Input bar ─── */}
      <div className="px-4 pb-4 pt-2 bg-[#0A1F0A] border-t border-[#1B4D2E] flex gap-2 items-end">
        <div className="flex-1 bg-[#0D2818] border border-[#1B4D2E] rounded-2xl px-4 py-2.5 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="HARI se kuch poochho... (Hindi/English)"
            className="flex-1 bg-transparent text-[#E8F5E9] text-sm placeholder-[#3A5A3A] outline-none"
          />
          <button
            onClick={toggleVoice}
            className={`transition-colors ${isListening ? 'text-[#F4A261] animate-pulse' : 'text-[#6B8E6B] hover:text-[#95D5B2]'}`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-full bg-[#52B788] flex items-center justify-center hover:bg-[#40916C] transition-all disabled:opacity-40 active:scale-90 flex-shrink-0"
        >
          <Send size={16} className="text-[#0A1F0A]" />
        </button>
      </div>
    </div>
  );
}
