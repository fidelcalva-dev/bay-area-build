/**
 * Versioning & Publish Panel — /admin/pricing?tab=versioning
 * Manages pricing version lifecycle: draft → pending → published → archived
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  GitBranch, CheckCircle2, Clock, Archive, Plus, 
  Upload, Activity, AlertTriangle, Loader2 
} from 'lucide-react';
import { 
  fetchVersions, getPublishedVersion, createDraftVersion, publishVersion,
  type PricingVersion 
} from '@/lib/pricingVersionService';
import { checkPublicCatalogHealth } from '@/lib/pricingCatalogCompiler';

const STATUS_STYLES: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }> = {
  published: { variant: 'default', icon: CheckCircle2 },
  draft: { variant: 'secondary', icon: Clock },
  pending_approval: { variant: 'outline', icon: Activity },
  archived: { variant: 'outline', icon: Archive },
};

export default function VersioningPublishPanel() {
  const { toast } = useToast();
  const [versions, setVersions] = useState<PricingVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [healthIssues, setHealthIssues] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [v, health] = await Promise.all([
      fetchVersions(),
      checkPublicCatalogHealth(),
    ]);
    setVersions(v);
    setHealthIssues(health.issues);
    setLoading(false);
  }

  async function handleCreateDraft() {
    if (!newCode.trim()) return;
    const draft = await createDraftVersion(newCode.trim(), newNotes.trim());
    if (draft) {
      toast({ title: 'Draft created', description: `Version ${draft.version_code}` });
      setShowCreate(false);
      setNewCode('');
      setNewNotes('');
      loadData();
    }
  }

  async function handlePublish(versionId: string) {
    setPublishing(versionId);
    const result = await publishVersion(versionId);
    setPublishing(null);
    if (result.success) {
      toast({ title: 'Published successfully', description: `${result.warnings.length} warnings` });
    } else {
      toast({ title: 'Publish failed', description: result.errors.join(', '), variant: 'destructive' });
    }
    loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const published = versions.find(v => v.status === 'published');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            Pricing Versioning & Publish
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage pricing versions. Only one version can be published at a time.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Draft
        </Button>
      </div>

      {/* Health Status */}
      {healthIssues.length > 0 && (
        <Card className="border-yellow-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              Public Catalog Health Issues ({healthIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-muted-foreground space-y-1">
              {healthIssues.map((issue, i) => (
                <li key={i}>• {issue}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Create Draft Form */}
      {showCreate && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Version code (e.g., v2.0)"
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
            />
            <Textarea
              placeholder="Version notes..."
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateDraft} disabled={!newCode.trim()}>
                Create Draft
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Published */}
      {published && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Active Published Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm">
              <Badge>{published.version_code}</Badge>
              <span className="text-muted-foreground">
                Published {published.published_at ? new Date(published.published_at).toLocaleDateString() : '—'}
              </span>
              {published.notes && (
                <span className="text-muted-foreground truncate">{published.notes}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Versions */}
      <div className="space-y-2">
        {versions.map(v => {
          const style = STATUS_STYLES[v.status] || STATUS_STYLES.draft;
          const Icon = style.icon;
          const isPublishing = publishing === v.id;

          return (
            <Card key={v.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{v.version_code}</span>
                      <Badge variant={style.variant} className="text-[10px]">
                        {v.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                      {v.notes || 'No notes'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(v.created_at).toLocaleDateString()}
                  </span>
                  {(v.status === 'draft' || v.status === 'pending_approval') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePublish(v.id)}
                      disabled={!!publishing}
                    >
                      {isPublishing ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Upload className="w-3 h-3 mr-1" />
                      )}
                      Publish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
