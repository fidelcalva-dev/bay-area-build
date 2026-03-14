import { useState } from 'react';
import { Share2, ExternalLink, Eye, EyeOff, Globe, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSocialLinks, useSaveSocialLink, isPublicSocialUrl, type SocialLinkRow } from '@/hooks/useSocialLinks';

export default function SocialLinksConfig() {
  const { data: links, isLoading } = useSocialLinks();
  const saveMutation = useSaveSocialLink();
  const [editingUrls, setEditingUrls] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const allLinks = links ?? [];
  const footerLinks = allLinks.filter(l => l.show_in_footer && l.is_active);
  const schemaLinks = allLinks.filter(l => l.show_in_schema && l.is_active);

  const handleToggle = (link: SocialLinkRow, field: 'show_in_footer' | 'show_in_schema' | 'is_active') => {
    saveMutation.mutate({ id: link.id, [field]: !link[field] });
  };

  const handleUrlChange = (link: SocialLinkRow, value: string) => {
    setEditingUrls(prev => ({ ...prev, [link.id]: value }));
    const result = isPublicSocialUrl(value);
    if (!result.valid) {
      setValidationErrors(prev => ({ ...prev, [link.id]: result.reason! }));
    } else {
      setValidationErrors(prev => { const n = { ...prev }; delete n[link.id]; return n; });
    }
  };

  const handleUrlSave = (link: SocialLinkRow) => {
    const url = editingUrls[link.id];
    if (url === undefined) return;
    const result = isPublicSocialUrl(url);
    if (!result.valid) return;
    saveMutation.mutate({ id: link.id, public_url: url });
    setEditingUrls(prev => { const n = { ...prev }; delete n[link.id]; return n; });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Share2 className="w-6 h-6 text-primary" />
          Social Links Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage public social media links for the website footer and schema.org markup. Changes persist immediately.
        </p>
      </div>

      {/* Warning */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Only public profile URLs</p>
            <p className="text-muted-foreground">
              Admin/dashboard/analytics URLs are automatically blocked. Only public-facing company or profile pages
              are allowed on the website and schema markup.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{allLinks.filter(l => l.is_active).length}</div>
            <div className="text-xs text-muted-foreground">Active Platforms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{footerLinks.length}</div>
            <div className="text-xs text-muted-foreground">In Footer</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{schemaLinks.length}</div>
            <div className="text-xs text-muted-foreground">In Schema</div>
          </CardContent>
        </Card>
      </div>

      {/* Links */}
      <div className="space-y-3">
        {allLinks.map(link => {
          const currentUrl = editingUrls[link.id] ?? link.public_url;
          const error = validationErrors[link.id];
          const isDirty = editingUrls[link.id] !== undefined && editingUrls[link.id] !== link.public_url;

          return (
            <Card key={link.id} className={!link.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm">{link.label}</h3>
                        {link.show_in_footer && link.is_active && (
                          <Badge variant="outline" className="text-[10px]">Footer</Badge>
                        )}
                        {link.show_in_schema && link.is_active && (
                          <Badge variant="outline" className="text-[10px]">Schema</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={currentUrl}
                          onChange={(e) => handleUrlChange(link, e.target.value)}
                          className={`h-8 text-xs font-mono ${error ? 'border-destructive' : ''}`}
                          placeholder={`https://${link.platform}.com/...`}
                        />
                        {isDirty && !error && (
                          <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8" onClick={() => handleUrlSave(link)}>
                            <Check className="w-4 h-4 text-primary" />
                          </Button>
                        )}
                        {isDirty && (
                          <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8" onClick={() => {
                            setEditingUrls(prev => { const n = { ...prev }; delete n[link.id]; return n; });
                            setValidationErrors(prev => { const n = { ...prev }; delete n[link.id]; return n; });
                          }}>
                            <X className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        )}
                        <a
                          href={link.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-1.5 rounded text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${link.id}-footer`}
                        checked={link.show_in_footer}
                        onCheckedChange={() => handleToggle(link, 'show_in_footer')}
                      />
                      <Label htmlFor={`${link.id}-footer`} className="text-xs cursor-pointer flex items-center gap-1">
                        {link.show_in_footer ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        Footer
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${link.id}-schema`}
                        checked={link.show_in_schema}
                        onCheckedChange={() => handleToggle(link, 'show_in_schema')}
                      />
                      <Label htmlFor={`${link.id}-schema`} className="text-xs cursor-pointer">
                        Schema
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Schema Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Schema.org sameAs Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto">
            {JSON.stringify(
              schemaLinks.map(l => l.public_url),
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
