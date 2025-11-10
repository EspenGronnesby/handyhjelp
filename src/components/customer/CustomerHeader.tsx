import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerHeaderProps {
  customerName: string;
  onLogout: () => void;
}

export const CustomerHeader = ({ customerName, onLogout }: CustomerHeaderProps) => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/src/assets/handyhjelp-logo.png" 
            alt="HandyHjelp" 
            className="h-8 w-auto"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm md:text-base font-medium text-foreground">
            {customerName}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logg ut</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
