import { useEditableContent } from '@/hooks/useEditableContent';

const DEFAULT_PHONE = '+47 48122206';
const DEFAULT_EMAIL = 'Team@handyhjelp.no';
const DEFAULT_ADDRESS = 'Ægirsvei 3, Kristiansand';
const DEFAULT_HOURS = 'Mandag - Fredag: 09:00 - 17:00';
const DEFAULT_RESPONSE_TIME = 'Responstid: 1-3 virkedager';

export const useContactInfo = () => {
  const { content: phoneRaw, isLoading: phoneLoading } = useEditableContent('kontakt-info', 'phone');
  const { content: emailRaw, isLoading: emailLoading } = useEditableContent('kontakt-info', 'email');
  const { content: addressRaw } = useEditableContent('kontakt-info', 'address');
  const { content: hoursRaw } = useEditableContent('kontakt-info', 'hours');
  const { content: responseTimeRaw } = useEditableContent('kontakt-info', 'response_time');

  const phone = phoneRaw || DEFAULT_PHONE;
  const email = emailRaw || DEFAULT_EMAIL;
  const address = addressRaw || DEFAULT_ADDRESS;
  const hours = hoursRaw || DEFAULT_HOURS;
  const responseTime = responseTimeRaw || DEFAULT_RESPONSE_TIME;

  const phoneHref = `tel:${phone.replace(/\s/g, '')}`;
  const emailHref = `mailto:${email}`;

  return {
    phone,
    email,
    address,
    hours,
    responseTime,
    phoneHref,
    emailHref,
    isLoading: phoneLoading || emailLoading,
  };
};
