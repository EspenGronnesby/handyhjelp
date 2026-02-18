import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEditMode } from "@/contexts/EditModeContext";
import { Pencil } from "lucide-react";
import { ClientLogosEditModal } from "./ClientLogosEditModal";

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
}

const ClientLogosSection = () => {
  const { editMode, isOwner } = useEditMode();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: logos = [], refetch } = useQuery({
    queryKey: ["client-logos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_logos")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as ClientLogo[];
    },
  });

  // In edit mode, owners can see the section even if empty
  const showSection = logos.length > 0 || (isOwner && editMode);

  if (!showSection) return null;

  return (
    <section className="py-12 md:py-16 bg-muted/30 border-y border-border/30">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Edit button for owner */}
          {isOwner && editMode && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-0 right-0 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
              aria-label="Rediger samarbeidspartnere"
            >
              <Pencil className="h-5 w-5 text-primary" />
            </button>
          )}

          {/* Heading */}
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Stolte samarbeidspartnere
            </p>
            <div className="w-16 h-0.5 bg-primary/30 mx-auto" />
          </div>

          {/* Logo grid / empty state */}
          {logos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                Ingen logoer lagt til ennå. Klikk på blyant-ikonet for å legge til.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-10 items-center max-w-5xl mx-auto">
              {logos.map((logo) => {
                const LogoWrapper = logo.website_url ? "a" : "div";
                const wrapperProps = logo.website_url
                  ? {
                      href: logo.website_url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {};

                return (
                  <LogoWrapper
                    key={logo.id}
                    {...(wrapperProps as any)}
                    className="flex items-center justify-center p-3 rounded-xl transition-all duration-300 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 hover:scale-105 group"
                    title={logo.name}
                  >
                    <img
                      src={logo.logo_url}
                      alt={`${logo.name} logo`}
                      className="max-h-12 max-w-full object-contain"
                    />
                  </LogoWrapper>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ClientLogosEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={refetch}
      />
    </section>
  );
};

export default ClientLogosSection;
