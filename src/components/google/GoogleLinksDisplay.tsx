import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Video, FolderOpen, ExternalLink } from 'lucide-react';
import { EntityGoogleLinks } from '@/services/googleService';

interface GoogleLinksDisplayProps {
  links: EntityGoogleLinks | null;
}

export function GoogleLinksDisplay({ links }: GoogleLinksDisplayProps) {
  if (!links) {
    return (
      <p className="text-sm text-muted-foreground">No Google resources linked yet.</p>
    );
  }

  const hasLinks = 
    links.gmail_thread_ids?.length > 0 ||
    links.meet_link ||
    links.drive_folder_url;

  if (!hasLinks) {
    return (
      <p className="text-sm text-muted-foreground">No Google resources linked yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Linked Resources
      </p>
      
      <div className="flex flex-wrap gap-2">
        {/* Gmail threads */}
        {links.gmail_thread_ids?.length > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {links.gmail_thread_ids.length} email{links.gmail_thread_ids.length > 1 ? 's' : ''}
          </Badge>
        )}

        {/* Meet link */}
        {links.meet_link && (
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs"
            onClick={() => window.open(links.meet_link!, '_blank')}
          >
            <Video className="w-3 h-3 mr-1" />
            Join Meet
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        )}

        {/* Drive folder */}
        {links.drive_folder_url && (
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs"
            onClick={() => window.open(links.drive_folder_url!, '_blank')}
          >
            <FolderOpen className="w-3 h-3 mr-1" />
            Open Folder
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        )}

        {/* Drive files count */}
        {links.drive_file_ids_json?.length > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <FolderOpen className="w-3 h-3" />
            {links.drive_file_ids_json.length} file{links.drive_file_ids_json.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </div>
  );
}
