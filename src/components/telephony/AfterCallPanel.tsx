import { useState } from 'react';
import { 
  FileText, 
  Send, 
  Mail, 
  MessageSquare, 
  Copy, 
  Check,
  Calculator,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useCallCoaching } from '@/hooks/useCallAI';
import { cn } from '@/lib/utils';

interface AfterCallPanelProps {
  callId: string;
  onCreateQuote?: (data: { zip?: string; material?: string; size?: number }) => void;
  onScheduleCallback?: () => void;
}

export function AfterCallPanel({ callId, onCreateQuote, onScheduleCallback }: AfterCallPanelProps) {
  const { coachingState, updateFollowupStatus } = useCallCoaching(callId);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedBody, setEditedBody] = useState('');

  const { insight, followups } = coachingState;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (id: string, body: string) => {
    setEditingId(id);
    setEditedBody(body);
  };

  const handleSaveEdit = (id: string) => {
    // In a real implementation, this would save the edit
    setEditingId(null);
    setEditedBody('');
  };

  const getActionIcon = (action: string | null) => {
    switch (action) {
      case 'create_quote':
        return <Calculator className="w-4 h-4" />;
      case 'schedule_callback':
        return <Calendar className="w-4 h-4" />;
      case 'send_followup':
        return <Send className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  const handlePrimaryAction = () => {
    switch (insight?.next_best_action) {
      case 'create_quote':
        if (onCreateQuote) {
          onCreateQuote({
            zip: insight.detected_zip_code || undefined,
            material: insight.detected_material_category || undefined,
            size: insight.detected_size_preference || undefined,
          });
        }
        break;
      case 'schedule_callback':
        if (onScheduleCallback) {
          onScheduleCallback();
        }
        break;
      default:
        break;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="w-5 h-5 text-primary" />
          Call Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Bullets */}
        {insight?.summary_bullets && insight.summary_bullets.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Points</h4>
            <ul className="space-y-1">
              {insight.summary_bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detected Info Summary */}
        <div className="flex gap-2 flex-wrap">
          {insight?.detected_zip_code && (
            <Badge variant="secondary">ZIP: {insight.detected_zip_code}</Badge>
          )}
          {insight?.detected_material_category && (
            <Badge variant="secondary">{insight.detected_material_category}</Badge>
          )}
          {insight?.detected_size_preference && (
            <Badge variant="secondary">{insight.detected_size_preference}yd</Badge>
          )}
        </div>

        {/* Recommended Next Action */}
        {insight?.next_best_action && insight.next_best_action !== 'no_action' && (
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Recommended Next Step</p>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full gap-2"
              onClick={handlePrimaryAction}
            >
              {getActionIcon(insight.next_best_action)}
              {insight.next_best_action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          </div>
        )}

        {/* Follow-up Drafts */}
        {followups.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Follow-up Drafts</h4>
            
            {followups.map((followup) => (
              <div 
                key={followup.id} 
                className={cn(
                  "border rounded-lg p-3 space-y-2",
                  followup.status === 'SENT' && "opacity-60",
                  followup.status === 'DISCARDED' && "opacity-40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {followup.channel === 'SMS' ? (
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Mail className="w-4 h-4 text-purple-600" />
                    )}
                    <span className="text-sm font-medium">{followup.channel}</span>
                  </div>
                  <Badge 
                    variant={
                      followup.status === 'SENT' ? 'default' : 
                      followup.status === 'DISCARDED' ? 'secondary' : 
                      'outline'
                    }
                    className="text-xs"
                  >
                    {followup.status}
                  </Badge>
                </div>

                {followup.subject && (
                  <p className="text-sm font-medium">{followup.subject}</p>
                )}

                {editingId === followup.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(followup.id)}>
                        Save
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {followup.draft_body}
                  </p>
                )}

                {followup.status === 'DRAFT' && editingId !== followup.id && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => copyToClipboard(followup.draft_body, followup.id)}
                    >
                      {copiedId === followup.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(followup.id, followup.draft_body)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => updateFollowupStatus(followup.id, 'DISCARDED')}
                    >
                      Discard
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Follow-ups State */}
        {followups.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No follow-up drafts available yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
