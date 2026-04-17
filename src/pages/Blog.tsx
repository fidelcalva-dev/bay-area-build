import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, Tag, Phone } from 'lucide-react';
import { getAllBlogArticles } from './BlogArticle';
const benefitsSameProviderImg = '/images/blog/benefits-same-provider.jpg';
const positiveImpactOaklandImg = '/images/blog/positive-impact-oakland.jpg';
const checklistBeforeDumpsterImg = '/images/blog/checklist-before-dumpster.jpg';
const separateRecyclableImg = '/images/blog/separate-recyclable-materials.jpg';
const dumpstersBigMovesImg = '/images/blog/dumpsters-big-moves.jpg';
const postStormCleanupImg = '/images/blog/post-storm-cleanup.jpg';
import { PAGE_SEO, BUSINESS_INFO } from '@/lib/seo';

// Map slugs to their imported images
const BLOG_IMAGES: Record<string, string> = {
  'benefits-same-dumpster-provider': benefitsSameProviderImg,
  'positive-impact-dumpster-rentals-oakland': positiveImpactOaklandImg,
  'checklist-before-dumpster-arrives': checklistBeforeDumpsterImg,
  'separate-recyclable-materials-construction-dumpster': separateRecyclableImg,
  'using-dumpsters-for-big-moves': dumpstersBigMovesImg,
  'dumpster-post-storm-cleanup-bay-area': postStormCleanupImg,
};

const blogCategories = [
  { name: 'Pricing', slug: 'pricing' },
  { name: 'Materials', slug: 'materials' },
  { name: 'Sizing', slug: 'sizing' },
  { name: 'Permits', slug: 'permits' },
  { name: 'Guides', slug: 'guides' },
  { name: 'Local', slug: 'local' },
];

export default function Blog() {
  const allPosts = getAllBlogArticles();
  const [activeCategory, setActiveCategory] = useState<string>('all');

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
            <h1 className="heading-xl mb-4">Dumpster Rental Tips &amp; Guides</h1>
            <p className="text-xl text-primary-foreground/85">
              Expert advice on sizing, materials, permits, and waste disposal for Bay Area residents and contractors.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-muted border-b border-border">
        <div className="container-wide">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              All Posts
            </button>
            {blogCategories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setActiveCategory(category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.slug ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts + Sidebar */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            <div className="grid md:grid-cols-2 gap-6">
              {allPosts
                .filter(post => activeCategory === 'all' || post.category?.toLowerCase() === activeCategory)
                .map((post) => {
                const image = BLOG_IMAGES[post.slug] || (post as any).image;
                return (
                  <Link to={`/blog/${post.slug}`} key={post.slug}>
                    <article className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-card-hover transition-all group h-full">
                      <div className="aspect-[16/9] bg-muted flex items-center justify-center overflow-hidden">
                        {image ? (
                          <img src={image} alt={post.title} width={400} height={300} loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Tag className="w-8 h-8 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-3">
                          {post.category}
                        </span>
                        <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {post.metaDescription}
                        </p>
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
                  </Link>
                );
              })}
            </div>

            {/* Commercial Sidebar */}
            <aside className="hidden lg:block space-y-6">
              <div className="bg-primary text-primary-foreground rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-2">Need a Dumpster?</h3>
                <p className="text-sm text-primary-foreground/80 mb-4">Get an instant quote with transparent, all-inclusive pricing.</p>
                <Button asChild variant="cta" size="lg" className="w-full">
                  <Link to="/quote">Get Instant Quote</Link>
                </Button>
                <div className="mt-4 pt-4 border-t border-primary-foreground/20">
                  <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground">
                    <Phone className="w-4 h-4" />
                    {BUSINESS_INFO.phone.salesFormatted}
                  </a>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-3">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <Link to="/sizes" className="block text-primary hover:underline">Dumpster Sizes Guide</Link>
                  <Link to="/pricing" className="block text-primary hover:underline">Pricing</Link>
                  <Link to="/materials" className="block text-primary hover:underline">Materials Guide</Link>
                  <Link to="/areas" className="block text-primary hover:underline">Service Areas</Link>
                  <Link to="/permits" className="block text-primary hover:underline">Permit Guide</Link>
                </div>
              </div>
            </aside>
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
            <Link to="/quote">
              Get Instant Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
