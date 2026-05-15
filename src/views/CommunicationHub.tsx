import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Paperclip, Phone, Video, Search, 
  MoreVertical, Check, CheckCheck, 
  User, Building2, Stethoscope, Shield, 
  MessageSquare, Users, Image as ImageIcon,
  Mic, Heart, AlertCircle, Sparkles, Lock, Zap,
  FileText, Play, Pause, ChevronDown,
  Pin, Trash2, Reply, Search as SearchIcon
} from 'lucide-react';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

interface Contact {
  id: string;
  name: string;
  type: 'doctor' | 'lab' | 'patient' | 'system';
  category: 'clinical' | 'infrastructure' | 'personal';
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
  status: 'active' | 'pending' | 'blocked';
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  type: 'text' | 'image' | 'report' | 'alert' | 'voice' | 'location' | 'file';
  status?: 'sent' | 'delivered' | 'read';
  metadata?: any;
}

export default function CommunicationHub() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const isRtl = language === 'AR' || language === 'KU' || language === 'SY';
  
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'system_node', name: 'GULA System Node', type: 'system', category: 'infrastructure', lastMessage: 'Bio-sync complete. Connectivity optimal.', time: '09:41', unread: 0, online: true, status: 'active' },
    { id: 'dr_samer', name: 'Dr. Samer Mansour', type: 'doctor', category: 'clinical', lastMessage: 'Please review your blood report.', time: 'Yesterday', unread: 2, online: true, status: 'active' },
    { id: 'central_lab', name: 'Baghdad Central Lab', type: 'lab', category: 'clinical', lastMessage: 'Results for Cluster-X ready.', time: '12:05', unread: 0, online: false, status: 'active' },
    { id: 'patient_alpha', name: 'Ahmed K.', type: 'patient', category: 'clinical', lastMessage: 'When is my next scan?', time: 'Tue', unread: 0, online: true, status: 'active' },
    { id: 'unknown_1', name: 'Zaid M. (New)', type: 'patient', category: 'clinical', lastMessage: 'Hello, I need help.', time: '14:00', unread: 1, online: true, status: 'pending' },
  ]);

  const [activeCategory, setActiveCategory] = useState<'all' | 'clinical' | 'infrastructure'>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [msgSearchQuery, setMsgSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: 'voice' | 'video', status: 'calling' | 'connected' } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    chatService.connect();
    
    chatService.onMessage((msg: any) => {
      if (msg.roomId === getRoomId(selectedContact?.id)) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(36),
          text: msg.text,
          senderId: msg.senderId,
          senderName: msg.senderName,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: msg.type,
          status: 'delivered'
        }]);
      }
    });

    chatService.onTyping((data) => {
      if (data.userId === selectedContact?.id) {
        setRemoteTyping(data.typing);
      }
    });

    return () => {
      chatService.disconnect();
    };
  }, [selectedContact]);

  useEffect(() => {
    if (selectedContact) {
      chatService.joinRoom(getRoomId(selectedContact.id));
      setRemoteTyping(false);
      // Mock historical
      setMessages([
        { id: 'm1', text: `Quantum-secured tunnel initialized with ${selectedContact.name}.`, senderId: 'system', senderName: 'System', timestamp: '09:00', type: 'text' },
        { id: 'm2', text: selectedContact.lastMessage, senderId: selectedContact.id, senderName: selectedContact.name, timestamp: selectedContact.time, type: 'text', status: 'read' },
        { 
          id: 'm3', 
          text: 'Generated Diagnostic Preview', 
          senderId: selectedContact.id, 
          senderName: selectedContact.name, 
          timestamp: '10:45', 
          type: 'report',
          metadata: { title: 'LIMS Summary 4.1', status: 'stable', urgency: 'low' }
        }
      ]);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, remoteTyping]);

  const getRoomId = (otherId?: string) => {
    if (!user || !otherId) return 'global';
    const ids = [user.uid, otherId].sort();
    return `chat_${ids[0]}_${ids[1]}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    if (selectedContact && user) {
      if (!isTyping) {
        setIsTyping(true);
        chatService.sendTyping(getRoomId(selectedContact.id), user.uid, true);
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        chatService.sendTyping(getRoomId(selectedContact.id), user.uid, false);
      }, 2000);
    }
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
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    chatService.sendTyping(roomId, user.uid, false);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: inputValue,
      senderId: user.uid,
      senderName: profile?.name || 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      status: 'sent'
    }]);
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBlock = (id: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status: 'blocked' as const } : c));
    setSelectedContact(null);
  };

  const handleAccept = (id: string, accept: boolean) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status: accept ? ('active' as const) : ('blocked' as const) } : c));
    if (!accept) setSelectedContact(null);
  };

  const startCall = (type: 'voice' | 'video') => {
    setActiveCall({ type, status: 'calling' });
    // In a real app, this would use WebRTC
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 3000);
  };

  const filteredMessages = messages.filter(m => 
    m.text.toLowerCase().includes(msgSearchQuery.toLowerCase())
  );

  const t = {
    search: language === 'AR' ? 'بحث...' : 'Search...',
    online: language === 'AR' ? 'متصل' : 'Online',
    offline: language === 'AR' ? 'غير متصل' : 'Offline',
    typeMessage: language === 'AR' ? 'اكتب رسالة...' : 'Type a message...',
    isTyping: language === 'AR' ? 'يكتب الآن...' : 'is typing...',
    clinical: language === 'AR' ? 'طبي' : 'Clinical',
    infrastructure: language === 'AR' ? 'بنية تحتية' : 'Infrastructure',
    all: language === 'AR' ? 'الكل' : 'All',
    accept: language === 'AR' ? 'قبول' : 'Accept',
    ignore: language === 'AR' ? 'تجاهل' : 'Ignore',
    block: language === 'AR' ? 'حظر' : 'Block',
    unblock: language === 'AR' ? 'إلغاء الحظر' : 'Unblock',
    shareLocation: language === 'AR' ? 'مشاركة الموقع' : 'Share Location',
    calling: language === 'AR' ? 'يتصل...' : 'Calling...',
    endCall: language === 'AR' ? 'إنهاء المكالمة' : 'End Call',
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
              <h2 className="text-xl font-black uppercase tracking-tighter italic dark:text-white">GULA Link</h2>
              <div className="flex gap-2">
                 <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors">
                    <Users size={18} />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors">
                    <Sparkles size={18} />
                 </button>
              </div>
           </div>
           
           <div className="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
             {['all', 'clinical', 'infrastructure'].map((cat) => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat as any)}
                 className={cn(
                   "flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                   activeCategory === cat 
                    ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 {(t as any)[cat]}
               </button>
             ))}
           </div>

           <div className="relative group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredContacts.map((contact) => (
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
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
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
                <div className="flex justify-between items-center text-[11px]">
                  <p className="text-slate-500 dark:text-slate-400 truncate pr-4">{contact.lastMessage}</p>
                  {contact.unread > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shrink-0">
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
            <header className="h-20 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-20">
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
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          {selectedContact.online ? t.online : t.offline} • Sovereign Node {selectedContact.id.toUpperCase()}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-2">
                 {isSearchVisible ? (
                   <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} className="relative">
                      <input 
                        autoFocus
                        type="text"
                        value={msgSearchQuery}
                        onChange={(e) => setMsgSearchQuery(e.target.value)}
                        placeholder="Search conversation..."
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 px-4 pr-10 text-[11px] font-bold"
                      />
                      <button onClick={() => { setIsSearchVisible(false); setMsgSearchQuery(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500">
                         <ChevronDown size={14} className="rotate-90" />
                      </button>
                   </motion.div>
                 ) : (
                   <button onClick={() => setIsSearchVisible(true)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all">
                      <SearchIcon size={20} />
                   </button>
                 )}
                 <button onClick={() => startCall('voice')} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all">
                    <Phone size={20} />
                 </button>
                 <button onClick={() => startCall('video')} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all">
                    <Video size={20} />
                 </button>
                 <div className="relative group/menu">
                    <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all">
                        <MoreVertical size={20} />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                       <button onClick={() => handleBlock(selectedContact.id)} className="w-full text-left px-4 py-3 text-xs font-black uppercase text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3">
                          <Shield size={14} />
                          {t.block}
                       </button>
                       <button className="w-full text-left px-4 py-3 text-xs font-black uppercase text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                          <Trash2 size={14} />
                          Clear History
                       </button>
                    </div>
                 </div>
              </div>
            </header>

            {/* Messages Display */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-black/20 relative">
              {selectedContact.status === 'pending' && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-10 mx-auto max-w-md w-full bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10 mb-8 backdrop-blur-xl">
                   <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-800">
                         <Shield className="text-indigo-600" size={32} />
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-tighter italic mb-2 dark:text-white">Encrypted Request</h4>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                         This contact is not in your sovereign directory. How do you wish to proceed?
                      </p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handleAccept(selectedContact.id, true)} className="py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20">
                         {t.accept}
                      </button>
                      <button onClick={() => handleAccept(selectedContact.id, false)} className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 transition-all">
                         {t.ignore}
                      </button>
                   </div>
                </motion.div>
              )}

              <div className="flex flex-col items-center mb-12">
                 <div className="px-6 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-full flex items-center gap-3 shadow-sm backdrop-blur-md">
                    <Lock size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                       End-to-End Quantum Verified Tunnel
                    </span>
                 </div>
              </div>

              {filteredMessages.map((msg, i) => {
                const isSystem = msg.senderId === 'system';
                const isMe = msg.senderId === user?.uid;
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex flex-col max-w-[75%]",
                      isSystem ? "mx-auto w-full max-w-lg" : 
                      isMe ? (isRtl ? "mr-auto items-end" : "ml-auto items-end") : 
                      (isRtl ? "ml-auto items-start" : "mr-auto items-start")
                    )}
                  >
                    {!isSystem && (
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-3">
                        {isMe ? 'You' : msg.senderName} • {msg.timestamp}
                      </span>
                    )}
                    
                    <div className={cn(
                      "group p-4 rounded-[1.8rem] shadow-sm relative transition-all",
                      isSystem ? "bg-slate-900/90 text-white text-center italic border border-white/5 backdrop-blur-sm mx-auto" :
                      isMe ? "bg-indigo-600 text-white rounded-tr-none" : 
                      "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 rounded-tl-none shadow-indigo-100/10"
                    )}>
                      {msg.type === 'report' ? (
                        <div className="flex flex-col gap-3 min-w-[240px]">
                           <div className="flex items-center justify-between pb-3 border-b border-white/10 dark:border-white/5">
                              <div className="flex items-center gap-3">
                                 <div className="p-2.5 bg-white/20 dark:bg-indigo-500/20 rounded-xl text-white">
                                    <FileText size={20} />
                                 </div>
                                 <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-80">{msg.metadata?.title || 'Report'}</p>
                                    <p className="text-[9px] font-bold opacity-60">Verified Synthetix</p>
                                 </div>
                              </div>
                              <div className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-[8px] font-black uppercase tracking-widest">{msg.metadata?.status || 'Stable'}</div>
                           </div>
                           <p className="text-sm font-bold leading-relaxed pr-8">{msg.text}</p>
                           <button className="w-full py-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white">
                              Execute Preview Protocol
                           </button>
                        </div>
                      ) : msg.type === 'location' ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden relative">
                               <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                  <Zap size={48} className="text-indigo-500" />
                               </div>
                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600">
                                  <AlertCircle size={24} />
                               </div>
                            </div>
                            <div className="flex items-center justify-between px-1">
                               <span className="text-[10px] font-black uppercase tracking-tight">Sovereign Coordinates</span>
                               <button className="text-[9px] font-black text-white bg-indigo-500/20 px-2 py-1 rounded-lg">View Map</button>
                            </div>
                        </div>
                      ) : msg.type === 'file' ? (
                        <div className="flex items-center gap-4 min-w-[200px] p-2 bg-black/5 dark:bg-white/5 rounded-2xl">
                           <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-indigo-600 shadow-sm">
                              <FileText size={24} />
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-black truncate">{msg.text}</p>
                              <p className="text-[9px] font-bold opacity-60">2.4 MB • PDF</p>
                           </div>
                           <button className="p-2 text-slate-400 hover:text-indigo-500">
                              <ChevronDown className="-rotate-90" size={16} />
                           </button>
                        </div>
                      ) : msg.type === 'voice' ? (
                        <div className="flex items-center gap-4 min-w-[200px]">
                           <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                              <Play size={16} className="ml-1" fill="currentColor" />
                           </button>
                           <div className="flex-1 flex items-center gap-1">
                              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 1.0, 0.6, 0.4].map((h, i) => (
                                <span key={i} style={{ height: `${h * 24}px` }} className="w-1 bg-white/40 rounded-full" />
                              ))}
                           </div>
                           <span className="text-[10px] font-black opacity-60">0:14</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                        </div>
                      )}
                      
                      {isMe && !isSystem && (
                        <div className="absolute bottom-2 right-4 flex gap-1 items-center bg-indigo-700/30 px-1.5 py-0.5 rounded-full">
                           {msg.status === 'read' ? (
                             <CheckCheck size={12} className="text-emerald-400" />
                           ) : msg.status === 'delivered' ? (
                             <CheckCheck size={12} className="text-indigo-200" />
                           ) : (
                             <Check size={12} className="text-indigo-300" />
                           )}
                        </div>
                      )}

                      {/* Msg Actions */}
                      <div className={cn(
                        "absolute top-0 opacity-0 group-hover:opacity-100 transition-all z-10 flex gap-1",
                        isMe ? "-left-12" : "-right-12"
                      )}>
                         <button className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
                            <Reply size={14} />
                         </button>
                         <button className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
                            <Pin size={14} />
                         </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {remoteTyping && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-2">
                   <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.span 
                          key={i} 
                          animate={{ opacity: [0.3, 1, 0.3] }} 
                          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                          className="w-1.5 h-1.5 bg-indigo-500 rounded-full" 
                        />
                      ))}
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {selectedContact.name} {t.isTyping}
                   </span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
               <div className="max-w-4xl mx-auto flex items-end gap-4">
                  <div className="flex gap-1 mb-2 relative group/attach">
                     <button className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all">
                        <Paperclip size={20} />
                     </button>
                     <div className="absolute bottom-full left-0 mb-4 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover/attach:opacity-100 group-hover/attach:visible transition-all p-2 space-y-1 backdrop-blur-xl">
                        <button className="w-full text-left p-3 text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 rounded-xl flex items-center gap-3 transition-colors">
                           <ImageIcon size={14} /> Images
                        </button>
                        <button className="w-full text-left p-3 text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 rounded-xl flex items-center gap-3 transition-colors">
                           <FileText size={14} /> Documents
                        </button>
                        <button className="w-full text-left p-3 text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 rounded-xl flex items-center gap-3 transition-colors">
                           <Zap size={14} /> {t.shareLocation}
                        </button>
                     </div>
                     <button className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all">
                        <ImageIcon size={20} />
                     </button>
                  </div>
                  
                  <div className="flex-1 relative">
                     <textarea
                       value={inputValue}
                       onChange={handleInputChange}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSend();
                         }
                       }}
                       placeholder={t.typeMessage}
                       rows={1}
                       className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-800 rounded-[1.8rem] py-4 px-6 text-sm font-bold resize-none transition-all dark:text-white"
                     />
                     <div className="absolute right-4 bottom-4 flex gap-3">
                        <button className="text-slate-400 hover:text-rose-500 transition-colors">
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
                      inputValue.trim() ? "hover:scale-105 active:scale-95 translate-y-[-2px]" : "opacity-30 grayscale cursor-not-allowed"
                    )}
                  >
                    <Send size={24} />
                  </button>
               </div>
               <div className="text-center mt-6">
                  <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.6em]">GULA OS v4.1 Secure Messaging Protocol</span>
               </div>
            </div>

            {/* Calling Overlay */}
            <AnimatePresence>
              {activeCall && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-white"
                >
                   <div className="relative mb-12">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl" 
                      />
                      <div className="relative w-48 h-48 rounded-[3.5rem] bg-indigo-600/20 border-2 border-indigo-500/30 flex items-center justify-center overflow-hidden">
                         {selectedContact.type === 'doctor' ? <Stethoscope size={80} className="text-indigo-400" /> : <User size={80} className="text-indigo-400" />}
                      </div>
                   </div>

                   <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">{selectedContact.name}</h3>
                   <div className="flex items-center gap-4 text-indigo-400 mb-24">
                      <Zap size={20} className="animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] font-mono">
                         {activeCall.status === 'calling' ? t.calling : 'SECURE CHANNEL ESTABLISHED'}
                      </span>
                   </div>

                   <div className="flex gap-8 items-center">
                      <button className="p-6 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl transition-all border border-slate-700">
                         {activeCall.type === 'voice' ? <Mic size={32} /> : <Video size={32} />}
                      </button>
                      <button 
                        onClick={() => setActiveCall(null)}
                        className="p-8 bg-rose-500 text-white rounded-[2.5rem] shadow-2xl shadow-rose-500/40 hover:scale-110 active:scale-95 transition-all"
                      >
                         <Phone size={40} className="rotate-[135deg]" />
                      </button>
                      <button className="p-6 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl transition-all border border-slate-700">
                         <MoreVertical size={32} />
                      </button>
                   </div>

                   <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                      <Shield size={16} className="text-emerald-500" />
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Quantum-Hashed Bio-Authentication</span>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/20 dark:bg-black/20">
             <div className="w-36 h-36 bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 rounded-[3.5rem] flex items-center justify-center mb-8 border border-white/10 shadow-inner">
                <MessageSquare size={64} className="text-indigo-500/80 animate-pulse" />
             </div>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4">Secured Communication Hub</h3>
             <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
                Connect with medical professionals, laboratory specialists, and system infrastructure through quantum-secured channels.
             </p>
             <div className="grid grid-cols-3 gap-12 mt-16">
                {[
                  { label: 'Network Latency', val: '8.4ms', icon: Zap },
                  { label: 'Audit Integrity', val: 'Verified', icon: Shield },
                  { label: 'Cipher Layer', val: 'Post-Quantum', icon: Lock },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center group">
                     <stat.icon size={26} className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{stat.label}</span>
                     <span className="text-xs font-black dark:text-white uppercase">{stat.val}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
