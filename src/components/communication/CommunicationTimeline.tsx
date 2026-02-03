import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  PhoneIncoming, 
  PhoneOutgoing,
  PhoneMissed,
  Send,
  RefreshCw,
  Filter,
  Play,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getCommunicationTimeline, 
  formatCallDuration,
  type CommunicationItem 
} from "@/lib/ghlCommunication";
import { formatDistanceToNow, format } from "date-fns";

interface CommunicationTimelineProps {
  entityType: "customer" | "contact" | "lead" | "order";
  entityId: string;
  title?: string;
  showFilters?: boolean;
  maxHeight?: string;
  onSendMessage?: () => void;
}

type FilterType = "all" | "sms" | "email" | "call";

export function CommunicationTimeline({
  entityType,
  entityId,
  title = "Communications",
  showFilters = true,
  maxHeight = "500px",
  onSendMessage,
}: CommunicationTimelineProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: items, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["communication-timeline", entityType, entityId],
    queryFn: () => getCommunicationTimeline(entityType, entityId),
    enabled: !!entityId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const filteredItems = (items || []).filter(item => {
    if (filter === "all") return true;
    if (filter === "sms") return item.channel === "SMS";
    if (filter === "email") return item.channel === "EMAIL";
    if (filter === "call") return item.type === "call";
    return true;
  });

  const getChannelIcon = (item: CommunicationItem) => {
    if (item.type === "call") {
      if (item.status === "MISSED" || item.status === "NO_ANSWER") {
        return <PhoneMissed className="w-4 h-4 text-destructive" />;
      }
      return item.direction === "INBOUND" 
        ? <PhoneIncoming className="w-4 h-4 text-green-500" />
        : <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
    }
    
    if (item.channel === "EMAIL") {
      return <Mail className="w-4 h-4" />;
    }
    
    return <MessageSquare className="w-4 h-4" />;
  };

  const getStatusBadge = (item: CommunicationItem) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      SENT: { variant: "default", label: "Sent" },
      DELIVERED: { variant: "default", label: "Delivered" },
      RECEIVED: { variant: "secondary", label: "Received" },
      READ: { variant: "secondary", label: "Read" },
      FAILED: { variant: "destructive", label: "Failed" },
      PENDING: { variant: "outline", label: "Pending" },
      DRY_RUN: { variant: "outline", label: "Draft" },
      ANSWERED: { variant: "default", label: "Answered" },
      COMPLETED: { variant: "default", label: "Completed" },
      MISSED: { variant: "destructive", label: "Missed" },
      NO_ANSWER: { variant: "destructive", label: "No Answer" },
      VOICEMAIL: { variant: "secondary", label: "Voicemail" },
    };

    const status = statusMap[item.status] || { variant: "outline", label: item.status };
    return <Badge variant={status.variant} className="text-xs">{status.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onSendMessage && (
              <Button size="sm" variant="outline" onClick={onSendMessage}>
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 mt-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(["all", "sms", "email", "call"] as FilterType[]).map(f => (
              <Badge
                key={f}
                variant={filter === f ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f.toUpperCase()}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No communications yet</p>
          </div>
        ) : (
          <ScrollArea style={{ height: maxHeight }}>
            <div className="space-y-4">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className={`flex gap-3 p-3 rounded-lg border ${
                    item.direction === "INBOUND" 
                      ? "bg-muted/30 border-l-4 border-l-green-500" 
                      : "bg-background border-l-4 border-l-blue-500"
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {getChannelIcon(item)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {item.direction === "INBOUND" ? "From" : "To"}: {item.from || item.to || "Unknown"}
                      </span>
                      {getStatusBadge(item)}
                      <Badge variant="outline" className="text-xs">
                        {item.channel}
                      </Badge>
                    </div>

                    {item.type === "message" && item.body && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.subject && <strong>{item.subject}: </strong>}
                        {item.body}
                      </p>
                    )}

                    {item.type === "call" && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatCallDuration(item.duration_seconds || 0)}</span>
                        {item.recording_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => window.open(item.recording_url, "_blank")}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Recording
                          </Button>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      {" · "}
                      {format(new Date(item.timestamp), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
