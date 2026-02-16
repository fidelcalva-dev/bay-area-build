import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, User, Tag } from 'lucide-react';
import benefitsSameProviderImg from '@/assets/blog/benefits-same-provider.jpg';
import positiveImpactOaklandImg from '@/assets/blog/positive-impact-oakland.jpg';
import checklistBeforeDumpsterImg from '@/assets/blog/checklist-before-dumpster.jpg';
import separateRecyclableImg from '@/assets/blog/separate-recyclable-materials.jpg';
import { PAGE_SEO } from '@/lib/seo';

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
    title: 'Benefits of Working with the Same Dumpster Provider',
    excerpt: 'In construction, remodeling, and commercial projects, waste management is not something you want to leave to chance. Having a regular contract with a single dumpster rental provider brings efficiency, cost savings, and peace of mind.',
    category: 'Contractor Tips',
    date: 'February 16, 2026',
    readTime: '4 min read',
    slug: 'benefits-same-dumpster-provider',
    image: benefitsSameProviderImg,
  },
  {
    id: 2,
    title: 'The Positive Impact of Dumpster Rentals in the Oakland Community',
    excerpt: 'At Calsan Dumpsters Pro, we believe that a cleaner community is a stronger community — and dumpster rentals play a bigger role in Oakland\'s progress than many people realize.',
    category: 'Community',
    date: 'February 14, 2026',
    readTime: '4 min read',
    slug: 'positive-impact-dumpster-rentals-oakland',
    image: positiveImpactOaklandImg,
  },
  {
    id: 3,
    title: 'Checklist: Everything You Need Before Your Dumpster Arrives',
    excerpt: 'Before your dumpster arrives, make sure your jobsite or home is ready with this easy checklist to avoid delays and protect your property.',
    category: 'Tips & Guides',
    date: 'February 12, 2026',
    readTime: '5 min read',
    slug: 'checklist-before-dumpster-arrives',
    image: checklistBeforeDumpsterImg,
  },
  {
    id: 4,
    title: 'How to Separate Recyclable Materials in Your Construction Dumpster',
    excerpt: 'Recycling on construction and demolition sites helps reduce landfill waste, keeps your jobsite organized, and can even lower disposal costs.',
    category: 'Recycling',
    date: 'February 10, 2026',
    readTime: '4 min read',
    slug: 'separate-recyclable-materials-construction-dumpster',
    image: separateRecyclableImg,
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
      title={PAGE_SEO.blog.title}
      description={PAGE_SEO.blog.description}
      canonical={PAGE_SEO.blog.canonical}
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
                {/* Image */}
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {(post as any).image ? (
                    <img src={(post as any).image} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Tag className="w-8 h-8 text-primary" />
                    </div>
                  )}
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
