import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Leaf, Recycle, TreePine, Car, MapPin, FileText, 
  TrendingUp, Calendar, Download, Bell, User, LogOut,
  ChevronRight, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const monthlyData = [
  { month: "Jul", recycled: 12, diverted: 85 },
  { month: "Aug", recycled: 18, diverted: 88 },
  { month: "Sep", recycled: 15, diverted: 82 },
  { month: "Oct", recycled: 22, diverted: 91 },
  { month: "Nov", recycled: 28, diverted: 89 },
  { month: "Dec", recycled: 24, diverted: 87 },
];

const wasteBreakdown = [
  { name: "Recycled", value: 65, color: "#10b981" },
  { name: "Composted", value: 20, color: "#14b8a6" },
  { name: "Landfill", value: 15, color: "#94a3b8" },
];

const activeProjects = [
  { id: "PRJ-2024-001", name: "Downtown Office Renovation", status: "active", tons: 12.5, diversion: 92 },
  { id: "PRJ-2024-002", name: "Warehouse Cleanout", status: "active", tons: 8.3, diversion: 88 },
  { id: "PRJ-2024-003", name: "Retail Store Remodel", status: "completed", tons: 5.2, diversion: 95 },
];

const recentInvoices = [
  { id: "INV-1234", date: "Dec 15, 2024", amount: "$1,250.00", status: "paid" },
  { id: "INV-1189", date: "Nov 28, 2024", amount: "$890.00", status: "paid" },
  { id: "INV-1145", date: "Nov 10, 2024", amount: "$2,100.00", status: "paid" },
];

const PortalDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Green Halo</h1>
                <p className="text-xs text-gray-500">Client Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </Button>
              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Acme Corp</span>
              </div>
              <Link to="/portal">
                <Button variant="ghost" size="icon">
                  <LogOut className="w-5 h-5 text-gray-600" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, Acme Corp</h2>
          <p className="text-gray-500 mt-1">Here's your sustainability impact at a glance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg shadow-emerald-100/50 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Recycle className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">+12% ↑</Badge>
              </div>
              <p className="text-3xl font-bold">45.8</p>
              <p className="text-emerald-100 text-sm">Total Tons Recycled</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </div>
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-0">Excellent</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">89%</p>
              <p className="text-gray-500 text-sm">Landfill Diversion Rate</p>
              <Progress value={89} className="mt-3 h-2 bg-gray-100" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TreePine className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">127</p>
              <p className="text-gray-500 text-sm">Trees Equivalent Saved</p>
              <p className="text-xs text-green-600 mt-2">Based on CO₂ reduction</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">18.5k</p>
              <p className="text-gray-500 text-sm">Miles Off Road Equivalent</p>
              <p className="text-xs text-slate-500 mt-2">CO₂ emissions prevented</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recycling Trend */}
          <Card className="lg:col-span-2 border-0 shadow-lg shadow-gray-100/50">
            <CardHeader>
              <CardTitle className="text-lg">Recycling Trend</CardTitle>
              <CardDescription>Monthly tons recycled over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorRecycled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="recycled" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="url(#colorRecycled)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Waste Breakdown */}
          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardHeader>
              <CardTitle className="text-lg">Waste Breakdown</CardTitle>
              <CardDescription>Distribution by disposal method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wasteBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {wasteBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {wasteBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects & Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Projects */}
          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Active Projects</CardTitle>
                <CardDescription>Current waste management projects</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-emerald-600">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <Link 
                    key={project.id} 
                    to={`/portal/project/${project.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-emerald-700">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={project.status === "active" ? "default" : "secondary"}
                        className={project.status === "active" 
                          ? "bg-emerald-100 text-emerald-700 border-0" 
                          : "bg-gray-100 text-gray-600 border-0"
                        }
                      >
                        {project.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{project.tons} tons</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Receipts & Invoices</CardTitle>
                <CardDescription>Recent billing documents</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-emerald-600">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{invoice.id}</p>
                        <p className="text-sm text-gray-500">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{invoice.amount}</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <Card className="border-0 shadow-lg shadow-gray-100/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Active Project Locations</CardTitle>
              <CardDescription>Geographic overview of your current projects</CardDescription>
            </div>
            <Link to="/portal/report">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                <FileText className="w-4 h-4 mr-2" />
                View Full Report
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center relative overflow-hidden">
              {/* Simplified map placeholder */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M30,20 Q50,10 70,20 T90,50 Q80,80 50,90 T10,50 Q20,30 30,20" fill="none" stroke="#10b981" strokeWidth="0.5" />
                  <circle cx="35" cy="45" r="3" fill="#10b981" />
                  <circle cx="55" cy="35" r="3" fill="#10b981" />
                  <circle cx="65" cy="55" r="3" fill="#14b8a6" />
                </svg>
              </div>
              <div className="text-center z-10">
                <MapPin className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">3 Active Project Locations</p>
                <p className="text-sm text-gray-400">Bay Area, California</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PortalDashboard;
