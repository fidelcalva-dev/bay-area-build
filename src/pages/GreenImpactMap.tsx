import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, Recycle, TreePine, Calendar, Package,
  Eye, EyeOff, Filter, Leaf, FileText, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";

interface Project {
  id: string;
  city: string;
  tons: number;
  material: string;
  date: string;
  isPublic: boolean;
  x: number;
  y: number;
  diversion: number;
}

const projects: Project[] = [
  { id: "1", city: "San Jose", tons: 45.2, material: "Construction Debris", date: "Dec 2024", isPublic: true, x: 52, y: 58, diversion: 92 },
  { id: "2", city: "San Francisco", tons: 32.8, material: "Mixed Waste", date: "Nov 2024", isPublic: true, x: 42, y: 48, diversion: 88 },
  { id: "3", city: "Oakland", tons: 28.5, material: "Concrete", date: "Dec 2024", isPublic: true, x: 45, y: 50, diversion: 95 },
  { id: "4", city: "Fremont", tons: 18.3, material: "Wood & Lumber", date: "Oct 2024", isPublic: true, x: 50, y: 55, diversion: 87 },
  { id: "5", city: "Palo Alto", tons: 22.1, material: "Metal & Steel", date: "Nov 2024", isPublic: false, x: 47, y: 56, diversion: 94 },
  { id: "6", city: "Santa Clara", tons: 35.6, material: "Roofing Materials", date: "Dec 2024", isPublic: true, x: 51, y: 57, diversion: 89 },
  { id: "7", city: "Sunnyvale", tons: 19.7, material: "Drywall", date: "Sep 2024", isPublic: true, x: 49, y: 56, diversion: 91 },
  { id: "8", city: "Mountain View", tons: 15.4, material: "Electronics", date: "Oct 2024", isPublic: false, x: 48, y: 56, diversion: 96 },
  { id: "9", city: "Hayward", tons: 41.2, material: "Industrial Waste", date: "Nov 2024", isPublic: true, x: 48, y: 52, diversion: 85 },
  { id: "10", city: "Milpitas", tons: 26.9, material: "Landscaping Debris", date: "Dec 2024", isPublic: true, x: 51, y: 55, diversion: 93 },
];

const materialColors: Record<string, string> = {
  "Construction Debris": "#64748b",
  "Mixed Waste": "#f59e0b",
  "Concrete": "#6366f1",
  "Wood & Lumber": "#f97316",
  "Metal & Steel": "#8b5cf6",
  "Roofing Materials": "#ef4444",
  "Drywall": "#ec4899",
  "Electronics": "#14b8a6",
  "Industrial Waste": "#78716c",
  "Landscaping Debris": "#22c55e",
};

