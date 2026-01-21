// AI Sales Chat Widget - Floating chat bubble with full conversation UI
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, X, Send, User, Bot, Loader2, Phone, 
  ChevronRight, Minimize2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAIChat, type ChatMessage, type ChatContext } from '@/hooks/useAIChat';
import { useOfficeStatus } from '@/hooks/useOfficeStatus';
import { useNavigate } from 'react-router-dom';

// ============================================================
// CHAT BUBBLE TRIGGER
// ============================================================

function ChatBubble({ onClick, hasUnread }: { onClick: () => void; hasUnread: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-50 sm:bottom-6",
        "w-14 h-14 rounded-full shadow-lg",
        "bg-primary text-primary-foreground",
        "flex items-center justify-center",
        "hover:scale-110 active:scale-95 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
      aria-label="Open chat"
    >
      <MessageCircle className="w-6 h-6" />
      {hasUnread && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-pulse" />
      )}
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
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      {/* Message Content */}
      <div className={cn("flex flex-col max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "px-3 py-2 rounded-2xl text-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-muted text-foreground rounded-bl-md"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Quick Replies */}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.replace(/\D/g, '').length >= 10) {
      onSubmit({ name: name.trim(), phone, email: email.trim() || undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-muted/50 rounded-lg space-y-2">
      <p className="text-sm font-medium text-foreground">Save your quote</p>
      <Input
        placeholder="Your name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 text-sm"
        required
      />
      <Input
        placeholder="Phone number *"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        className="h-9 text-sm"
        required
      />
      <Input
        placeholder="Email (optional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-9 text-sm"
      />
      <Button 
        type="submit" 
        size="sm" 
        className="w-full"
        disabled={isSubmitting || !name.trim() || phone.replace(/\D/g, '').length < 10}
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Get Quote'}
      </Button>
    </form>
  );
}

// ============================================================
// QUOTE CTA
// ============================================================

function QuoteCTA({ context, onClick }: { context: ChatContext; onClick: () => void }) {
  return (
    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
      <p className="text-sm font-medium text-foreground mb-2">Ready for your instant quote?</p>
      {context.zip && (
        <p className="text-xs text-muted-foreground mb-2">
          📍 {context.zip} • {context.material === 'heavy' ? 'Heavy Materials' : 'General Debris'}
          {context.size && ` • ${context.size} yard`}
        </p>
      )}
      <Button size="sm" className="w-full gap-2" onClick={onClick}>
        Get Instant Quote <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
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
  const [showQuoteCTA, setShowQuoteCTA] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Office status for dynamic messaging
  const officeStatus = useOfficeStatus();
  
  const {
    messages,
    isLoading,
    context,
    isLeadCaptured,
    sendMessage,
    captureLead,
    initializeChat,
    resetChat,
  } = useAIChat();

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, initializeChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show quote CTA after a few exchanges with context
  useEffect(() => {
    if (messages.length >= 4 && context.zip && !showQuoteCTA) {
      setShowQuoteCTA(true);
    }
  }, [messages.length, context.zip, showQuoteCTA]);

  // Handle send
  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  // Handle quick reply
  const handleQuickReply = (reply: string) => {
    if (reply === 'Talk to a human') {
      setShowLeadForm(true);
      sendMessage("I'd like to speak with someone on your team.");
    } else if (reply === 'Get an instant quote' || reply === 'Get my instant quote') {
      handleGoToQuote();
    } else {
      sendMessage(reply);
    }
  };

  // Navigate to quote with prefilled data
  const handleGoToQuote = () => {
    const params = new URLSearchParams();
    if (context.zip) params.set('zip', context.zip);
    if (context.material) params.set('material', context.material);
    if (context.size) params.set('size', context.size.toString());
    
    setIsOpen(false);
    navigate(`/quote?${params.toString()}`);
  };

  // Handle lead capture
  const handleLeadCapture = async (data: { name: string; phone: string; email?: string }) => {
    await captureLead(data);
    setShowLeadForm(false);
    sendMessage(`Great! I've saved your info. We'll text you shortly at ${data.phone}. In the meantime, want to see your instant estimate?`);
  };

  if (!isOpen) {
    return <ChatBubble onClick={() => setIsOpen(true)} hasUnread={false} />;
  }

  return (
    <div className={cn(
      "fixed z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden",
      "flex flex-col transition-all duration-300",
      isMinimized 
        ? "bottom-20 right-4 sm:bottom-6 w-72 h-14" 
        : "bottom-20 right-4 sm:bottom-6 w-[calc(100%-2rem)] sm:w-96 h-[500px] max-h-[80vh]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Calsan Assistant</h4>
            <p className="text-xs text-primary-foreground/70 flex items-center gap-1.5">
              {isLoading ? (
                'Typing...'
              ) : (
                <>
                  <span 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      officeStatus.isOpen 
                        ? "bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.6)]" 
                        : "bg-amber-400"
                    )} 
                  />
                  {officeStatus.isOpen ? 'Live support' : 'After hours'}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            aria-label={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                onQuickReply={handleQuickReply}
              />
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-3 py-2 rounded-2xl bg-muted rounded-bl-md">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Lead capture form */}
            {showLeadForm && !isLeadCaptured && (
              <LeadCaptureForm 
                onSubmit={handleLeadCapture} 
                isSubmitting={isLoading}
              />
            )}

            {/* Quote CTA */}
            {showQuoteCTA && !showLeadForm && (
              <QuoteCTA context={context} onClick={handleGoToQuote} />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 h-10"
                disabled={isLoading}
              />
              <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
              AI-powered • <a href="tel:+15106802150" className="text-primary hover:underline">Call (510) 680-2150</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AIChatWidget;
