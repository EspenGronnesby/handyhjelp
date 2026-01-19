import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BreadcrumbNavigation } from '@/components/SEO/BreadcrumbNavigation';
import { GoogleAnalytics } from '@/components/SEO/GoogleAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';
import { Skeleton } from '@/components/ui/skeleton';
import DOMPurify from 'dompurify';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url: string;
  category: string;
  published_at: string;
  reading_time: number;
  seo_title: string | null;
  seo_description: string | null;
}

const categoryLabels: Record<string, string> = {
  vaktmester: "Vaktmester",
  tomrer: "Tømrer",
  blikk: "Blikk",
  sesongråd: "Sesongråd",
  generelt: "Generelt",
};

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        navigate('/raad');
        return;
      }

      setPost(data);

      // Fetch related posts from same category
      const { data: related } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .eq('category', data.category)
        .neq('id', data.id)
        .order('published_at', { ascending: false })
        .limit(3);

      if (related) {
        setRelatedPosts(related);
      }

      setLoading(false);
    };

    fetchPost();
  }, [slug, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <GoogleAnalytics />
        <Header />
        <BreadcrumbNavigation />
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{post.seo_title || post.title} | HandyHjelp</title>
        <meta name="description" content={post.seo_description || post.summary} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary} />
        <meta property="og:image" content={post.cover_image_url} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.published_at} />
      </Helmet>
      
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      {/* Hero Image with Overlay */}
      <div className="relative h-[400px] md:h-[500px] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${post.cover_image_url})`, backgroundPosition: 'center center' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 py-12">
            <Badge className="mb-4 bg-primary text-primary-foreground">
              {categoryLabels[post.category]}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 max-w-4xl">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.reading_time} min lesing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <article className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link to="/raad">
              <Button variant="outline" className="mb-8">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake til råd
              </Button>
            </Link>

            {/* Article Content */}
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />

            {/* CTA Card */}
            <Card className="bg-primary/5 border-primary/20 mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Trenger du hjelp med dette?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Våre fagfolk kan hjelpe deg med alt fra små reparasjoner til store prosjekter.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/tilbud">
                    <Button variant="cta" size="lg">
                      Få gratis tilbud
                    </Button>
                  </Link>
                  <Link to="/kontakt">
                    <Button variant="cta-outline" size="lg">
                      Kontakt oss
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div>
                <h2 className="text-2xl font-heading font-bold mb-6">Lignende artikler</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((related) => (
                    <Link key={related.id} to={`/raad/${related.slug}`}>
                      <Card className="h-full overflow-hidden group cursor-pointer card-hover-lift">
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          <img 
                            src={related.cover_image_url} 
                            alt={related.title}
                            className="w-full h-full object-cover object-center image-hover"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                            {related.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {related.summary}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogDetail;
