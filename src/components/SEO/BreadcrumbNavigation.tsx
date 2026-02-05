import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const getBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    if (index === segments.length - 1) {
      items.push({ label });
    } else {
      items.push({ label, href });
    }
  });

  return items;
};

export const BreadcrumbNavigation = () => {
  const location = useLocation();
  const breadcrumbItems = getBreadcrumbItems(location.pathname);

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <section className="bg-muted/30 py-4 border-b">
      <div className="container mx-auto px-4">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href} className="text-muted-foreground hover:text-foreground">
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-foreground font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Structured Data for Breadcrumbs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": breadcrumbItems.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.label,
                ...(item.href && { "item": `https://handyhjelp.no${item.href}` })
              }))
            })
          }}
        />
      </div>
    </section>
  );
};