// Calsan Dumpster AI - Chat Widget
import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, User, Bot, Loader2, Phone, 
  Minimize2, ArrowRight, MapPin, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCalsanChat, type ChatMessage } from '@/hooks/useCalsanChat';
import { useNavigate } from 'react-router-dom';

// ============================================================
// CHAT BUBBLE TRIGGER
// ============================================================

function ChatBubble({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-50 sm:bottom-6",
        "flex items-center gap-2 px-4 py-3 rounded-full shadow-lg",
        "bg-primary text-primary-foreground",
        "hover:scale-105 active:scale-95 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
      aria-label="Chat with Calsan"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-medium hidden sm:inline">Chat with Calsan</span>
    </button>
  );
}

// ============================================================
// MESSAGE BUBBLE
// ============================================================

function MessageBubble({ message, onQuickReply }: { 
  message: ChatMessage; 
  onQuickReply: (reply: string) => void;
}) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex gap-2 mb-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      
      <div className={cn("flex flex-col max-w-[82%]", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "px-3 py-2 rounded-2xl text-sm leading-relaxed",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-muted text-foreground rounded-bl-md"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {message.quickReplies && message.quickReplies.length > 0 && !isUser && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => onQuickReply(reply)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full",
                  "bg-background border border-primary/30 text-primary",
                  "hover:bg-primary/10 transition-colors"
                )}
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LEAD CAPTURE FORM
// ============================================================

function LeadCaptureForm({ 
  onSubmit, 
  isSubmitting 
}: { 
  onSubmit: (data: { name: string; phone: string; email?: string }) => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (name.trim() && phone.replace(/\D/g, '').length >= 10) onSubmit({ name: name.trim(), phone, email: email.trim() || undefined }); }} className="p-3 bg-muted/50 rounded-lg space-y-2 mx-2">
      <p className="text-sm font-medium text-foreground">We will reach out shortly</p>
      <Input placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" required />
      <Input placeholder="Phone number *" type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className="h-9 text-sm" required />
      <Input placeholder="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-sm" />
      <Button type="submit" size="sm" className="w-full" disabled={isSubmitting || !name.trim() || phone.replace(/\D/g, '').length < 10}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
      </Button>
    </form>
  );
}

// ============================================================
// MAIN CHAT WIDGET
// ============================================================

export function AIChatWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    context,
    isLeadCaptured,
    sendMessage,
    captureLead,
    initializeChat,
    resetChat,
  } = useCalsanChat();

  useEffect(() => {
    if (isOpen) initializeChat();
  }, [isOpen, initializeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleQuickReply = (reply: string) => {
    if (reply === 'Talk to a human' || reply === 'Call (510) 680-2150') {
      setShowLeadForm(true);
    } else if (reply === 'Get an instant quote' || reply === 'Get instant quote') {
      handleGoToQuote();
    } else {
      sendMessage(reply);
    }
  };

  const handleGoToQuote = () => {
    const params = new URLSearchParams();
    if (context.zip) params.set('zip', context.zip);
    if (context.material) params.set('material', context.material);
    if (context.size) params.set('size', context.size.toString());
    setIsOpen(false);
    navigate(`/quote?${params.toString()}`);
  };

  const handleLeadCapture = async (data: { name: string; phone: string; email?: string }) => {
    await captureLead(data);
    setShowLeadForm(false);
  };

  if (!isOpen) {
    return <ChatBubble onClick={() => setIsOpen(true)} />;
  }

  return (
    <div className={cn(
      "fixed z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300",
      isMinimized 
        ? "bottom-20 right-4 sm:bottom-6 w-72 h-14" 
        : "bottom-20 right-4 sm:bottom-6 w-[calc(100%-2rem)] sm:w-96 h-[520px] max-h-[80vh]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Calsan Dumpster AI</h4>
            <p className="text-xs text-primary-foreground/70">
              {isLoading ? 'Typing...' : 'Dumpster rental assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={resetChat} className="p-1.5 hover:bg-white/10 rounded transition-colors" aria-label="New chat" title="Start over">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded transition-colors" aria-label={isMinimized ? 'Expand' : 'Minimize'}>
            <Minimize2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded transition-colors" aria-label="Close chat">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onQuickReply={handleQuickReply} />
            ))}
            
            {isLoading && (
              <div className="flex gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-3 py-2 rounded-2xl bg-muted rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {showLeadForm && !isLeadCaptured && (
              <LeadCaptureForm onSubmit={handleLeadCapture} isSubmitting={isLoading} />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Action bar */}
          <div className="px-3 pb-1 flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5" onClick={handleGoToQuote}>
              <ArrowRight className="w-3 h-3" /> Get Instant Quote
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" asChild>
              <a href="tel:+15106802150"><Phone className="w-3 h-3" /> Call Now</a>
            </Button>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-background shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 h-10"
                disabled={isLoading}
              />
              <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading} className="h-10 w-10 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              AI-powered assistant | <a href="tel:+15106802150" className="text-primary hover:underline">(510) 680-2150</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AIChatWidget;
