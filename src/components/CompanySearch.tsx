import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Search, Building, MapPin, Loader2, CheckCircle } from "lucide-react";

interface Company {
  orgNumber: string;
  name: string;
  organizationForm: string;
  address: string;
  postalCode: string;
  city: string;
}

interface CompanySearchProps {
  onCompanySelect: (company: Company | null) => void;
  selectedCompany?: Company | null;
  disabled?: boolean;
}

export const CompanySearch = ({ onCompanySelect, selectedCompany, disabled = false }: CompanySearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<'orgNumber' | 'name'>('orgNumber');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [showResults, setShowResults] = useState(false);

  const searchCompanies = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchMessage("Skriv minst 2 tegn for å søke");
      return;
    }

    setIsSearching(true);
    setSearchMessage("");
    setCompanies([]);

    try {
      const { data, error } = await supabase.functions.invoke('company-search', {
        body: {
          query: searchQuery.trim(),
          type: searchType
        }
      });

      if (error) {
        console.error('Company search error:', error);
        setSearchMessage("Feil ved søk. Prøv igjen senere.");
        return;
      }

      if (data?.companies) {
        setCompanies(data.companies);
        setShowResults(true);
        
        if (data.companies.length === 0) {
          setSearchMessage(data.message || "Ingen bedrifter funnet");
        } else {
          setSearchMessage(`Fant ${data.companies.length} bedrift${data.companies.length > 1 ? 'er' : ''}`);
        }
      }

    } catch (error) {
      console.error('Company search error:', error);
      setSearchMessage("Feil ved søk. Prøv igjen senere.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCompanies();
  };

  const handleCompanySelect = (company: Company) => {
    onCompanySelect(company);
    setShowResults(false);
    setSearchQuery("");
    setSearchMessage(`Valgt: ${company.name}`);
  };

  const formatOrgNumber = (orgNumber: string) => {
    return orgNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  // Auto-search when switching to org number and query looks like org number
  useEffect(() => {
    if (searchType === 'orgNumber' && /^\d{9}$/.test(searchQuery.replace(/\s/g, ''))) {
      searchCompanies();
    }
  }, [searchQuery, searchType]);

  if (selectedCompany) {
    return (
      <Card className="p-4 bg-success/5 border-success/20">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-success mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{selectedCompany.name}</h4>
            <p className="text-sm text-muted-foreground">
              Org.nr: {formatOrgNumber(selectedCompany.orgNumber)}
            </p>
            {selectedCompany.organizationForm && (
              <p className="text-sm text-muted-foreground">{selectedCompany.organizationForm}</p>
            )}
            {selectedCompany.address && (
              <p className="text-sm text-muted-foreground">
                {selectedCompany.address}, {selectedCompany.postalCode} {selectedCompany.city}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onCompanySelect(null);
              setSearchMessage("");
              setShowResults(false);
            }}
            disabled={disabled}
          >
            Endre
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Finn din bedrift</Label>
      
      <div className="flex gap-2 mb-3">
        <Button
          type="button"
          variant={searchType === 'orgNumber' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSearchType('orgNumber');
            setShowResults(false);
            setSearchMessage("");
          }}
          disabled={disabled}
        >
          Org.nummer
        </Button>
        <Button
          type="button"
          variant={searchType === 'name' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSearchType('name');
            setShowResults(false);
            setSearchMessage("");
          }}
          disabled={disabled}
        >
          Bedriftsnavn
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchType === 'orgNumber' ? "Skriv organisasjonsnummer..." : "Skriv bedriftsnavn..."}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              let value = e.target.value;
              if (searchType === 'orgNumber') {
                // Allow only digits and spaces, max 11 chars (formatted: XXX XXX XXX)
                value = value.replace(/[^\d\s]/g, '').substring(0, 11);
                // Auto-format as user types
                if (value.replace(/\s/g, '').length <= 9) {
                  value = value.replace(/\s/g, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3').trim();
                }
              }
              setSearchQuery(value);
              setShowResults(false);
            }}
            maxLength={searchType === 'orgNumber' ? 11 : 100}
            disabled={disabled}
          />
        </div>
        <Button type="submit" disabled={isSearching || disabled}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {searchMessage && (
        <p className="text-sm text-muted-foreground text-center">
          {searchMessage}
        </p>
      )}

      {showResults && companies.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {companies.map((company, index) => (
            <Card
              key={`${company.orgNumber}-${index}`}
              className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleCompanySelect(company)}
            >
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{company.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Org.nr: {formatOrgNumber(company.orgNumber)}
                  </p>
                  {company.organizationForm && (
                    <p className="text-xs text-muted-foreground">{company.organizationForm}</p>
                  )}
                  {company.address && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {company.address}, {company.postalCode} {company.city}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};