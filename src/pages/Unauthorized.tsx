import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Unauthorized() {
  return (
    <>
      <Helmet>
        <title>Access Denied | Calsan</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to view this page. Contact your administrator if you believe this is an error.
          </p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
