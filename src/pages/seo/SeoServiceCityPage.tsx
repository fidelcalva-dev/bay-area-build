import { useParams, Navigate, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";

export default function SeoServiceCityPage() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const location = useLocation();
  const serviceSlug = location.pathname.split("/")[1]; // e.g. "concrete-disposal"

  const urlPath = `/${serviceSlug}/${citySlug}`;

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["seo-service-page", urlPath],
    queryFn: async () => {
      const { data } = await supabase
        .from("seo_pages")
        .select("*")
        .eq("url_path", urlPath)
        .eq("is_published", true)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) {
    return (
      <Layout title="Loading...">
        <div className="container-wide py-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-2/3 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!page) {
    return <Navigate to="/areas" replace />;
  }

  const faqs = Array.isArray(page.faq_json) ? page.faq_json : [];
  const internalLinks = Array.isArray(page.internal_links) ? page.internal_links : [];

  return (
    <Layout title={page.title} description={page.meta_description}>
      <Helmet>
        <link rel="canonical" href={`https://calsandumpsterspro.com${page.canonical_url || urlPath}`} />
        {page.schema_json && (
          <script type="application/ld+json">{JSON.stringify(page.schema_json)}</script>
        )}
      </Helmet>

      <section className="bg-background py-12 lg:py-16">
        <div className="container-wide max-w-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
            {page.h1}
          </h1>

          {page.body_content && (
            <div className="prose prose-lg max-w-none text-muted-foreground mt-8">
              <ReactMarkdown>{page.body_content}</ReactMarkdown>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Get Your Exact Price</h2>
            <p className="text-muted-foreground mb-4">Enter your ZIP code for instant, all-inclusive pricing.</p>
            <Link to="/quote">
              <Button variant="cta" size="lg">
                Get Exact Price <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* FAQs */}
          {faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq: any, i: number) => (
                  <details key={i} className="bg-card border border-border rounded-xl p-4 group">
                    <summary className="font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
                      {faq.question}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="mt-3 text-muted-foreground text-sm">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Internal Links */}
          {internalLinks.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Related Pages</h3>
              <div className="flex flex-wrap gap-2">
                {internalLinks.map((link: string, i: number) => (
                  <Link key={i} to={link} className="text-sm text-primary hover:underline flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {link.replace(/\//g, " ").trim()}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Last updated */}
          {page.last_generated_at && (
            <p className="mt-6 text-xs text-muted-foreground">
              Last updated: {new Date(page.last_generated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
}
