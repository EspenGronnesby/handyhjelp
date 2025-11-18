import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Search, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("alle");
  const [email, setEmail] = useState("");

  const blogPosts = [
    {
      id: 1,
      title: "5 tegn på at du trenger en vaktmester",
      excerpt: "Oppdager du små problemer som bare blir verre? Her er tegnene på at det er på tide å få profesjonell hjelp.",
      category: "Vaktmester",
      date: "15. januar 2025",
      readTime: "5 min",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Slik forbereder du hjemmet for vinteren",
      excerpt: "En komplett guide til vinterklarggjøring av boligen din. Unngå dyre reparasjoner med riktig forberedelse.",
      category: "Sesongråd",
      date: "12. januar 2025",
      readTime: "8 min",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Når må takrennene skiftes?",
      excerpt: "Defekte takrenner kan føre til store vannsskader. Lær å kjenne igjen tegnene på at det er tid for skifte.",
      category: "Blikk",
      date: "10. januar 2025",
      readTime: "6 min",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "DIY vs. Profesjonell hjelp - hva lønner seg?",
      excerpt: "Når kan du gjøre det selv, og når bør du ringe en fagmann? Vi gir deg svaret på de vanligste oppgavene.",
      category: "Vaktmester",
      date: "8. januar 2025",
      readTime: "7 min",
      image: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Guide til kjøkkenrenovering på budsjett",
      excerpt: "Drømmer du om nytt kjøkken? Her er våre beste tips for å få mest mulig ut av budsjettet ditt.",
      category: "Tømrer",
      date: "5. januar 2025",
      readTime: "10 min",
      image: "/placeholder.svg"
    },
    {
      id: 6,
      title: "Vedlikehold av terrasse - årlig sjekkliste",
      excerpt: "Hold terrassen din i toppform med denne enkle vedlikeholdsguiden. Forlenget levetid og bedre utseende garantert.",
      category: "Tømrer",
      date: "3. januar 2025",
      readTime: "5 min",
      image: "/placeholder.svg"
    },
    {
      id: 7,
      title: "Hvordan oppdage og fikse taklekkasjer",
      excerpt: "Taklekkasjer kan føre til store skader hvis de ikke oppdages i tide. Lær hvordan du finner og utbedrer problemet.",
      category: "Blikk",
      date: "29. desember 2024",
      readTime: "8 min",
      image: "/placeholder.svg"
    },
    {
      id: 8,
      title: "Vårrens vedlikeholdsoppgaver - komplett liste",
      excerpt: "Våren er perfekt tid for vedlikehold. Få oversikt over alle oppgavene som bør gjøres når snøen smelter.",
      category: "Sesongråd",
      date: "27. desember 2024",
      readTime: "6 min",
      image: "/placeholder.svg"
    },
    {
      id: 9,
      title: "Energisparing i hjemmet - 10 enkle tips",
      excerpt: "Reduser strømregningen med disse enkle tiltakene. Små endringer kan gi store besparelser over tid.",
      category: "Vaktmester",
      date: "22. desember 2024",
      readTime: "7 min",
      image: "/placeholder.svg"
    }
  ];

  const categories = [
    { id: "alle", name: "Alle artikler", count: 9 },
    { id: "Vaktmester", name: "Vaktmester", count: 3 },
    { id: "Tømrer", name: "Tømrer", count: 2 },
    { id: "Blikk", name: "Blikk", count: 2 },
    { id: "Sesongråd", name: "Sesongråd", count: 2 }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "alle" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic would go here
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen">
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Gode råd for eiendomsvedlikehold
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Praktiske tips og veiledning fra våre erfarne fagfolk
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Søk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Søk i artikler..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kategorier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Nyhetsbrev</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Få de nyeste rådene og tipsene direkte i innboksen din
                  </p>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Din e-post"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" variant="cta" className="w-full">
                      Meld deg på
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </aside>

            {/* Blog Posts Grid */}
            <div className="lg:col-span-3">
              {filteredPosts.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    Ingen artikler funnet. Prøv et annet søk eller kategori.
                  </p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow overflow-hidden group">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                          {post.category}
                        </Badge>
                      </div>
                      <CardHeader>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{post.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {post.excerpt}
                        </p>
                        <Link to={`/raad/${post.id}`}>
                          <Button variant="link" className="p-0 h-auto">
                            Les mer →
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination placeholder */}
              {filteredPosts.length > 0 && (
                <div className="mt-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Viser {filteredPosts.length} av {blogPosts.length} artikler
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto text-center p-8">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">
                Trenger du profesjonell hjelp?
              </CardTitle>
              <p className="text-muted-foreground">
                Våre erfarne fagfolk står klare til å hjelpe deg med alle typer eiendomsvedlikehold
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-4">
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
