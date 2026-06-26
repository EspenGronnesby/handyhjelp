import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

const ENV_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined) || '';

export const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  const id = measurementId || ENV_ID;

  useEffect(() => {
    // Only load when a real measurement ID is configured
    if (!id || id.startsWith('G-XXXX')) return;

    // Avoid double-injecting if a different instance already mounted
    if (document.querySelector(`script[data-ga-id="${id}"]`)) return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script1.dataset.gaId = id;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.dataset.gaId = id;
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${id}', {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true
      });
    `;
    document.head.appendChild(script2);
    // Keep scripts mounted across page navigations
  }, [id]);

  return null;
};

// Analytics event tracking helper
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

// Re-export the richer trackers from the analytics hook for convenience
export { trackConversion, trackCTAClick, trackPageView } from '@/hooks/useAnalytics';

// Legacy convenience trackers (kept for compatibility)
export const trackQuoteRequest = () => {
  trackEvent('quote_request', {
    event_category: 'lead_generation',
    event_label: 'property_caretaker_quote',
  });
};

export const trackServiceInquiry = (serviceType: string) => {
  trackEvent('service_inquiry', {
    event_category: 'engagement',
    event_label: serviceType,
    service_type: serviceType,
  });
};

export const trackPhoneCall = () => {
  trackEvent('phone_call', {
    event_category: 'contact',
    event_label: 'header_phone_click',
  });
};

export const trackEmailClick = () => {
  trackEvent('email_click', {
    event_category: 'contact',
    event_label: 'header_email_click',
  });
};
