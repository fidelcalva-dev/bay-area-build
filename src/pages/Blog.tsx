import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react';
import { getAllBlogArticles } from './BlogArticle';
const benefitsSameProviderImg = '/images/blog/benefits-same-provider.jpg';
const positiveImpactOaklandImg = '/images/blog/positive-impact-oakland.jpg';
const checklistBeforeDumpsterImg = '/images/blog/checklist-before-dumpster.jpg';
const separateRecyclableImg = '/images/blog/separate-recyclable-materials.jpg';
const dumpstersBigMovesImg = '/images/blog/dumpsters-big-moves.jpg';
const postStormCleanupImg = '/images/blog/post-storm-cleanup.jpg';
import { PAGE_SEO } from '@/lib/seo';

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
            {allPosts.map((post) => {
              const image = BLOG_IMAGES[post.slug] || (post as any).image;
              return (
                <Link to={`/blog/${post.slug}`} key={post.slug}>
                  <article className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-card-hover transition-all group h-full">
                    {/* Image */}
                    <div className="aspect-[16/9] bg-muted flex items-center justify-center overflow-hidden">
                      {image ? (
                        <img src={image} alt={post.title} className="w-full h-full object-cover object-top" loading="lazy" />
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
