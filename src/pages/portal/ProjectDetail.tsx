import { Link, useParams } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Calendar, Truck, Recycle, TreePine,
  FileText, Download, Clock, CheckCircle2, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const wasteData = [
  { type: "Concrete", tons: 4.2, color: "#64748b" },
  { type: "Wood", tons: 3.1, color: "#f59e0b" },
  { type: "Metal", tons: 2.8, color: "#6366f1" },
  { type: "Cardboard", tons: 1.5, color: "#10b981" },
  { type: "Mixed", tons: 0.9, color: "#94a3b8" },
];

const timeline = [
  { date: "Dec 10, 2024", event: "Project initiated", status: "completed" },
  { date: "Dec 12, 2024", event: "40-yard dumpster delivered", status: "completed" },
  { date: "Dec 15, 2024", event: "First haul - 8.2 tons", status: "completed" },
  { date: "Dec 18, 2024", event: "Second haul scheduled", status: "upcoming" },
  { date: "Dec 22, 2024", event: "Project completion (est.)", status: "upcoming" },
];

const ProjectDetail = () => {
  const { projectId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/portal/dashboard" className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-gray-200">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Link to="/portal/report">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Full Report
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-3">Active</Badge>
              <h1 className="text-2xl font-bold text-gray-900">Downtown Office Renovation</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  123 Market St, San Jose
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Dec 10 - Dec 22, 2024
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">12.5</p>
                  <p className="text-sm text-gray-500">Tons Collected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <TreePine className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                  <p className="text-sm text-gray-500">Diversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-gray-500">Hauls Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">40-yd</p>
                  <p className="text-sm text-gray-500">Dumpster Size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Waste Breakdown Chart */}
          <Card className="lg:col-span-2 border-0 shadow-lg shadow-gray-100/50">
            <CardHeader>
              <CardTitle className="text-lg">Waste Material Breakdown</CardTitle>
              <CardDescription>Tons collected by material type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wasteData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [`${value} tons`, 'Amount']}
                    />
                    <Bar dataKey="tons" radius={[0, 6, 6, 0]}>
                      {wasteData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardHeader>
              <CardTitle className="text-lg">Project Timeline</CardTitle>
              <CardDescription>Key milestones and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.status === "completed" 
                          ? "bg-emerald-100" 
                          : "bg-gray-100"
                      }`}>
                        {item.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`w-0.5 h-8 ${
                          item.status === "completed" ? "bg-emerald-200" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-gray-400">{item.date}</p>
                      <p className={`text-sm font-medium ${
                        item.status === "completed" ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {item.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sustainability Impact */}
        <Card className="border-0 shadow-lg shadow-gray-100/50">
          <CardHeader>
            <CardTitle className="text-lg">Sustainability Impact</CardTitle>
            <CardDescription>Environmental benefits from this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                <TreePine className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">34</p>
                <p className="text-sm text-gray-500">Trees Equivalent Saved</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                <Recycle className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">11.5</p>
                <p className="text-sm text-gray-500">Tons Diverted from Landfill</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                <Truck className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">5,200</p>
                <p className="text-sm text-gray-500">Miles Equivalent CO₂ Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProjectDetail;
