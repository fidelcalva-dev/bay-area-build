// Large Interactive AI Chat Section for Homepage
import { useState, useRef, useEffect } from 'react';
import { Send, ArrowRight, Loader2, HardHat, MapPin, Package, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCalsanChat, type ChatMessage } from '@/hooks/useCalsanChat';
import { useNavigate } from 'react-router-dom';
import { AnimatedSection } from '@/components/animations';

function AIChatMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-primary text-primary-foreground" : "bg-primary/10"
      )}>
        {isUser ? (
          <span className="text-xs font-bold">You</span>
        ) : (
          <HardHat className="w-4 h-4 text-primary" />
        )}
      </div>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        isUser
          ? "bg-primary text-primary-foreground rounded-tr-md"
          : "bg-card border border-border text-foreground rounded-tl-md"
      )}>
        {message.content}
      </div>
    </div>
  );
}

export function InteractiveAISection() {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, resetChat } = useCalsanChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { icon: Package, text: 'Bathroom remodel in Oakland' },
    { icon: Scale, text: 'Concrete removal in San Jose' },
    { icon: MapPin, text: 'Garage cleanout in SF' },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-wide">
        <AnimatedSection className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Ask About Your Dumpster in Seconds
          </h2>
          <p className="text-muted-foreground">
            Our system guides you to the right size, material type, and delivery timing.
          </p>
        </AnimatedSection>

        <div className="max-w-2xl mx-auto">
          {/* Chat Area */}
          <div className="bg-muted/30 border border-border rounded-2xl overflow-hidden">
            {/* Messages */}
            <div className={cn(
              "p-4 md:p-6 overflow-y-auto transition-all duration-300",
              hasMessages ? "min-h-[200px] max-h-[400px]" : "min-h-0"
            )}>
              {messages.map((msg) => (
                <AIChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <HardHat className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What project are you working on? (ex: bathroom remodel in Oakland)"
                  className="flex-1 bg-card border-border h-12 text-base"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  variant="cta"
                  size="icon"
                  className="h-12 w-12 shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Quick prompts (only when no messages) */}
              {!hasMessages && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickPrompts.map(({ icon: Icon, text }) => (
                    <button
                      key={text}
                      onClick={() => {
                        setInput(text);
                        sendMessage(text);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded-full hover:border-primary/40 hover:text-foreground transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA below chat */}
          <div className="text-center mt-6">
            <Button asChild variant="outline" size="lg" className="group">
              <a href="/quote">
                See Exact Price for Your Project
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
