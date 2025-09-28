import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompanySearchRequest {
  query: string;
  type: 'orgNumber' | 'name';
}

interface BrrregCompany {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform?: {
    kode: string;
    beskrivelse: string;
  };
  postadresse?: {
    adresse: string[];
    postnummer: string;
    poststed: string;
  };
  forretningsadresse?: {
    adresse: string[];
    postnummer: string;
    poststed: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { query, type }: CompanySearchRequest = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`Searching Brønnøysundregistrene for: ${query} (type: ${type})`);

    let searchUrl: string;
    
    if (type === 'orgNumber') {
      // Clean organization number (remove spaces)
      const cleanOrgNumber = query.replace(/\s/g, '');
      if (!/^\d{9}$/.test(cleanOrgNumber)) {
        return new Response(
          JSON.stringify({ error: 'Invalid organization number format' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      // Direct lookup by organization number
      searchUrl = `https://data.brreg.no/enhetsregisteret/api/enheter/${cleanOrgNumber}`;
    } else {
      // Search by name
      const encodedQuery = encodeURIComponent(query);
      searchUrl = `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodedQuery}&size=10`;
    }

    console.log(`Calling Brønnøysundregistrene API: ${searchUrl}`);

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Handyhjelp-Website/1.0'
      },
    });

    if (!response.ok) {
      if (response.status === 404 && type === 'orgNumber') {
        return new Response(
          JSON.stringify({ companies: [], message: 'Ingen bedrift funnet med dette organisasjonsnummeret' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      
      console.error(`Brønnøysundregistrene API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to search company registry' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const data = await response.json();
    let companies: BrrregCompany[] = [];

    if (type === 'orgNumber') {
      // Single company result
      companies = [data as BrrregCompany];
    } else {
      // Multiple companies result
      companies = data._embedded?.enheter || [];
    }

    // Format the results for frontend
    const formattedCompanies = companies.map((company: BrrregCompany) => ({
      orgNumber: company.organisasjonsnummer,
      name: company.navn,
      organizationForm: company.organisasjonsform?.beskrivelse || '',
      address: company.forretningsadresse?.adresse?.join(', ') || 
               company.postadresse?.adresse?.join(', ') || '',
      postalCode: company.forretningsadresse?.postnummer || 
                  company.postadresse?.postnummer || '',
      city: company.forretningsadresse?.poststed || 
            company.postadresse?.poststed || ''
    }));

    console.log(`Found ${formattedCompanies.length} companies`);

    return new Response(
      JSON.stringify({ 
        companies: formattedCompanies,
        message: formattedCompanies.length === 0 ? 'Ingen bedrifter funnet' : undefined
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Company search error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);