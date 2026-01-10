import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, User, Tag } from 'lucide-react';

const blogCategories = [
  { name: 'Dumpster Sizes', slug: 'sizes' },
  { name: 'Permits', slug: 'permits' },
  { name: 'Driveway Protection', slug: 'driveway' },
  { name: 'Concrete & Dirt', slug: 'concrete' },
  { name: 'C&D Debris', slug: 'construction' },
];

const blogPosts = [
  {
    id: 1,
    title: 'How to Choose the Right Dumpster Size for Your Project',
    excerpt: 'Not sure which dumpster size you need? This guide covers everything from small garage cleanouts to major renovations.',
    category: 'Dumpster Sizes',
    date: 'January 5, 2026',
    readTime: '5 min read',
    slug: 'choose-right-dumpster-size',
  },
  {
    id: 2,
    title: 'Do You Need a Permit for a Dumpster in the Bay Area?',
    excerpt: 'Learn when you need a dumpster permit and how to get one in Oakland, San Francisco, San Jose, and other Bay Area cities.',
    category: 'Permits',
    date: 'December 28, 2025',
    readTime: '4 min read',
    slug: 'dumpster-permit-bay-area',
  },
  {
    id: 3,
    title: 'How to Protect Your Driveway When Renting a Dumpster',
    excerpt: 'Worried about driveway damage? Here are proven tips to protect your concrete or asphalt from dumpster placement.',
    category: 'Driveway Protection',
    date: 'December 20, 2025',
    readTime: '3 min read',
    slug: 'protect-driveway-dumpster',
  },
  {
    id: 4,
    title: 'Disposing of Concrete and Dirt: What You Need to Know',
    excerpt: 'Concrete and clean dirt require special handling. Learn about weight limits, pricing, and disposal requirements.',
    category: 'Concrete & Dirt',
    date: 'December 15, 2025',
    readTime: '4 min read',
    slug: 'disposing-concrete-dirt',
  },
  {
    id: 5,
    title: 'Construction & Demolition Debris: A Complete Guide',
    excerpt: 'What counts as C&D debris? What can and can\'t go in your dumpster? Everything contractors need to know.',
    category: 'C&D Debris',
    date: 'December 10, 2025',
    readTime: '6 min read',
    slug: 'construction-demolition-debris-guide',
  },
  {
    id: 6,
    title: 'Same-Day Dumpster Delivery: How It Works',
    excerpt: 'Need a dumpster fast? Learn how our same-day delivery service works and how to qualify.',
    category: 'Dumpster Sizes',
    date: 'December 5, 2025',
    readTime: '3 min read',
    slug: 'same-day-dumpster-delivery',
  },
];

export default function Blog() {
  return (
    <Layout
      title="Dumpster Rental Blog | Tips, Guides & News"
      description="Expert tips on dumpster rental, sizing guides, permit information, and waste disposal best practices for Bay Area residents and contractors."
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">Blog & Resources</h1>
            <p className="text-xl text-primary-foreground/85">
              Expert tips, guides, and news to help you with your dumpster rental and waste disposal needs.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-muted border-b border-border">
        <div className="container-wide">
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              All Posts
            </span>
            {blogCategories.map((category) => (
              <span
                key={category.slug}
                className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-card-hover transition-all group"
              >
                {/* Image Placeholder */}
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Tag className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Category */}
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-3">
                    {post.category}
                  </span>
                  
                  {/* Title */}
                  <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  
                  {/* Excerpt */}
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Rent a Dumpster?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Get an instant quote for your project in 30 seconds.
          </p>
          <Button asChild variant="cta" size="xl">
            <Link to="/#quote">
              Get Instant Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
