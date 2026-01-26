import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Download, Plus, Loader2, Clock, User, 
  BookOpen, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface InternalDocument {
  id: string;
  doc_key: string;
  title: string;
  version: string;
  description: string | null;
  file_path: string | null;
  is_active: boolean;
  created_at: string;
}

const docKeyLabels: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  NON_NEGOTIABLE_RULES: {
    label: 'Non-Negotiable Rules Manual',
    icon: AlertTriangle,
    color: 'text-red-500'
  },
  CEO_WEEKLY_CHECKLIST: {
    label: 'CEO Weekly Checklist',
    icon: CheckCircle,
    color: 'text-green-500'
  },
  PLAYBOOK_EXCEPTIONS: {
    label: 'Playbook of Exceptions',
    icon: BookOpen,
    color: 'text-blue-500'
  }
};

export default function InternalDocsPage() {
  const queryClient = useQueryClient();
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);

  // Fetch documents - use type bypass for new table
  const { data: documents, isLoading } = useQuery({
    queryKey: ['internal-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_documents' as 'orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as InternalDocument[];
    }
  });

  // Generate PDF mutation
  const generateMutation = useMutation({
    mutationFn: async (docKey: string) => {
      setGeneratingKey(docKey);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-internal-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ doc_key: docKey })
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to generate PDF');
      return result;
    },
    onSuccess: (data) => {
      toast.success('PDF generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['internal-documents'] });
      
      // Open download URL
      if (data.download_url) {
        window.open(data.download_url, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate PDF');
    },
    onSettled: () => {
      setGeneratingKey(null);
    }
  });

  const handleDownload = async (filePath: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const { data, error } = await supabase.storage
        .from('internal-docs')
        .createSignedUrl(filePath, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      toast.error('Failed to download document');
    }
  };

  // Group documents by doc_key
  const groupedDocs = documents?.reduce((acc, doc) => {
    if (!acc[doc.doc_key]) {
      acc[doc.doc_key] = [];
    }
    acc[doc.doc_key].push(doc);
    return acc;
  }, {} as Record<string, InternalDocument[]>) || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Internal Documentation</h1>
          <p className="text-muted-foreground">
            Generate and manage internal operations manuals and checklists
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(docKeyLabels).map(([docKey, config]) => {
            const docs = groupedDocs[docKey] || [];
            const activeDoc = docs.find(d => d.is_active);
            const isGenerating = generatingKey === docKey;
            const IconComponent = config.icon;

            return (
              <Card key={docKey}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.label}</CardTitle>
                      <CardDescription>
                        {activeDoc 
                          ? `Current: ${activeDoc.version}`
                          : 'No version generated'
                        }
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeDoc && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Generated {format(new Date(activeDoc.created_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      {activeDoc.description && (
                        <p className="text-muted-foreground">{activeDoc.description}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => generateMutation.mutate(docKey)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {activeDoc ? 'New Version' : 'Generate'}
                    </Button>

                    {activeDoc?.file_path && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(activeDoc.file_path!)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Version history */}
                  {docs.length > 1 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Previous Versions
                      </p>
                      <div className="space-y-1">
                        {docs.filter(d => !d.is_active).slice(0, 3).map(doc => (
                          <div 
                            key={doc.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-muted-foreground">
                              {doc.version} - {format(new Date(doc.created_at), 'MMM d, yyyy')}
                            </span>
                            {doc.file_path && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => handleDownload(doc.file_path!)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Help Content Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Help Content Management</CardTitle>
          <CardDescription>
            Contextual help content that appears throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HelpContentList />
        </CardContent>
      </Card>
    </div>
  );
}

function HelpContentList() {
  interface HelpContent {
    id: string;
    help_key: string;
    title: string;
    body: string;
    severity: string;
    scopes: string[];
    is_active: boolean;
  }

  const { data: helpContent, isLoading } = useQuery({
    queryKey: ['help-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_content' as 'orders')
        .select('*')
        .order('severity', { ascending: true });

      if (error) throw error;
      return data as unknown as HelpContent[];
    }
  });

  if (isLoading) {
    return <Loader2 className="w-6 h-6 animate-spin" />;
  }

  const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    WARNING: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    INFO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  };

  return (
    <div className="space-y-3">
      {helpContent?.map(item => (
        <div 
          key={item.id}
          className="flex items-start gap-3 p-3 border rounded-lg"
        >
          <Badge className={severityColors[item.severity] || severityColors.INFO}>
            {item.severity}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {item.body}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {item.scopes.map(scope => (
                <Badge key={scope} variant="outline" className="text-xs">
                  {scope}
                </Badge>
              ))}
            </div>
          </div>
          <Badge variant={item.is_active ? 'default' : 'secondary'}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ))}
    </div>
  );
}
