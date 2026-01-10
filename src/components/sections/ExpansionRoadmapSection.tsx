import { MapPin, Rocket, Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface MilestoneData {
  year: string;
  quarter?: string;
  title: string;
  regions: string[];
  status: 'completed' | 'in-progress' | 'upcoming';
  highlight?: string;
}

const milestones: MilestoneData[] = [
  {
    year: '2022',
    title: 'Bay Area Launch',
    regions: ['Oakland', 'Fremont', 'Hayward', 'San Leandro'],
    status: 'completed',
    highlight: 'Founded in Alameda County',
  },
  {
    year: '2023',
    title: 'East Bay Expansion',
    regions: ['San Jose', 'Palo Alto', 'Concord', 'Walnut Creek', 'Richmond'],
    status: 'completed',
    highlight: '500+ projects completed',
  },
  {
    year: '2024',
    title: 'Full Bay Area Coverage',
    regions: ['San Francisco', 'San Mateo', 'Napa', 'Marin', 'Sonoma'],
    status: 'completed',
    highlight: 'Google Guaranteed badge earned',
  },
  {
    year: '2025',
    quarter: 'Q1-Q2',
    title: 'Central Valley Push',
    regions: ['Sacramento', 'Stockton', 'Modesto'],
    status: 'in-progress',
    highlight: 'Now seeking operators',
  },
  {
    year: '2025',
    quarter: 'Q3-Q4',
    title: 'SoCal Entry',
    regions: ['Los Angeles', 'Orange County', 'San Diego'],
    status: 'upcoming',
    highlight: 'Operator applications open',
  },
  {
    year: '2026',
    title: 'Statewide Coverage',
    regions: ['Fresno', 'Bakersfield', 'Inland Empire', 'Central Coast'],
    status: 'upcoming',
    highlight: 'Full California network',
  },
];

const stats = [
  { value: '9', label: 'Counties Served' },
  { value: '50+', label: 'Cities Active' },
  { value: '2026', label: 'Statewide Goal' },
];

export const ExpansionRoadmapSection = () => {
  const getStatusIcon = (status: MilestoneData['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-accent animate-pulse" />;
      case 'upcoming':
        return <Target className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusStyles = (status: MilestoneData['status']) => {
    switch (status) {
      case 'completed':
        return 'border-primary/50 bg-primary/5';
      case 'in-progress':
        return 'border-accent bg-accent/10 ring-2 ring-accent/20';
      case 'upcoming':
        return 'border-border bg-muted/30';
    }
  };

  return (
    <section className="section-padding bg-gradient-to-b from-secondary to-secondary/95 overflow-hidden">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Rocket className="h-4 w-4" />
            Growing Across California
          </div>
          <h2 className="heading-lg text-secondary-foreground mb-4">
            Our Expansion Roadmap
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From a single yard in Oakland to statewide coverage — we're building California's most reliable dumpster rental network.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-muted-foreground/30 transform md:-translate-x-1/2" />

          <div className="space-y-8 md:space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`relative flex items-start gap-6 md:gap-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Node */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center transform -translate-x-1/2 z-10 shadow-lg">
                  {getStatusIcon(milestone.status)}
                </div>

                {/* Content Card */}
                <div
                  className={`ml-12 md:ml-0 md:w-[calc(50%-3rem)] ${
                    index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'
                  }`}
                >
                  <div
                    className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-lg ${getStatusStyles(
                      milestone.status
                    )}`}
                  >
                    {/* Year Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-foreground">
                        {milestone.year}
                      </span>
                      {milestone.quarter && (
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                          {milestone.quarter}
                        </span>
                      )}
                      {milestone.status === 'in-progress' && (
                        <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full font-medium animate-pulse">
                          NOW
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-foreground mb-2">
                      {milestone.title}
                    </h3>

                    {/* Regions */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {milestone.regions.map((region, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-background/80 rounded-full text-muted-foreground"
                        >
                          <MapPin className="h-3 w-3" />
                          {region}
                        </span>
                      ))}
                    </div>

                    {/* Highlight */}
                    {milestone.highlight && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{milestone.highlight}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:w-[calc(50%-3rem)]" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 pt-8 border-t border-border/20">
          <p className="text-muted-foreground mb-4">
            Want to be part of our growth story?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="cta" size="lg" asChild>
              <Link to="/careers">
                Join as a City Operator
                <Rocket className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-border" asChild>
              <a href="tel:+15106802150">
                Discuss Partnership
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};