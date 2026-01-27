import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, Video, FolderOpen, MessageSquare, 
  ExternalLink, Loader2, AlertCircle 
} from 'lucide-react';
import { GoogleConnectButton } from './GoogleConnectButton';
import { SendEmailDialog } from './SendEmailDialog';
import { CreateMeetDialog } from './CreateMeetDialog';
import { GoogleLinksDisplay } from './GoogleLinksDisplay';
import { googleService, GoogleConnectionStatus, EntityGoogleLinks } from '@/services/googleService';
import { useToast } from '@/hooks/use-toast';

interface GoogleToolsPanelProps {
  entityType: string;
  entityId: string;
  entityName?: string;
  recipientEmail?: string;
  recipientName?: string;
  showConnect?: boolean;
  allowedTools?: ('email' | 'meet' | 'drive' | 'chat')[];
}

export function GoogleToolsPanel({
  entityType,
  entityId,
  entityName,
  recipientEmail,
  recipientName,
  showConnect = true,
  allowedTools = ['email', 'meet', 'drive', 'chat'],
}: GoogleToolsPanelProps) {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<GoogleConnectionStatus>({ isConnected: false });
  const [mode, setMode] = useState<'DRY_RUN' | 'LIVE'>('DRY_RUN');
  const [entityLinks, setEntityLinks] = useState<EntityGoogleLinks | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isPostingChat, setIsPostingChat] = useState(false);

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [meetDialogOpen, setMeetDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [entityType, entityId]);

  async function loadData() {
    setIsLoadingLinks(true);
    try {
      const [modeResult, linksResult] = await Promise.all([
        googleService.getMode(),
        googleService.getEntityLinks(entityType, entityId),
      ]);
      setMode(modeResult);
      setEntityLinks(linksResult);
    } catch (err) {
      console.error('Failed to load Google data:', err);
    } finally {
      setIsLoadingLinks(false);
    }
  }

  async function handleCreateFolder() {
    if (!connectionStatus.isConnected) {
      toast({ title: 'Please connect your Google account first', variant: 'destructive' });
      return;
    }

    setIsCreatingFolder(true);
    try {
      const folderName = `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} - ${entityName || entityId}`;
      const result = await googleService.createDriveFolder({
        folderName,
        entityType,
        entityId,
      });

      if (result.success) {
        toast({
          title: mode === 'DRY_RUN' ? 'Folder would be created (DRY_RUN)' : 'Folder Created',
          description: result.folderUrl ? `View at: ${result.folderUrl}` : undefined,
        });
        await loadData();
      } else {
        toast({ title: 'Failed to create folder', description: result.error, variant: 'destructive' });
      }
    } finally {
      setIsCreatingFolder(false);
    }
  }

  async function handlePostToChat(spaceName: string, message: string) {
    if (!connectionStatus.isConnected) {
      toast({ title: 'Please connect your Google account first', variant: 'destructive' });
      return;
    }

    setIsPostingChat(true);
    try {
      const result = await googleService.postToChat({
        spaceName,
        text: message,
        entityType,
        entityId,
      });

      if (result.success) {
        toast({
          title: mode === 'DRY_RUN' ? 'Message would be posted (DRY_RUN)' : 'Message Posted',
        });
      } else {
        toast({ title: 'Failed to post message', description: result.error, variant: 'destructive' });
      }
    } finally {
      setIsPostingChat(false);
    }
  }

  const isConnected = connectionStatus.isConnected;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Google Workspace
              <Badge variant={mode === 'DRY_RUN' ? 'secondary' : 'default'} className="text-xs">
                {mode}
              </Badge>
            </CardTitle>
            <CardDescription>Email, Meet, Drive, Chat</CardDescription>
          </div>
          {showConnect && (
            <GoogleConnectButton 
              onConnectionChange={setConnectionStatus}
              size="sm"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            Connect your Google account to use these features
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {allowedTools.includes('email') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEmailDialogOpen(true)}
              disabled={!isConnected}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          )}

          {allowedTools.includes('meet') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setMeetDialogOpen(true)}
              disabled={!isConnected}
            >
              <Video className="w-4 h-4 mr-2" />
              Create Meet
            </Button>
          )}

          {allowedTools.includes('drive') && !entityLinks?.drive_folder_id && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCreateFolder}
              disabled={!isConnected || isCreatingFolder}
            >
              {isCreatingFolder ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FolderOpen className="w-4 h-4 mr-2" />
              )}
              Create Folder
            </Button>
          )}

          {allowedTools.includes('chat') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePostToChat('sales-alerts', `Update on ${entityType} ${entityId}`)}
              disabled={!isConnected || isPostingChat}
            >
              {isPostingChat ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              Post to Chat
            </Button>
          )}
        </div>

        {/* Existing links */}
        {isLoadingLinks ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <GoogleLinksDisplay links={entityLinks} />
        )}
      </CardContent>

      {/* Dialogs */}
      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        entityType={entityType}
        entityId={entityId}
        defaultTo={recipientEmail}
        defaultRecipientName={recipientName}
        onSuccess={loadData}
      />

      <CreateMeetDialog
        open={meetDialogOpen}
        onOpenChange={setMeetDialogOpen}
        entityType={entityType}
        entityId={entityId}
        defaultTitle={`Meeting: ${entityName || entityType} ${entityId.substring(0, 8)}`}
        defaultAttendees={recipientEmail ? [recipientEmail] : []}
        onSuccess={loadData}
      />
    </Card>
  );
}
