/**
 * Vehicle Profile — /admin/trucks/:id
 * Tabs: Overview, Compliance, Inspections, Issues, Work Orders, Documents
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Truck, Shield, ClipboardList, AlertTriangle,
  Wrench, FileText, CheckCircle2, XCircle, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  getTruckById, getInspectionsForTruck, getIssuesForTruck,
  getWorkOrdersForTruck, getVehicleDocuments, updateTruckStatus,
  type Truck as TruckType, type VehicleInspection, type VehicleIssue,
  type MaintenanceWorkOrder,
} from '@/lib/fleetService';
import { useToast } from '@/hooks/use-toast';

export default function VehicleProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [truck, setTruck] = useState<TruckType | null>(null);
  const [inspections, setInspections] = useState<VehicleInspection[]>([]);
  const [issues, setIssues] = useState<VehicleIssue[]>([]);
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [t, insp, iss, wos, docs] = await Promise.all([
        getTruckById(id),
        getInspectionsForTruck(id),
        getIssuesForTruck(id),
        getWorkOrdersForTruck(id),
        getVehicleDocuments(id),
      ]);
      setTruck(t);
      setInspections(insp);
      setIssues(iss);
      setWorkOrders(wos);
      setDocuments(docs);
      setIsLoading(false);
    })();
  }, [id]);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!truck) return <div className="p-6 text-center"><h2 className="text-xl font-bold">Truck not found</h2></div>;

  const STATUS_COLORS: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    IN_SERVICE: 'bg-blue-100 text-blue-800',
    OUT_OF_SERVICE: 'bg-red-100 text-red-800',
    MAINTENANCE: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Truck #{truck.truck_number}</h1>
            <Badge className={cn('text-sm', STATUS_COLORS[truck.truck_status || ''] || 'bg-gray-100')}>
              {(truck.truck_status || 'UNKNOWN').replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {[truck.year, truck.make, truck.model].filter(Boolean).join(' ')} • {truck.truck_type || 'N/A'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="inspections">Inspections ({inspections.length})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({issues.length})</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders ({workOrders.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCard label="Truck Number" value={truck.truck_number} />
            <InfoCard label="Type" value={truck.truck_type || '—'} />
            <InfoCard label="License Plate" value={truck.license_plate || truck.plate_number || '—'} />
            <InfoCard label="VIN" value={truck.vin || '—'} />
            <InfoCard label="Year / Make / Model" value={[truck.year, truck.make, truck.model].filter(Boolean).join(' ') || '—'} />
            <InfoCard label="Odometer" value={truck.odometer_miles ? `${truck.odometer_miles.toLocaleString()} mi` : '—'} />
            <InfoCard label="Last Inspection" value={truck.last_inspection_at ? format(new Date(truck.last_inspection_at), 'MMM d, yyyy h:mm a') : 'Never'} />
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ComplianceCard
              label="Insurance"
              active={truck.insurance_active}
              expDate={truck.insurance_exp_date}
            />
            <ComplianceCard
              label="Registration"
              active={true}
              expDate={truck.registration_exp_date}
            />
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5" />
            <span className="font-medium">DOT Compliance:</span>
            <Badge variant={truck.dot_compliance_status === 'OK' ? 'default' : 'destructive'}>
              {truck.dot_compliance_status || 'OK'}
            </Badge>
          </div>
        </TabsContent>

        <TabsContent value="inspections" className="mt-4 space-y-3">
          {inspections.length === 0 ? <p className="text-muted-foreground py-8 text-center">No inspections recorded</p> : (
            inspections.map(i => (
              <div key={i.id} className="border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {i.status === 'PASS' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                   i.status === 'UNSAFE' ? <XCircle className="w-5 h-5 text-red-500" /> :
                   <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  <div>
                    <span className="font-medium">{i.inspection_type}</span>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(i.created_at), 'MMM d, yyyy h:mm a')} • Signed: {i.signature_name}
                    </p>
                  </div>
                </div>
                <Badge variant={i.status === 'PASS' ? 'default' : 'destructive'}>{i.status}</Badge>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="issues" className="mt-4 space-y-3">
          {issues.length === 0 ? <p className="text-muted-foreground py-8 text-center">No issues reported</p> : (
            issues.map(i => (
              <div key={i.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{i.issue_category}</Badge>
                  <Badge className={cn('text-xs', i.severity === 'SAFETY' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')}>{i.severity}</Badge>
                  <Badge variant="outline">{i.status}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">{format(new Date(i.created_at), 'MMM d')}</span>
                </div>
                <p className="text-sm">{i.description || '—'}</p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="workorders" className="mt-4 space-y-3">
          {workOrders.length === 0 ? <p className="text-muted-foreground py-8 text-center">No work orders</p> : (
            workOrders.map(wo => (
              <div key={wo.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="w-4 h-4" />
                  <Badge variant="outline">{wo.status}</Badge>
                  <span className="text-sm font-medium">Total: ${wo.total_cost?.toFixed(2) || '0.00'}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{format(new Date(wo.created_at), 'MMM d')}</span>
                </div>
                <p className="text-sm">{wo.notes || '—'}</p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4 space-y-3">
          {documents.length === 0 ? <p className="text-muted-foreground py-8 text-center">No documents uploaded</p> : (
            documents.map((d: any) => (
              <div key={d.id} className="border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <div>
                    <span className="font-medium">{d.doc_type}</span>
                    <p className="text-xs text-muted-foreground">
                      {d.expires_at ? `Expires: ${format(new Date(d.expires_at), 'MMM d, yyyy')}` : 'No expiry'}
                    </p>
                  </div>
                </div>
                <a href={d.file_url} target="_blank" rel="noopener" className="text-primary text-sm hover:underline">View</a>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}

function ComplianceCard({ label, active, expDate }: { label: string; active: boolean; expDate: string | null }) {
  const isExpired = expDate && new Date(expDate) < new Date();
  return (
    <div className={cn('border rounded-lg p-4', isExpired ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50/50')}>
      <div className="flex items-center gap-2 mb-2">
        {isExpired ? <XCircle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
        <span className="font-bold">{label}</span>
      </div>
      <p className="text-sm">
        {expDate ? `Expires: ${format(new Date(expDate), 'MMM d, yyyy')}` : 'No date set'}
      </p>
      {isExpired && <Badge variant="destructive" className="mt-2">EXPIRED</Badge>}
    </div>
  );
}
