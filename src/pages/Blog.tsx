import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Search, Tag, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EditableBottomCTA } from "@/components/EditableBottomCTA";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableHero } from "@/components/EditableHero";
import { PageSEO } from "@/components/SEO/PageSEO";
import { TrustStripe } from "@/components/TrustStripe";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  cover_image_url: string;
  category: string;
  published_at: string;
  reading_time: number;
}

const categoryLabels: Record<string, string> = {
  vaktmester: "Vaktmester",
  tomrer: "Tømrer",
  blikk: "Blikk",
  sesongråd: "Sesongråd",
  generelt: "Generelt",
};

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("alle");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBlogPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (data && !error) {
      setBlogPosts(data);
      setError(false);
    } else {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const categories = [
    { id: "alle", name: "Alle artikler", count: blogPosts.length },
    { id: "vaktmester", name: "Vaktmester", count: blogPosts.filter(p => p.category === 'vaktmester').length },
    { id: "tomrer", name: "Tømrer", count: blogPosts.filter(p => p.category === 'tomrer').length },
    { id: "blikk", name: "Blikk", count: blogPosts.filter(p => p.category === 'blikk').length },
    { id: "sesongråd", name: "Sesongråd", count: blogPosts.filter(p => p.category === 'sesongråd').length },
    { id: "generelt", name: "Generelt", count: blogPosts.filter(p => p.category === 'generelt').length },
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "alle" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      <PageSEO path="/raad" />
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <EditableHero
            section="hero-rad"
            defaultHeading="Gode råd for eiendomsvedlikehold"
            defaultSubtext="Praktiske tips og veiledning fra våre erfarne fagfolk"
            className="max-w-3xl mx-auto"
          />
        </div>
      </section>

      <TrustStripe />

      {/* Main Content */}
      <main id="main-content" className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Sidebar - Shows first on mobile for better UX */}
            <aside className="order-first lg:order-none lg:col-span-1 space-y-4 lg:space-y-6">
              {/* Search */}
              <div className="glass-card p-4 lg:p-5">
                <SectionHeading
                  icon={Search}
                  gradient="from-cyan-500 via-blue-500 to-indigo-600"
                  title="Søk"
                  className="!mb-4"
                />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Søk i artikler..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-12 text-base"
                    aria-label="Søk i bloggartikler"
                  />
                </div>
              </div>

              {/* Categories - Horizontal scroll on mobile */}
              <div className="glass-card p-4 lg:p-5">
                <SectionHeading
                  icon={Tag}
                  gradient="from-emerald-500 via-teal-500 to-cyan-600"
                  title="Kategorier"
                  className="!mb-4"
                />
                <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        aria-label={`Vis artikler i kategorien ${category.name}`}
                        className={`flex-shrink-0 lg:w-full text-left px-4 py-3 min-h-[44px] rounded-md transition-colors whitespace-nowrap ${
                          selectedCategory === category.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 hover:bg-muted active:bg-muted"
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-sm font-medium">{category.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
              </div>
            </aside>

            {/* Blog Posts Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-video w-full" />
                      <CardHeader>
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-6 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Card className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-muted-foreground">
                      Noe gikk galt. Kunne ikke hente artiklene.
                    </p>
                    <Button onClick={fetchBlogPosts} variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Prøv igjen
                    </Button>
                  </div>
                </Card>
              ) : filteredPosts.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    {blogPosts.length === 0
                      ? "Vi legger snart ut nyttige råd og artikler om eiendomsvedlikehold."
                      : "Ingen artikler funnet. Prøv et annet søk eller kategori."}
                  </p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <Link key={post.id} to={`/raad/${post.slug}`}>
                      <Card className="h-full overflow-hidden group cursor-pointer card-hover-lift">
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover object-center image-hover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                            {categoryLabels[post.category]}
                          </Badge>
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(post.published_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{post.reading_time} min</span>
                            </div>
                          </div>
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {post.summary}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Results count */}
              {!loading && filteredPosts.length > 0 && (
                <div className="mt-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Viser {filteredPosts.length} av {blogPosts.length} artikler
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CTA Section — same as resten av sidene */}
      <EditableBottomCTA />

      <Footer />
    </div>
  );
};

export default Blog;
