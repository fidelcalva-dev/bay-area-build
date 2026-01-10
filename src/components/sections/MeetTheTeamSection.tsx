import { User } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  department: 'operations' | 'drivers' | 'sales';
  bio: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Marcus Johnson',
    role: 'Operations Manager',
    department: 'operations',
    bio: '15+ years coordinating logistics across the Bay Area. Ensures every delivery runs on schedule.',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Lead Dispatcher',
    department: 'operations',
    bio: 'Fluent in English and Spanish. Manages daily routes and customer communications.',
  },
  {
    name: 'James Chen',
    role: 'Senior Driver',
    department: 'drivers',
    bio: '10 years of experience navigating SF streets. Expert in tight-space deliveries.',
  },
  {
    name: 'David Williams',
    role: 'Owner Operator',
    department: 'drivers',
    bio: 'Runs his own truck with us since 2018. Known for reliability and professionalism.',
  },
  {
    name: 'Sarah Mitchell',
    role: 'Customer Support Lead',
    department: 'sales',
    bio: 'First point of contact for new customers. Makes booking easy and stress-free.',
  },
  {
    name: 'Carlos Mendez',
    role: 'Sales Representative',
    department: 'sales',
    bio: 'Helps contractors find the right dumpster size. Hablamos español.',
  },
];

const departmentColors = {
  operations: 'bg-primary/10 text-primary border-primary/20',
  drivers: 'bg-accent/10 text-accent border-accent/20',
  sales: 'bg-success/10 text-success border-success/20',
};

const departmentLabels = {
  operations: 'Operations & Dispatch',
  drivers: 'Drivers',
  sales: 'Sales & Support',
};

export const MeetTheTeamSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-lg text-foreground mb-4">
            Built by Real People, Not Just Trucks
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our operations are powered by experienced drivers, dispatchers, and local operators who care about reliability and safety.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-card rounded-xl border border-border/50 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Photo Placeholder */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border/50 overflow-hidden">
                  {/* Replace with real photos */}
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>

              {/* Department Badge */}
              <span
                className={`inline-block text-xs font-medium px-2 py-1 rounded-full border mb-3 ${departmentColors[member.department]}`}
              >
                {departmentLabels[member.department]}
              </span>

              {/* Bio */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>

        {/* Hiring Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-6 py-3 border border-border/30">
            <span className="text-sm text-muted-foreground">
              We're always looking for reliable drivers and operators.
            </span>
            <a
              href="/contact"
              className="text-sm font-medium text-primary hover:underline"
            >
              Join our team →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
