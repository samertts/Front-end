import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Paperclip, Phone, Video, Search, 
  MoreVertical, Check, CheckCheck, 
  User, Building2, Stethoscope, Shield, 
  MessageSquare, Users, Image as ImageIcon,
  Mic, Heart, AlertCircle, Sparkles, Lock, Zap
} from 'lucide-react';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

interface Contact {
  id: string;
  name: string;
  type: 'doctor' | 'lab' | 'patient' | 'system';
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  type: 'text' | 'image' | 'report' | 'alert';
}

export default function CommunicationHub() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const isRtl = language === 'AR' || language === 'KU' || language === 'SY';
  
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'system_node', name: 'GULA System Node', type: 'system', lastMessage: 'Bio-sync complete. Connectivity optimal.', time: '09:41', unread: 0, online: true },
    { id: 'dr_samer', name: 'Dr. Samer Mansour', type: 'doctor', lastMessage: 'Please review your blood report.', time: 'Yesterday', unread: 2, online: true },
    { id: 'central_lab', name: 'Baghdad Central Lab', type: 'lab', lastMessage: 'Results for Cluster-X ready.', time: '12:05', unread: 0, online: false },
    { id: 'patient_alpha', name: 'Ahmed K.', type: 'patient', lastMessage: 'When is my next scan?', time: 'Tue', unread: 0, online: true },
  ]);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatService.connect();
    
    const handleReceive = (msg: any) => {
      if (msg.roomId === getRoomId(selectedContact?.id)) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(36),
          text: msg.text,
          senderId: msg.senderId,
          senderName: msg.senderName,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: msg.type
        }]);
      }
    };

    chatService.onMessage(handleReceive);

    return () => {
      chatService.offMessage(handleReceive);
    };
  }, [selectedContact]);

  useEffect(() => {
    if (selectedContact) {
      const roomId = getRoomId(selectedContact.id);
      chatService.joinRoom(roomId);
      // Mock historical messages for demo
      setMessages([
        { id: 'm1', text: `Welcome to the secure channel with ${selectedContact.name}.`, senderId: 'system', senderName: 'System', timestamp: '09:00', type: 'text' },
        { id: 'm2', text: selectedContact.lastMessage, senderId: selectedContact.id, senderName: selectedContact.name, timestamp: selectedContact.time, type: 'text' }
      ]);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getRoomId = (otherId?: string) => {
    if (!user || !otherId) return 'global';
    const ids = [user.uid, otherId].sort();
    return `chat_${ids[0]}_${ids[1]}`;
  };

  const handleSend = () => {
    if (!inputValue.trim() || !selectedContact || !user) return;

    const roomId = getRoomId(selectedContact.id);
    const msgData = {
      roomId,
      message: inputValue,
      senderId: user.uid,
      senderName: profile?.name || user.email || 'User',
      type: 'text' as const
    };

    chatService.sendMessage(msgData);
    setInputValue('');
    
    // Add locally immediately for responsiveness
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: inputValue,
      senderId: user.uid,
      senderName: profile?.name || 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    }]);
  };

  const t = {
    search: language === 'AR' ? 'بحث...' : 'Search...',
    online: language === 'AR' ? 'متصل' : 'Online',
    offline: language === 'AR' ? 'غير متصل' : 'Offline',
    typeMessage: language === 'AR' ? 'اكتب رسالة...' : 'Type a message...',
    system: language === 'AR' ? 'النظام' : 'System',
    doctor: language === 'AR' ? 'طبيب' : 'Doctor',
    lab: language === 'AR' ? 'مختبر' : 'Lab',
    patient: language === 'AR' ? 'مريض' : 'Patient',
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar - Contact List */}
      <div className={cn(
        "w-80 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col transition-all",
        isRtl ? "border-l order-last" : "border-r"
      )}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-tighter italic dark:text-white">Channels</h2>
              <div className="flex gap-2">
                 <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors">
                    <Users size={18} />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors">
                    <Sparkles size={18} />
                 </button>
              </div>
           </div>
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder={t.search}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={cn(
                "w-full p-4 flex items-center gap-4 transition-all relative border-b border-slate-50 dark:border-slate-800/50",
                selectedContact?.id === contact.id 
                  ? "bg-indigo-50 dark:bg-indigo-900/20" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
              )}
            >
              {selectedContact?.id === contact.id && (
                <motion.div layoutId="active-contact" className="absolute inset-y-0 left-0 w-1 bg-indigo-600 rounded-r" />
              )}
              
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                   {contact.type === 'doctor' ? <Stethoscope className="text-indigo-600" /> :
                    contact.type === 'lab' ? <Building2 className="text-indigo-600" /> :
                    contact.type === 'system' ? <Shield className="text-indigo-600" /> :
                    <User className="text-indigo-600" />}
                </div>
                {contact.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{contact.name}</span>
                  <span className="text-[9px] font-black text-slate-400">{contact.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pr-4">{contact.lastMessage}</p>
                  {contact.unread > 0 && (
                    <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-white dark:bg-slate-950">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <header className="h-20 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {selectedContact.type === 'doctor' ? <Stethoscope size={20} className="text-indigo-600" /> :
                     selectedContact.type === 'lab' ? <Building2 size={20} className="text-indigo-600" /> :
                     <User size={20} className="text-indigo-600" />}
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{selectedContact.name}</h3>
                    <div className="flex items-center gap-2">
                       <div className={cn("w-1.5 h-1.5 rounded-full", selectedContact.online ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {selectedContact.online ? t.online : t.offline} • Sovereign Node {selectedContact.id.toUpperCase()}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-2">
                 <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all">
                    <Phone size={20} />
                 </button>
                 <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all">
                    <Video size={20} />
                 </button>
                 <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all">
                    <MoreVertical size={20} />
                 </button>
              </div>
            </header>

            {/* Messages Display */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-black/20">
              <div className="flex flex-col items-center mb-12">
                 <div className="px-6 py-2 bg-indigo-100/50 dark:bg-indigo-900/20 border border-indigo-200/50 dark:border-indigo-800/30 rounded-full">
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                       <Shield size={10} />
                       End-to-End Quantum Verified Encryption
                    </span>
                 </div>
              </div>

              {messages.map((msg, i) => {
                const isSystem = msg.senderId === 'system';
                const isMe = msg.senderId === user?.uid;
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex flex-col max-w-[70%]",
                      isSystem ? "mx-auto w-full max-w-lg" : 
                      isMe ? (isRtl ? "mr-auto items-end" : "ml-auto items-end") : 
                      (isRtl ? "ml-auto items-start" : "mr-auto items-start")
                    )}
                  >
                    {!isSystem && (
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-2">
                        {isMe ? 'You' : msg.senderName} • {msg.timestamp}
                      </span>
                    )}
                    
                    <div className={cn(
                      "p-4 rounded-[1.5rem] shadow-sm relative",
                      isSystem ? "bg-slate-900 text-white text-center italic border border-white/10" :
                      isMe ? "bg-indigo-600 text-white rounded-tr-none" : 
                      "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700/50 rounded-tl-none"
                    )}>
                      {msg.type === 'report' ? (
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-white/20 rounded-xl">
                              <AlertCircle size={24} />
                           </div>
                           <div className="text-left">
                              <p className="text-xs font-black uppercase tracking-tight">{msg.text}</p>
                              <button className="mt-2 py-1 px-3 bg-white text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">View Report</button>
                           </div>
                        </div>
                      ) : (
                        <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                      )}
                      
                      {isMe && !isSystem && (
                        <div className="absolute bottom-2 right-4 flex gap-0.5">
                           <CheckCheck size={10} className="text-indigo-200" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
               <div className="max-w-4xl mx-auto flex items-end gap-4">
                  <div className="flex gap-1 mb-2">
                     <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
                        <Paperclip size={20} />
                     </button>
                     <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
                        <ImageIcon size={20} />
                     </button>
                  </div>
                  
                  <div className="flex-1 relative">
                     <textarea
                       value={inputValue}
                       onChange={(e) => setInputValue(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSend();
                         }
                       }}
                       placeholder={t.typeMessage}
                       rows={1}
                       className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-800 rounded-[1.5rem] py-4 px-6 text-sm font-bold resize-none transition-all dark:text-white"
                     />
                     <div className="absolute right-4 bottom-4 flex gap-3">
                        <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                           <Heart size={20} />
                        </button>
                        <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                           <Mic size={20} />
                        </button>
                     </div>
                  </div>

                  <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className={cn(
                      "p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 transition-all",
                      inputValue.trim() ? "hover:scale-105 active:scale-95" : "opacity-50 grayscale cursor-not-allowed"
                    )}
                  >
                    <Send size={24} />
                  </button>
               </div>
               <div className="text-center mt-4">
                  <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">GULA OS Secure Messaging Protocol</span>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
             <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-[3rem] flex items-center justify-center mb-8">
                <MessageSquare size={64} className="text-indigo-500 animate-pulse" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4">Secured Communication Hub</h3>
             <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                Connect with medical professionals, laboratory specialists, and system infrastructure. 
                All communications are quantum-encrypted and natively audited by the GULA Anti-Corruption Engine.
             </p>
             <div className="grid grid-cols-3 gap-8 mt-12">
                {[
                  { label: 'Latency', val: '12ms', icon: Zap },
                  { label: 'Integrity', val: 'Verified', icon: Shield },
                  { label: 'Encryption', val: 'P-Quantum', icon: Lock },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                     <stat.icon size={24} className="text-indigo-400 mb-2" />
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
                     <span className="text-xs font-black dark:text-white">{stat.val}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
