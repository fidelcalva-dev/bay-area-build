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
      title="Green Halo™ Sustainability Program"
      description="Track your recycling impact with verified data. Real-time dashboards, sustainability reports, and environmental certifications for your projects."
    >
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
              <Sparkles className="w-3 h-3 mr-1" />
              Sustainability Tracking
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Green Halo™
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-4">
              Know exactly where your waste goes.
            </p>
            <p className="text-lg text-emerald-200/80 mb-10 max-w-2xl mx-auto">
              Our proprietary sustainability tracking system provides verified data on every 
              ton diverted from landfills, complete with real-time dashboards and certified reports.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg shadow-black/20">
                  Activate Green Halo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/green-impact">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <MapPin className="w-5 h-5 mr-2" />
                  View Impact Map
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-3xl md:text-4xl font-bold">89%</p>
              <p className="text-emerald-200 text-sm mt-1">Avg. Diversion Rate</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-3xl md:text-4xl font-bold">2.5K+</p>
              <p className="text-emerald-200 text-sm mt-1">Tons Tracked</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-3xl md:text-4xl font-bold">500+</p>
              <p className="text-emerald-200 text-sm mt-1">Projects Certified</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-3xl md:text-4xl font-bold">7K</p>
              <p className="text-emerald-200 text-sm mt-1">Trees Equivalent</p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Green Halo */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">About the Program</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What is Green Halo™?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Green Halo is Calsan's proprietary sustainability tracking system that provides 
                complete transparency into your waste management impact. Every load is tracked, 
                weighed, and verified through our certified facility partners.
              </p>
              <p className="text-gray-600 mb-8">
                Unlike traditional dumpster services that simply haul and dump, Green Halo ensures 
                maximum material recovery and provides you with verified documentation of your 
                environmental contribution.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Green Halo™ Certified</h3>
                    <p className="text-sm text-gray-500">Verified Sustainability Partner</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Diversion Rate</span>
                      <span className="font-bold text-emerald-600">92%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[92%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                      <TreePine className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">127</p>
                      <p className="text-xs text-gray-500">Trees Saved</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                      <Recycle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">45.8t</p>
                      <p className="text-xs text-gray-500">Recycled</p>
                    </div>
                  </div>
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
              <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">Client Portal</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Real-Time Client Dashboard
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Access your sustainability metrics anytime through our secure client portal. 
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
              <Link to="/portal">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                  <Eye className="w-5 h-5 mr-2" />
                  Preview Dashboard
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

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Activate Green Halo™ for Your Project
          </h2>
          <p className="text-xl text-emerald-100 mb-4">
            Join the growing network of sustainability-focused organizations.
          </p>
          <p className="text-emerald-200/80 mb-10 max-w-2xl mx-auto">
            Get verified sustainability tracking, real-time dashboards, and certified reports 
            that demonstrate your commitment to environmental responsibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GreenHalo;
