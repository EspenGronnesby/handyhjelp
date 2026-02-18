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

const LogoItem = ({ logo }: { logo: ClientLogo }) => {
  const inner = (
    <div
      className="group flex items-center justify-center px-6 py-3 rounded-xl transition-all duration-500 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 hover:scale-105 cursor-pointer"
      title={logo.name}
    >
      {/* Fixed container: 140×56px — fits square, round, wide/text logos */}
      <img
        src={logo.logo_url}
        alt={`${logo.name} logo`}
        className="block object-contain"
        style={{ maxWidth: 140, maxHeight: 56, width: "auto", height: "auto" }}
        draggable={false}
      />
    </div>
  );

  if (logo.website_url) {
    return (
      <a
        href={logo.website_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Gå til ${logo.name} sin nettside`}
      >
        {inner}
      </a>
    );
  }

  return <div>{inner}</div>;
};

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

  const showSection = logos.length > 0 || (isOwner && editMode);
  if (!showSection) return null;

  // Duplicate logos for seamless marquee loop
  const marqueLogos = logos.length > 0 ? [...logos, ...logos] : [];

  return (
    <section className="py-10 bg-muted/30 border-y border-border/30 overflow-hidden">
      <div className="relative">
        {/* Edit button */}
        {isOwner && editMode && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-0 right-4 z-20 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
            aria-label="Rediger samarbeidspartnere"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}

        {/* Heading */}
        <div className="text-center mb-8 px-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Stolte samarbeidspartnere
          </p>
        </div>

        {/* Empty state */}
        {logos.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground px-4">
            <p className="text-sm">
              Ingen logoer lagt til ennå. Klikk på blyant-ikonet for å legge til.
            </p>
          </div>
        ) : (
          <>
            {/* Fade masks on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, hsl(var(--background)) 0%, transparent 100%)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, hsl(var(--background)) 0%, transparent 100%)" }} />

            {/* Marquee track */}
            <div
              className="flex items-center w-max"
              style={{
                animation: `marquee-scroll ${logos.length * 6}s linear infinite`,
              }}
            >
              {marqueLogos.map((logo, i) => (
                <LogoItem key={`${logo.id}-${i}`} logo={logo} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Marquee keyframes injected via style tag */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <ClientLogosEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={refetch}
      />
    </section>
  );
};

export default ClientLogosSection;
