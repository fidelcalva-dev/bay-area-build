import { Link } from "react-router-dom";
import { 
  Leaf, Recycle, BarChart3, MapPin, Building2, HardHat, 
  Landmark, TreePine, CheckCircle2, ArrowRight, Eye, 
  FileText, TrendingUp, Shield, Globe, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from 'react-helmet-async';
import { BUSINESS_INFO } from "@/lib/seo";

const features = [
  {
    icon: Recycle,
    title: "Material Classification",
    description: "Every load is weighed and categorized by material type at certified facilities."
  },
  {
    icon: BarChart3,
    title: "Real-Time Tracking",
    description: "View diversion rates, tonnage, and environmental metrics as they happen."
  },
  {
    icon: FileText,
    title: "Verified Reports",
    description: "Download certified sustainability reports for compliance and marketing."
  },
  {
    icon: Shield,
    title: "Third-Party Verified",
    description: "All data is verified through our recycling facility partners."
  },
];

const trackingSteps = [
  {
    step: "01",
    title: "Material Collection",
    description: "Your dumpster is picked up and transported to our sorting facility."
  },
  {
    step: "02",
    title: "Weighing & Sorting",
    description: "Materials are weighed and separated by type: concrete, wood, metal, cardboard, etc."
  },
  {
    step: "03",
    title: "Processing & Diversion",
    description: "Recyclable materials are processed and diverted from landfills to recycling centers."
  },
  {
    step: "04",
    title: "Data Recording",
    description: "All weights, materials, and diversion rates are recorded in your Green Halo dashboard."
  },
  {
    step: "05",
    title: "Report Generation",
    description: "Sustainability reports are generated with verified environmental impact metrics."
  },
];

const useCases = [
  {
    icon: HardHat,
    title: "Contractors & Builders",
    description: "Meet LEED requirements and demonstrate environmental responsibility to clients. Get certified diversion reports for every project.",
    benefits: ["LEED compliance documentation", "Client-ready sustainability reports", "Competitive bidding advantage"]
  },
  {
    icon: Landmark,
    title: "Cities & Municipalities",
    description: "Track waste diversion across city projects. Meet sustainability goals with verified data and public transparency.",
    benefits: ["Public accountability dashboards", "Goal tracking & benchmarking", "Regulatory compliance"]
  },
  {
    icon: Building2,
    title: "Developers & Property Managers",
    description: "Differentiate your projects with verified green credentials. Attract eco-conscious tenants and investors.",
    benefits: ["ESG reporting metrics", "Marketing materials", "Investor-ready documentation"]
  },
];

const GreenHalo = () => {
  return (
    <Layout
      title="Green Halo™ – Recycling Support Program"
      description="Track recycling documentation for your projects. Weight tickets, diversion reports, and sustainability data available upon request."
    >
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white pt-24 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 mb-6">
              <Recycle className="w-3 h-3 mr-1" />
              Recycling Support
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Green Halo™
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-4">
              Recycling Documentation & Diversion Support
            </p>
            <p className="text-lg text-emerald-200/80 mb-10 max-w-2xl mx-auto">
              We work with licensed transfer stations that recycle construction and demolition 
              materials whenever possible. Request recycling documentation for qualifying projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg shadow-black/20">
                  Request Documentation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/quote">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Get a Quote
                </Button>
              </Link>
            </div>
          </div>

          {/* What We Provide - NOT fake stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <FileText className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
              <p className="text-emerald-200 text-sm">Weight Tickets</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
              <p className="text-emerald-200 text-sm">Diversion Reports</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
              <p className="text-emerald-200 text-sm">WMP Compliance</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <Shield className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
              <p className="text-emerald-200 text-sm">Facility Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Green Halo */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 mb-4">About the Program</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                What is Green Halo™?
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Green Halo is our recycling documentation program that provides transparency 
                into where your materials go. We deliver to licensed transfer stations that 
                sort and recycle construction and demolition materials per local regulations.
              </p>
              <p className="text-muted-foreground mb-8">
                For qualifying projects, we provide weight tickets, diversion documentation, 
                and facility information for WMP (Waste Management Plan) compliance.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-800/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Green Halo™</h3>
                    <p className="text-sm text-muted-foreground">Recycling Support Program</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                    <h4 className="font-medium text-foreground mb-3">What You Receive</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Weight tickets from certified facilities
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Material type documentation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Facility information for WMP
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Diversion summaries upon request
                      </li>
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Diversion rates vary by material type and facility capabilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Tracking Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">The Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Recycling is Tracked
            </h2>
            <p className="text-gray-600">
              From pickup to report, every step is documented and verified for complete transparency.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-200 hidden lg:block" style={{ transform: 'translateX(-50%)' }} />
            
            <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-4">
              {trackingSteps.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 ${index % 2 === 0 ? 'lg:mt-0' : 'lg:mt-12'}`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg shadow-emerald-500/30">
                      {step.step}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What You Get - Reports, Receipts, Invoices */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">What You Get</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Documentation & Reporting
            </h2>
            <p className="text-gray-600">
              Every Green Halo project comes with comprehensive documentation for compliance, marketing, and record-keeping.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                title: 'Weight Tickets',
                description: 'Official scale tickets from certified facilities showing exact tonnage for each load.',
                items: ['Certified facility stamps', 'Date & time records', 'Material classification'],
              },
              {
                icon: Recycle,
                title: 'Diversion Reports',
                description: 'Detailed breakdown of materials diverted from landfills and recycling percentages.',
                items: ['Material-by-material breakdown', 'Diversion rate calculations', 'Facility certifications'],
              },
              {
                icon: BarChart3,
                title: 'Environmental Impact',
                description: 'Calculated environmental metrics showing your contribution to sustainability.',
                items: ['CO₂ reduction equivalents', 'Trees saved calculations', 'Energy savings estimates'],
              },
              {
                icon: FileText,
                title: 'Invoices & Receipts',
                description: 'Clear invoicing with sustainability data included for easy accounting and proof of service.',
                items: ['Itemized service breakdown', 'Green Halo certification', 'Audit-ready format'],
              },
            ].map((item) => (
              <div key={item.title} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                <ul className="space-y-2">
                  {item.items.map((subItem) => (
                    <li key={subItem} className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      {subItem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Downloadable Reports Highlight */}
          <div className="mt-12 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Downloadable PDF Reports
                </h3>
                <p className="text-gray-600 mb-6">
                  Get professional, branded sustainability reports that you can share with clients, 
                  include in bids, or submit for LEED and compliance documentation.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    'Project summary with all key metrics',
                    'Material breakdown and diversion rates',
                    'Environmental impact equivalencies',
                    'Facility certifications and verification',
                    'Custom branding options available',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Green Impact Report</p>
                    <p className="text-xs text-gray-500">Project: Oak Street Renovation</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tonnage</span>
                    <span className="font-semibold text-gray-900">12.4 tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diversion Rate</span>
                    <span className="font-semibold text-emerald-600">91%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CO₂ Avoided</span>
                    <span className="font-semibold text-gray-900">8.2 metric tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trees Equivalent</span>
                    <span className="font-semibold text-gray-900">47 trees</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Sample Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-slate-400 text-xs ml-2">Green Halo Dashboard</span>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-4 space-y-4">
                  {/* Mini dashboard preview */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-500/20 rounded-lg p-3 text-center">
                      <p className="text-emerald-400 text-2xl font-bold">89%</p>
                      <p className="text-slate-400 text-xs">Diversion</p>
                    </div>
                    <div className="bg-slate-600/50 rounded-lg p-3 text-center">
                      <p className="text-white text-2xl font-bold">45.8</p>
                      <p className="text-slate-400 text-xs">Tons</p>
                    </div>
                    <div className="bg-slate-600/50 rounded-lg p-3 text-center">
                      <p className="text-white text-2xl font-bold">127</p>
                      <p className="text-slate-400 text-xs">Trees</p>
                    </div>
                  </div>
                  <div className="bg-slate-600/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 text-sm">Monthly Trend</span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 55, 45, 60, 75, 65, 80].map((h, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge className="bg-amber-100 text-amber-700 border-0 mb-4">Coming Soon</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Client Portal – Coming Q2 2026
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We're building a dedicated client portal where you can access your sustainability metrics anytime. 
                Track projects, download reports, and monitor your environmental impact in real-time.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Live tonnage and diversion tracking",
                  "Project-by-project breakdowns",
                  "Downloadable PDF sustainability reports",
                  "Material type analysis and trends",
                  "CO₂ equivalent calculations"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">Early Access Available</p>
                    <p className="text-sm text-amber-700">
                      Request early access to the client portal beta and be the first to track your impact.
                    </p>
                  </div>
                </div>
              </div>
              <Link to="/contact">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                  <Eye className="w-5 h-5 mr-2" />
                  Request Early Access
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Map Preview */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">Public Transparency</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Public Impact Map
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                See verified recycling impact across California. Our public map showcases 
                real projects with verified diversion data—demonstrating our commitment to transparency.
              </p>
              <p className="text-gray-600 mb-8">
                Clients can choose to display their projects publicly, contributing to a 
                growing network of verified sustainable construction and demolition practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/green-impact">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                    <Globe className="w-5 h-5 mr-2" />
                    Explore Impact Map
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl h-72 relative overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                    <path d="M30,20 Q50,10 70,20 T90,50 Q80,80 50,90 T10,50 Q20,30 30,20" fill="none" stroke="#10b981" strokeWidth="0.5" />
                  </svg>
                  {/* Sample pins */}
                  <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-emerald-500 rounded-full shadow-lg animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-teal-500 rounded-full shadow-lg" />
                  <div className="absolute top-2/5 right-1/3 w-4 h-4 bg-emerald-600 rounded-full shadow-lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-700">Bay Area Projects</p>
                      <p className="text-sm text-gray-500">Click to explore</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">Who It's For</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Sustainability Leaders
            </h2>
            <p className="text-gray-600">
              Green Halo serves organizations committed to verified environmental impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4">
                    <useCase.icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                  <CardDescription className="text-base">{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Request Impact Report CTA */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">Free Report</Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Request a Green Impact Report
                </h3>
                <p className="text-gray-600 mb-6">
                  Already a customer? Request a detailed sustainability report for any of your past or current projects. 
                  It's included with every Green Halo rental.
                </p>
                <ul className="space-y-2 mb-6">
                  {['PDF format for easy sharing', 'LEED-ready documentation', 'Typically delivered within 24-48 hours'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                <h4 className="font-semibold text-gray-900 mb-4">Request Your Report</h4>
                <div className="space-y-4">
                  <a 
                    href="mailto:sustainability@calsandumpsterspro.com?subject=Green Impact Report Request"
                    className="block"
                  >
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                      <FileText className="w-4 h-4 mr-2" />
                      Email Report Request
                    </Button>
                  </a>
                  <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="block">
                    <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      Call {BUSINESS_INFO.phone.salesFormatted}
                    </Button>
                  </a>
                  <p className="text-xs text-center text-gray-500">
                    Include your project address and rental dates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Activate Green Halo™ for Your Next Project
          </h2>
          <p className="text-xl text-emerald-100 mb-4">
            Join the growing network of sustainability-focused organizations.
          </p>
          <p className="text-emerald-200/80 mb-10 max-w-2xl mx-auto">
            Get verified sustainability tracking, certified reports, and documentation 
            that demonstrates your commitment to environmental responsibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quote">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg">
                Get a Quote with Green Halo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="mailto:sustainability@calsandumpsterspro.com">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Contact Sustainability Team
              </Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GreenHalo;
