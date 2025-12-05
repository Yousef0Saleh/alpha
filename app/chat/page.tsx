"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import LoaderOverlay from "@/components/LoaderOverlay";
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from "@/lib/config";
import {
  MessageSquare,
  Send,
  Search,
  Menu,
  X,
  MoreVertical,
  Pin,
  Trash2,
  User,
  Bot,
  Home,
  Plus,
  Sparkles
} from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
}

interface GroupedConversations {
  pinned: Conversation[];
  today: Conversation[];
  yesterday: Conversation[];
  this_week: Conversation[];
  older: Conversation[];
}

export default function ChatPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<GroupedConversations>({
    pinned: [],
    today: [],
    yesterday: [],
    this_week: [],
    older: []
  });
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const streamingQueue = useRef<string>("");
  const isStreamingActive = useRef(false);
  const [limits, setLimits] = useState({
    messages_used: 0,
    messages_limit: 50,
    files_used: 0,
    files_limit: 3,
    can_send_message: true,
    can_upload_file: true
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/routes/get_csrf.php`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.status === "ok" && data.csrf_token) setCsrfToken(data.csrf_token);
      } catch { }
    })();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/signin");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadConversations();
      checkLimits();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  // وظيفة عرض النص حرف حرف
  const typewriterEffect = async (fullText: string) => {
    isStreamingActive.current = true;
    const chars = fullText.split('');
    let displayedText = '';

    for (let i = 0; i < chars.length; i++) {
      if (!isStreamingActive.current) break;

      displayedText += chars[i];
      setStreamingText(displayedText);

      // سرعة الكتابة (كل 20ms حرف = سريع وسلس)
      await new Promise(resolve => setTimeout(resolve, 15));
    }
  };

  const createInitialConversation = async () => {
    if (!csrfToken) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/routes/chat/create_conversation.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({ title: "محادثة جديدة" })
      });
      const data = await res.json();
      if (data.status === "success") {
        setCurrentConvId(data.conversation_id);
        setMessages([]);
        loadConversations();
        return data.conversation_id;
      }
    } catch (err) {
      console.error("Failed to create initial conversation:", err);
    }
    return null;
  };

  const loadConversations = async (search = "") => {
    try {
      const url = search
        ? `${API_BASE_URL}/routes/chat/get_conversations.php?search=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/routes/chat/get_conversations.php`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.status === "success") {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const checkLimits = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/routes/chat/check_limits.php`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.status === "success") {
        setLimits(data.limits);
      }
    } catch { }
  };

  const createNewConversation = async () => {
    if (!csrfToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/routes/chat/create_conversation.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({ title: "محادثة جديدة" })
      });
      const data = await res.json();
      if (data.status === "success") {
        setCurrentConvId(data.conversation_id);
        setMessages([]);
        setStreamingText("");
        loadConversations();
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/chat/get_messages.php?conversation_id=${convId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.status === "success") {
        setMessages(data.messages);
        setCurrentConvId(convId);
        setStreamingText("");
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || !csrfToken || sending || !limits.can_send_message) return;

    // إنشاء محادثة جديدة إذا لم تكن موجودة
    let convId = currentConvId;
    if (!convId) {
      convId = await createInitialConversation();
      if (!convId) {
        alert("فشل إنشاء المحادثة");
        return;
      }
    }

    // إيقاف أي streaming سابق
    isStreamingActive.current = false;
    streamingQueue.current = "";

    setSending(true);
    setStreaming(true);
    setStreamingText("");
    setInput("");

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: messageText,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`${API_BASE_URL}/routes/chat/send_message.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({
          conversation_id: convId,
          message: messageText
        })
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const json = JSON.parse(line.slice(6));

                if (json.debug) {
                  console.error("🔴 Gemini API Error:", json.debug);
                }

                if (json.error_details) {
                  console.error("🔴 Error Details:", json.error_details);
                }

                if (json.chunk) {
                  // إضافة الـ chunk للـ queue وعرضه حرف حرف
                  streamingQueue.current += json.chunk;
                  if (!isStreamingActive.current) {
                    typewriterEffect(streamingQueue.current);
                  }
                } else if (json.done) {
                  // التأكد من عرض كل النص
                  if (streamingQueue.current) {
                    await typewriterEffect(streamingQueue.current);
                  }
                  setStreaming(false);
                } else if (json.error) {
                  console.error("🔴 Server Error:", json.error);
                  alert(json.error);
                  setStreaming(false);
                  isStreamingActive.current = false;
                }
              } catch (e) {
                console.error("🔴 JSON Parse Error:", e, "Line:", line);
              }
            }
          }
        }
      }

      loadConversations();
      checkLimits();
    } catch (err) {
      console.error("Send message error:", err);
      alert("حصل خطأ في الإرسال");
      isStreamingActive.current = false;
    } finally {
      setSending(false);
      setTimeout(() => {
        streamingQueue.current = "";
        setStreamingText("");
        loadMessages(convId);
      }, 500);
    }
  };

  const deleteConversation = async (convId: number) => {
    if (!confirm("متأكد انك عايز تمسح المحادثة دي؟")) return;
    if (!csrfToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/routes/chat/delete_conversation.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({ conversation_id: convId })
      });
      const data = await res.json();
      if (data.status === "success") {
        if (currentConvId === convId) {
          setCurrentConvId(null);
          setMessages([]);
          setStreamingText("");
        }
        loadConversations();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const togglePin = async (convId: number) => {
    if (!csrfToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/routes/chat/toggle_pin.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({ conversation_id: convId })
      });
      const data = await res.json();
      if (data.status === "success") {
        loadConversations();
      }
    } catch (err) {
      console.error("Pin toggle failed:", err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    loadConversations(query);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("تم النسخ!");
  };

  if (authLoading || !mounted) return <LoaderOverlay />;

  const allConvs = [
    ...conversations.pinned,
    ...conversations.today,
    ...conversations.yesterday,
    ...conversations.this_week,
    ...conversations.older
  ];

  const showWelcome = (messages.length === 0 && !streamingText) || !currentConvId;
  const userName = user?.name || 'الطالب';

  return (
    <div className="flex h-screen text-white overflow-hidden">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "right-0" : "-right-80"
          } fixed lg:static inset-y-0 z-50 w-80 transition-all duration-300 border-l lg:border-r lg:border-l-0 border-white/10 flex flex-col bg-gray-950 lg:right-auto`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <button
            onClick={createNewConversation}
            className="btn-sm w-full bg-gradient-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:bg-[length:100%_150%] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            محادثة جديدة
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pr-10 pl-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-custom">
          {conversations.pinned.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2 flex items-center gap-2">
                <Pin className="w-3 h-3" />
                مثبتة
              </h3>
              <div className="space-y-2">
                {conversations.pinned.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    active={currentConvId === conv.id}
                    onClick={() => loadMessages(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                    onPin={() => togglePin(conv.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {conversations.today.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2">اليوم</h3>
              <div className="space-y-2">
                {conversations.today.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    active={currentConvId === conv.id}
                    onClick={() => loadMessages(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                    onPin={() => togglePin(conv.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {conversations.yesterday.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2">امبارح</h3>
              <div className="space-y-2">
                {conversations.yesterday.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    active={currentConvId === conv.id}
                    onClick={() => loadMessages(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                    onPin={() => togglePin(conv.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {conversations.this_week.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2">الاسبوع ده</h3>
              <div className="space-y-2">
                {conversations.this_week.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    active={currentConvId === conv.id}
                    onClick={() => loadMessages(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                    onPin={() => togglePin(conv.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {conversations.older.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2">أقدم</h3>
              <div className="space-y-2">
                {conversations.older.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    active={currentConvId === conv.id}
                    onClick={() => loadMessages(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                    onPin={() => togglePin(conv.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {allConvs.length === 0 && (
            <p className="text-gray-500 text-sm text-center mt-8">مفيش محادثات لسه</p>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-gray-400 space-y-2">
            <div className="flex items-center justify-between px-2">
              <span>الرسائل</span>
              <span className="font-medium text-gray-300">{limits.messages_used} / {limits.messages_limit}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Floating Header */}
        <header className="absolute top-0 left-0 right-0 z-10">
          <div className="mx-4 lg:mx-6 mt-4 lg:mt-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between px-4 lg:px-6 py-4">
              <div className="flex items-center gap-3 lg:gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-base lg:text-lg font-semibold">مساعد الدراسة</h1>
                </div>
              </div>
              <button
                onClick={() => router.push("/")}
                className="btn-sm relative bg-linear-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] text-gray-300 
                           before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent 
                           before:[background:linear-gradient(to_right,theme(colors.gray.800),theme(colors.gray.700),theme(colors.gray.800))_border-box] 
                           before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] 
                           hover:bg-[length:100%_150%] flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">رجوع</span>
              </button>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-2 lg:px-4 pb-32 lg:pb-36 pt-24 lg:pt-32 scrollbar-custom">
          <div className="max-w-6xl mx-auto space-y-6">
            {showWelcome ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/50">
                  <Bot className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-center">
                  أهلاً {userName}!
                </h2>
                <p className="text-gray-400 text-base lg:text-lg mb-8 text-center">ازاي اقدر اساعدك النهاردة؟</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} onCopy={copyToClipboard} />
                ))}

                {streaming && (
                  <MessageBubble
                    message={{
                      id: -1,
                      role: "assistant",
                      content: streamingText,
                      created_at: new Date().toISOString()
                    }}
                    onCopy={copyToClipboard}
                    streaming
                    isLoading={!streamingText}
                  />
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="px-4 lg:px-6 pb-4 lg:pb-6">
            <div className="max-w-6xl mx-auto">
              {!limits.can_send_message && (
                <div className="mb-4 p-3 lg:p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs lg:text-sm text-center">
                  وصلت للحد اليومي (50 رسالة). ارجع بكرة! 🚫
                </div>
              )}

              <div className="flex gap-2 lg:gap-3 items-end bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={limits.can_send_message ? "اكتب سؤالك هنا..." : "وصلت للحد اليومي"}
                  disabled={sending || !limits.can_send_message}
                  rows={1}
                  className="focus:shadow-none focus:ring-0 border-none outline-none flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none disabled:opacity-50 text-sm lg:text-base"
                  style={{ minHeight: "44px", maxHeight: "200px", overflow: "hidden" }}
                  data-gramm="false"
                  data-gramm_editor="false"
                  data-enable-grammarly="false"
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={sending || !input.trim() || !limits.can_send_message}
                  className="p-2.5 lg:p-3 bg-gradient-to-t from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:from-gray-700 disabled:to-gray-700 rounded-xl transition-all duration-200 shadow-lg disabled:cursor-not-allowed disabled:shadow-none flex-shrink-0"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ConversationItem({
  conv,
  active,
  onClick,
  onDelete,
  onPin
}: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
  onPin: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${active
        ? "bg-white/10 border border-white/20"
        : "hover:bg-white/5 border border-transparent"
        }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-sm text-gray-200 truncate">{conv.title}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {showMenu && (
        <div className="absolute left-0 top-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-xl z-50 min-w-[150px] overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-right text-sm hover:bg-white/10 flex items-center gap-2 text-gray-200"
          >
            <Pin className="w-4 h-4" />
            {conv.is_pinned ? "إلغاء التثبيت" : "تثبيت"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-right text-sm hover:bg-red-500/20 text-red-400 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            حذف
          </button>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  onCopy,
  streaming,
  isLoading
}: {
  message: Message;
  onCopy: (text: string) => void;
  streaming?: boolean;
  isLoading?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-full lg:max-w-3xl w-full ${isUser
          ? "bg-white/5 border border-white/10"
          : "bg-white/5 border border-white/10"
          } rounded-2xl p-4 lg:p-6 backdrop-blur-xl shadow-lg transition-all hover:border-white/20`}
      >
        <div className="flex items-start gap-3 lg:gap-4">
          <div className={`flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${isUser
            ? "bg-gradient-to-br from-gray-700 to-gray-800"
            : "bg-gradient-to-br from-indigo-500 to-purple-500"
            }`}>
            {isUser ? <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" /> : <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-400 mb-2">
              {isUser ? "أنت" : "مساعد الدراسة"}
            </div>

            {isLoading ? (
              <div className="flex items-center gap-1 py-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-code:text-indigo-300">
                <ReactMarkdown
                  components={{
                    code: ({ children }) => (
                      <code className="bg-black/30 px-2 py-1 rounded text-sm text-indigo-300">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto border border-white/10 my-4">{children}</pre>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-200 leading-relaxed mb-4 last:mb-0 text-sm lg:text-base">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="text-gray-200 space-y-2 my-4 text-sm lg:text-base">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="text-gray-200 space-y-2 my-4 text-sm lg:text-base">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-200">{children}</li>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-xl lg:text-2xl font-bold text-white mb-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg lg:text-xl font-bold text-white mb-3">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base lg:text-lg font-semibold text-white mb-2">{children}</h3>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {streaming && (
                  <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-1"></span>
                )}
              </div>
            )}

            {!isUser && !streaming && !isLoading && (
              <button
                onClick={() => onCopy(message.content)}
                className="mt-3 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                نسخ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}