import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const FUNCTION_NAME = "company-search";

// Structured logging utility
const log = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: "INFO",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: "ERROR",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      ...data
    }));
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(JSON.stringify({
      level: "WARN",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Error response helper
const errorResponse = (message: string, status: number, requestId: string, details?: unknown) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: details instanceof Error ? details.message : details,
      requestId,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
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
  const requestId = crypto.randomUUID();

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  log.info("Request received", { requestId, method: req.method });

  if (req.method !== 'POST') {
    log.warn("Invalid request method", { requestId, method: req.method });
    return errorResponse('Method not allowed', 405, requestId);
  }

  let requestData: CompanySearchRequest;

  try {
    requestData = await req.json();
  } catch (parseError) {
    log.error("Failed to parse request body", parseError, { requestId });
    return errorResponse("Invalid JSON in request body", 400, requestId);
  }

  const { query, type } = requestData;

  if (!query || query.trim().length < 2) {
    log.warn("Query too short", { requestId, queryLength: query?.length });
    return errorResponse('Query must be at least 2 characters', 400, requestId);
  }

  log.info("Searching Brønnøysundregistrene", { requestId, query, type });

  try {
    let searchUrl: string;
    
    if (type === 'orgNumber') {
      const cleanOrgNumber = query.replace(/\s/g, '');
      if (!/^\d{9}$/.test(cleanOrgNumber)) {
        log.warn("Invalid organization number format", { requestId, query });
        return errorResponse('Invalid organization number format (must be 9 digits)', 400, requestId);
      }
      searchUrl = `https://data.brreg.no/enhetsregisteret/api/enheter/${cleanOrgNumber}`;
    } else {
      const encodedQuery = encodeURIComponent(query);
      searchUrl = `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodedQuery}&size=10`;
    }

    log.info("Calling Brønnøysundregistrene API", { requestId, searchUrl });

    const startTime = Date.now();
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Handyhjelp-Website/1.0'
      },
    });
    const responseTime = Date.now() - startTime;

    log.info("API response received", { 
      requestId, 
      status: response.status, 
      responseTimeMs: responseTime 
    });

    if (!response.ok) {
      if (response.status === 404 && type === 'orgNumber') {
        log.info("No company found with org number", { requestId, query });
        return new Response(
          JSON.stringify({ 
            companies: [], 
            message: 'Ingen bedrift funnet med dette organisasjonsnummeret',
            requestId 
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      
      log.error("Brønnøysundregistrene API error", null, { 
        requestId, 
        status: response.status, 
        statusText: response.statusText 
      });
      return errorResponse('Failed to search company registry', 502, requestId);
    }

    const data = await response.json();
    let companies: BrrregCompany[] = [];

    if (type === 'orgNumber') {
      companies = [data as BrrregCompany];
    } else {
      companies = data._embedded?.enheter || [];
    }

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

    log.info("Search completed successfully", { 
      requestId, 
      resultsCount: formattedCompanies.length 
    });

    return new Response(
      JSON.stringify({ 
        companies: formattedCompanies,
        message: formattedCompanies.length === 0 ? 'Ingen bedrifter funnet' : undefined,
        requestId
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    log.error('Company search failed', error, { requestId, query, type });
    return errorResponse('Internal server error', 500, requestId, error);
  }
};

serve(handler);
