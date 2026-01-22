import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FileText, Image, Download, ArrowLeft, Loader2, 
  Camera, Receipt, Scale, File, ExternalLink, Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { supabase } from "@/integrations/supabase/client";
import logoCalsan from "@/assets/logo-calsan.jpeg";

interface OrderDocument {
  id: string;
  placement_photo_url: string | null;
  pickup_photo_url: string | null;
  dump_ticket_url: string | null;
  invoice_url: string | null;
  created_at: string;
  quotes: {
    customer_phone: string | null;
    delivery_address: string | null;
  } | null;
}

const DOC_TYPE_CONFIG: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  placement_photo: { label: "Placement Photo", icon: Camera, color: "bg-blue-100 text-blue-700" },
  pickup_photo: { label: "Pickup Photo", icon: Image, color: "bg-green-100 text-green-700" },
  dump_ticket: { label: "Dump Ticket", icon: Scale, color: "bg-amber-100 text-amber-700" },
  invoice: { label: "Invoice", icon: Receipt, color: "bg-purple-100 text-purple-700" },
  receipt: { label: "Receipt", icon: Receipt, color: "bg-emerald-100 text-emerald-700" },
  other: { label: "Document", icon: File, color: "bg-gray-100 text-gray-700" },
};

const CustomerDocuments = () => {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated, session } = useCustomerAuth();
  const [documents, setDocuments] = useState<{ type: string; url: string; orderId: string; date: string; address: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/portal");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    async function fetchDocuments() {
      if (!session?.phone) return;

      try {
        // Fetch orders with document URLs
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            id,
            placement_photo_url,
            pickup_photo_url,
            dump_ticket_url,
            invoice_url,
            created_at,
            quotes!inner (
              id,
              customer_phone,
              delivery_address
            )
          `)
          .order("created_at", { ascending: false });

        if (ordersError) {
          console.error("Error fetching order documents:", ordersError);
          return;
        }

        // Filter by phone ownership
        const phoneDigits = session.phone.replace(/\D/g, "");
        const customerOrders = (ordersData || []).filter((order) => {
          const quotePhone = (order.quotes as any)?.customer_phone?.replace(/\D/g, "") || "";
          return quotePhone.includes(phoneDigits) || phoneDigits.includes(quotePhone.slice(-10));
        }) as OrderDocument[];

        // Extract documents from orders
        const allDocs: { type: string; url: string; orderId: string; date: string; address: string | null }[] = [];
        
        customerOrders.forEach((order) => {
          if (order.placement_photo_url) {
            allDocs.push({
              type: "placement_photo",
              url: order.placement_photo_url,
              orderId: order.id,
              date: order.created_at,
              address: order.quotes?.delivery_address || null,
            });
          }
          if (order.pickup_photo_url) {
            allDocs.push({
              type: "pickup_photo",
              url: order.pickup_photo_url,
              orderId: order.id,
              date: order.created_at,
              address: order.quotes?.delivery_address || null,
            });
          }
          if (order.dump_ticket_url) {
            allDocs.push({
              type: "dump_ticket",
              url: order.dump_ticket_url,
              orderId: order.id,
              date: order.created_at,
              address: order.quotes?.delivery_address || null,
            });
          }
          if (order.invoice_url) {
            allDocs.push({
              type: "invoice",
              url: order.invoice_url,
              orderId: order.id,
              date: order.created_at,
              address: order.quotes?.delivery_address || null,
            });
          }
        });

        // Also fetch from documents table
        const orderIds = customerOrders.map(o => o.id);
        if (orderIds.length > 0) {
          const { data: docsData, error: docsError } = await supabase
            .from("documents")
            .select("*")
            .in("order_id", orderIds)
            .order("created_at", { ascending: false });

          if (!docsError && docsData) {
            docsData.forEach((doc) => {
              const order = customerOrders.find(o => o.id === doc.order_id);
              allDocs.push({
                type: doc.doc_type || "other",
                url: doc.file_url,
                orderId: doc.order_id,
                date: doc.created_at,
                address: order?.quotes?.delivery_address || null,
              });
            });
          }
        }

        // Fetch service receipts for customer orders (tickets with tons info)
        const quoteIds = customerOrders.map(o => (o.quotes as any)?.id).filter(Boolean);
        if (quoteIds.length > 0) {
          const { data: receiptsData } = await supabase
            .from("service_receipts")
            .select("*")
            .in("quote_id", quoteIds)
            .order("created_at", { ascending: false });

          if (receiptsData) {
            receiptsData.forEach((receipt) => {
              const order = customerOrders.find(o => (o.quotes as any)?.id === receipt.quote_id);
              // Add ticket URL from receipt if not already in docs
              if (receipt.ticket_url && !allDocs.find(d => d.url === receipt.ticket_url)) {
                allDocs.push({
                  type: "dump_ticket",
                  url: receipt.ticket_url,
                  orderId: order?.id || "",
                  date: receipt.ticket_date || receipt.created_at,
                  address: order?.quotes?.delivery_address || null,
                });
              }
            });
          }
        }

        setDocuments(allDocs);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchDocuments();
    }
  }, [session]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const photos = documents.filter(d => ["placement_photo", "pickup_photo"].includes(d.type));
  const tickets = documents.filter(d => ["dump_ticket", "invoice", "receipt"].includes(d.type));

  const filteredDocs = activeTab === "photos" 
    ? photos 
    : activeTab === "tickets" 
      ? tickets 
      : documents;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link 
            to="/portal/dashboard" 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <img src={logoCalsan} alt="Calsan" className="h-8 w-auto rounded-lg" />
            <div>
              <p className="font-semibold text-gray-900">My Documents</p>
              <p className="text-xs text-gray-500">{documents.length} files</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">
              All ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-white">
              <Camera className="w-3.5 h-3.5 mr-1" />
              Photos ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-white">
              <Receipt className="w-3.5 h-3.5 mr-1" />
              Tickets ({tickets.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Documents List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredDocs.map((doc, idx) => (
              <DocumentCard key={`${doc.orderId}-${doc.type}-${idx}`} doc={doc} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {activeTab === "photos" 
                  ? "No photos yet" 
                  : activeTab === "tickets" 
                    ? "No tickets or invoices yet"
                    : "No documents yet"
                }
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Documents will appear here after your orders are processed
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

function DocumentCard({ doc }: { doc: { type: string; url: string; orderId: string; date: string; address: string | null } }) {
  const config = DOC_TYPE_CONFIG[doc.type] || DOC_TYPE_CONFIG.other;
  const Icon = config.icon;
  const isImage = doc.type.includes("photo") || doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {isImage && (
        <div className="aspect-video bg-gray-100 relative">
          <img 
            src={doc.url} 
            alt={config.label}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <a 
            href={doc.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
          >
            <Eye className="w-8 h-8 text-white" />
          </a>
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {!isImage && (
              <div className={`p-2 rounded-lg ${config.color.replace('text-', 'bg-').replace('700', '100')}`}>
                <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
              </div>
            )}
            <div className="min-w-0">
              <Badge className={config.color} variant="secondary">
                {config.label}
              </Badge>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {doc.address || `Order ${doc.orderId.slice(0, 8)}...`}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(doc.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
            <a 
              href={doc.url} 
              download
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerDocuments;