const GreenImpactMap = () => {
  const [showPrivate, setShowPrivate] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [materialFilter, setMaterialFilter] = useState<string>("all");

  const filteredProjects = projects.filter(project => {
    const matchesVisibility = showPrivate || project.isPublic;
    const matchesMaterial = materialFilter === "all" || project.material === materialFilter;
    return matchesVisibility && matchesMaterial;
  });

  const totalTons = filteredProjects.reduce((sum, p) => sum + p.tons, 0);
  const avgDiversion = Math.round(filteredProjects.reduce((sum, p) => sum + p.diversion, 0) / filteredProjects.length);

  const uniqueMaterials = [...new Set(projects.map(p => p.material))];

  return (
    <Layout>
      <SEOHead
        title="Green Impact Map | Calsan Dumpsters"
        description="See real recycling impact across California. Every dumpster we deliver helps divert material from landfills."
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30 mb-6">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Real Recycling Impact Across California
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every dumpster we deliver helps divert material from landfills. 
              Explore our verified environmental impact across the Bay Area.
            </p>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg shadow-emerald-500/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
                <div>
                  <p className="text-3xl font-bold">{filteredProjects.length}</p>
                  <p className="text-emerald-100 text-sm">Projects Mapped</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{totalTons.toFixed(1)}</p>
                  <p className="text-emerald-100 text-sm">Total Tons Recycled</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{avgDiversion}%</p>
                  <p className="text-emerald-100 text-sm">Avg. Diversion Rate</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{Math.round(totalTons * 2.8)}</p>
                  <p className="text-emerald-100 text-sm">Trees Equivalent</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Filters */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-0 shadow-lg shadow-gray-100/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5 text-emerald-600" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {showPrivate ? (
                          <Eye className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                        <Label htmlFor="visibility" className="text-sm font-medium">
                          Show Private Projects
                        </Label>
                      </div>
                      <Switch
                        id="visibility"
                        checked={showPrivate}
                        onCheckedChange={setShowPrivate}
                      />
                    </div>

                    {/* Material Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Material Type</Label>
                      <Select value={materialFilter} onValueChange={setMaterialFilter}>
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="All Materials" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Materials</SelectItem>
                          {uniqueMaterials.map(material => (
                            <SelectItem key={material} value={material}>
                              {material}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Legend */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-3">Material Legend</p>
                      <div className="grid grid-cols-2 gap-2">
                        {uniqueMaterials.slice(0, 6).map(material => (
                          <div key={material} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: materialColors[material] }}
                            />
                            <span className="text-xs text-gray-600 truncate">{material}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Project Details */}
                {selectedProject && (
                  <Card className="border-0 shadow-lg shadow-emerald-100/50 bg-gradient-to-br from-white to-emerald-50/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge 
                          className="border-0"
                          style={{ backgroundColor: materialColors[selectedProject.material] + "20", color: materialColors[selectedProject.material] }}
                        >
                          {selectedProject.material}
                        </Badge>
                        {!selectedProject.isPublic && (
                          <Badge variant="outline" className="text-gray-500 border-gray-300">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mt-2">{selectedProject.city}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {selectedProject.date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                          <Recycle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">{selectedProject.tons}</p>
                          <p className="text-xs text-gray-500">Tons Recycled</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                          <TreePine className="w-6 h-6 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">{selectedProject.diversion}%</p>
                          <p className="text-xs text-gray-500">Diversion Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Project List */}
                <Card className="border-0 shadow-lg shadow-gray-100/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Projects</CardTitle>
                    <CardDescription>{filteredProjects.length} projects shown</CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-64 overflow-y-auto space-y-2">
                    {filteredProjects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          selectedProject?.id === project.id 
                            ? "bg-emerald-100 border-2 border-emerald-300" 
                            : "bg-gray-50 hover:bg-emerald-50 border-2 border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: materialColors[project.material] }}
                          />
                          <div className="text-left">
                            <p className="font-medium text-gray-900 text-sm">{project.city}</p>
                            <p className="text-xs text-gray-500">{project.tons} tons</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Interactive Map */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 h-[600px]">
                      {/* California SVG Map */}
                      <svg 
                        viewBox="0 0 100 120" 
                        className="w-full h-full"
                        style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
                      >
                        {/* California outline */}
                        <path
                          d="M20,5 L35,3 L45,8 L50,15 L48,25 L52,35 L55,45 L58,55 L62,65 L65,75 L70,85 L75,95 L78,105 L72,110 L60,108 L50,105 L40,100 L30,90 L25,80 L22,70 L20,60 L18,50 L15,40 L12,30 L15,20 L18,10 Z"
                          fill="#e2e8f0"
                          stroke="#94a3b8"
                          strokeWidth="0.5"
                        />
                        
                        {/* Bay Area highlight */}
                        <ellipse
                          cx="47"
                          cy="54"
                          rx="12"
                          ry="10"
                          fill="#10b981"
                          fillOpacity="0.15"
                          stroke="#10b981"
                          strokeWidth="0.3"
                          strokeDasharray="2,2"
                        />

                        {/* Project pins */}
                        {filteredProjects.map((project) => (
                          <g 
                            key={project.id}
                            className="cursor-pointer transition-transform hover:scale-110"
                            onClick={() => setSelectedProject(project)}
                          >
                            {/* Pin shadow */}
                            <ellipse
                              cx={project.x}
                              cy={project.y + 1.5}
                              rx="1.5"
                              ry="0.5"
                              fill="rgba(0,0,0,0.2)"
                            />
                            {/* Pin body */}
                            <circle
                              cx={project.x}
                              cy={project.y}
                              r={selectedProject?.id === project.id ? "2.5" : "2"}
                              fill={materialColors[project.material]}
                              stroke="white"
                              strokeWidth="0.5"
                              className={selectedProject?.id === project.id ? "animate-pulse" : ""}
                            />
                            {/* Pulse effect for selected */}
                            {selectedProject?.id === project.id && (
                              <circle
                                cx={project.x}
                                cy={project.y}
                                r="4"
                                fill="none"
                                stroke={materialColors[project.material]}
                                strokeWidth="0.3"
                                opacity="0.5"
                                className="animate-ping"
                              />
                            )}
                          </g>
                        ))}

                        {/* City labels */}
                        <text x="42" y="47" fontSize="2" fill="#64748b" fontWeight="500">San Francisco</text>
                        <text x="52" y="60" fontSize="2" fill="#64748b" fontWeight="500">San Jose</text>
                        <text x="45" y="51" fontSize="1.5" fill="#94a3b8">Oakland</text>
                      </svg>

                      {/* Map overlay info */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-gray-900">Bay Area Focus</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {filteredProjects.length} verified projects
                        </p>
                      </div>

                      {/* Zoom hint */}
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                        <p className="text-xs text-gray-500">Click pins for details</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 pb-24">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white overflow-hidden">
              <CardContent className="p-8 md:p-12 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 text-center">
                  <FileText className="w-12 h-12 text-white/80 mx-auto mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Request Your Green Impact Report
                  </h2>
                  <p className="text-emerald-100 mb-8 max-w-lg mx-auto">
                    Get a detailed sustainability report for your projects, including verified 
                    diversion rates, CO₂ savings, and environmental certifications.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/contact">
                      <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg">
                        <FileText className="w-5 h-5 mr-2" />
                        Request Report
                      </Button>
                    </Link>
                    <Link to="/portal">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        Access Client Portal
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default GreenImpactMap;
