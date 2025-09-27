import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export const GoogleAnalytics = ({ measurementId = 'G-XXXXXXXXXX' }: GoogleAnalyticsProps) => {
  useEffect(() => {
    // Only load in production or when measurement ID is provided
    if (process.env.NODE_ENV !== 'production' && measurementId === 'G-XXXXXXXXXX') {
      return;
    }

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        page_title: document.title,
        page_location: window.location.href
      });
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [measurementId]);

  return null;
};

// Analytics event tracking helper
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

// Common event trackers for caretaker services
export const trackQuoteRequest = () => {
  trackEvent('quote_request', {
    event_category: 'lead_generation',
    event_label: 'property_caretaker_quote'
  });
};

export const trackServiceInquiry = (serviceType: string) => {
  trackEvent('service_inquiry', {
    event_category: 'engagement',
    event_label: serviceType,
    service_type: serviceType
  });
};

export const trackPhoneCall = () => {
  trackEvent('phone_call', {
    event_category: 'contact',
    event_label: 'header_phone_click'
  });
};

export const trackEmailClick = () => {
  trackEvent('email_click', {
    event_category: 'contact',
    event_label: 'header_email_click'
  });
};