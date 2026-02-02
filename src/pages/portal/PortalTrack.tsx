// ============================================================
// PORTAL TRACK - Order Tracking Entry Page
// For customers to enter their tracking link
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Truck, Phone, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/shared-data';

export default function PortalTrack() {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!orderNumber.trim()) {
      setError('Please enter your order number or tracking link');
      return;
    }
    
    // Extract order ID from various formats
    let orderId = orderNumber.trim();
    
    // Handle full URL format
    if (orderId.includes('/portal/order/')) {
      const match = orderId.match(/\/portal\/order\/([^/\s?]+)/);
      if (match) {
        orderId = match[1];
      }
    }
    
    // Navigate to order tracking
    navigate(`/portal/order/${orderId}`);
  };

  return (
    <Layout
      title="Track Your Order | CALSAN Dumpsters"
      description="Track your dumpster delivery and pickup status in real-time."
    >
      <div className="min-h-[70vh] flex items-center justify-center bg-muted/30 py-12">
        <div className="container-narrow">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Truck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Track Your Order</CardTitle>
                <CardDescription>
                  Enter your order number or paste your tracking link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="Order # or tracking link"
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button type="submit" className="w-full h-12" size="lg">
                    Track Order
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Can't find your tracking info?
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call {BUSINESS_INFO.phone.salesFormatted}
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a href={`sms:${BUSINESS_INFO.phone.sales}`}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Text Us
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
