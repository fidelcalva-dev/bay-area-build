import { useState } from 'react';
import { Share2, ExternalLink, Eye, EyeOff, Globe, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SOCIAL_LINKS, type SocialLink } from '@/config/socialConfig';

export default function SocialLinksConfig() {
  const { toast } = useToast();
  const [links, setLinks] = useState<SocialLink[]>([...SOCIAL_LINKS]);

  const updateLink = (platform: string, field: keyof SocialLink, value: any) => {
    setLinks(prev => prev.map(l => l.platform === platform ? { ...l, [field]: value } : l));
  };

  const footerLinks = links.filter(l => l.showInFooter);
  const schemaLinks = links.filter(l => l.showInSchema);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Share2 className="w-6 h-6 text-primary" />
          Social Links Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage public social media links for the website footer and schema.org markup.
        </p>
      </div>

      {/* Warning */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Only public profile URLs</p>
            <p className="text-muted-foreground">
              Never add admin/dashboard/analytics URLs here. Only public-facing company or profile pages
              should be exposed on the website and schema markup.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{links.length}</div>
            <div className="text-xs text-muted-foreground">Total Platforms</div>
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
        {links.map(link => (
          <Card key={link.platform}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm">{link.label}</h3>
                      {link.showInFooter && (
                        <Badge variant="outline" className="text-[10px]">Footer</Badge>
                      )}
                      {link.showInSchema && (
                        <Badge variant="outline" className="text-[10px]">Schema</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={link.url}
                        onChange={(e) => updateLink(link.platform, 'url', e.target.value)}
                        className="h-8 text-xs font-mono"
                        placeholder={`https://${link.platform}.com/...`}
                      />
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-1.5 rounded text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${link.platform}-footer`}
                      checked={link.showInFooter}
                      onCheckedChange={(v) => updateLink(link.platform, 'showInFooter', v)}
                    />
                    <Label htmlFor={`${link.platform}-footer`} className="text-xs cursor-pointer flex items-center gap-1">
                      {link.showInFooter ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      Footer
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${link.platform}-schema`}
                      checked={link.showInSchema}
                      onCheckedChange={(v) => updateLink(link.platform, 'showInSchema', v)}
                    />
                    <Label htmlFor={`${link.platform}-schema`} className="text-xs cursor-pointer">
                      Schema
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schema Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Schema.org sameAs Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto">
            {JSON.stringify(
              schemaLinks.map(l => l.url),
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
