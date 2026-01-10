import { Link } from "react-router-dom";
import { 
  ArrowLeft, Leaf, Recycle, TreePine, Car, Download,
  FileText, Share2, Printer, Award, TrendingUp, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  BarChart,
  Bar,
} from "recharts";

const yearlyData = [
  { month: "Jan", recycled: 8, diverted: 82 },
  { month: "Feb", recycled: 10, diverted: 85 },
  { month: "Mar", recycled: 14, diverted: 88 },
  { month: "Apr", recycled: 12, diverted: 86 },
  { month: "May", recycled: 16, diverted: 89 },
  { month: "Jun", recycled: 19, diverted: 91 },
  { month: "Jul", recycled: 22, diverted: 90 },
  { month: "Aug", recycled: 25, diverted: 88 },
  { month: "Sep", recycled: 21, diverted: 87 },
  { month: "Oct", recycled: 28, diverted: 92 },
  { month: "Nov", recycled: 32, diverted: 89 },
  { month: "Dec", recycled: 24, diverted: 87 },
];

const materialBreakdown = [
  { name: "Concrete", value: 35, color: "#64748b" },
  { name: "Wood", value: 25, color: "#f59e0b" },
  { name: "Metal", value: 20, color: "#6366f1" },
  { name: "Cardboard", value: 12, color: "#10b981" },
  { name: "Other", value: 8, color: "#94a3b8" },
];

const monthlyComparison = [
  { month: "Q1", current: 32, previous: 28 },
  { month: "Q2", current: 47, previous: 38 },
  { month: "Q3", current: 68, previous: 52 },
  { month: "Q4", current: 84, previous: 65 },
];

const SustainabilityReport = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/portal/dashboard" className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-gray-200">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="border-gray-200">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-lg shadow-emerald-500/30 mb-6">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sustainability Report</h1>
          <p className="text-gray-500">Acme Corp • Annual Environmental Impact Summary</p>
          <Badge className="mt-4 bg-emerald-100 text-emerald-700 border-0">2024 Annual Report</Badge>
        </div>

        {/* Executive Summary */}
        <Card className="border-0 shadow-lg shadow-gray-100/50 mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Recycle className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">231</p>
                <p className="text-sm text-gray-500 mt-1">Total Tons Recycled</p>
                <Badge className="mt-2 bg-green-100 text-green-700 border-0">+28% YoY</Badge>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">89%</p>
                <p className="text-sm text-gray-500 mt-1">Avg. Diversion Rate</p>
                <Badge className="mt-2 bg-teal-100 text-teal-700 border-0">Top Performer</Badge>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TreePine className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">642</p>
                <p className="text-sm text-gray-500 mt-1">Trees Equivalent</p>
                <p className="text-xs text-gray-400 mt-1">CO₂ absorption</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">92K</p>
                <p className="text-sm text-gray-500 mt-1">Miles Equivalent</p>
                <p className="text-xs text-gray-400 mt-1">CO₂ emissions saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Yearly Recycling Trend */}
          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardHeader>
              <CardTitle className="text-lg">Annual Recycling Trend</CardTitle>
              <CardDescription>Monthly tons recycled throughout 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearlyData}>
                    <defs>
                      <linearGradient id="colorRecycledReport" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#colorRecycledReport)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Material Breakdown */}
          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardHeader>
              <CardTitle className="text-lg">Material Breakdown</CardTitle>
              <CardDescription>Distribution by material type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {materialBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {materialBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Year over Year Comparison */}
        <Card className="border-0 shadow-lg shadow-gray-100/50 mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Year-over-Year Comparison</CardTitle>
            <CardDescription>Quarterly performance vs. previous year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison}>
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
                  <Bar dataKey="previous" fill="#e2e8f0" name="2023" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="current" fill="#10b981" name="2024" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <span className="text-sm text-gray-600">2023</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-600">2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications & Recognition */}
        <Card className="border-0 shadow-lg shadow-gray-100/50 mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Certifications & Recognition</CardTitle>
            <CardDescription>Environmental achievements and certifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl text-center">
                <Award className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <p className="font-semibold text-gray-900">Green Business Certified</p>
                <p className="text-sm text-gray-500 mt-1">California Green Business Network</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl text-center">
                <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="font-semibold text-gray-900">Zero Waste to Landfill</p>
                <p className="text-sm text-gray-500 mt-1">85%+ Diversion Achievement</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl text-center">
                <TreePine className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <p className="font-semibold text-gray-900">Carbon Neutral Partner</p>
                <p className="text-sm text-gray-500 mt-1">Verified Offset Program</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="text-center py-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl">
          <Leaf className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Making a Difference Together</h2>
          <p className="text-emerald-100 mb-6 max-w-md mx-auto">
            Your partnership with Calsan is helping build a more sustainable future for California.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50">
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              <Share2 className="w-4 h-4 mr-2" />
              Share Report
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SustainabilityReport;
