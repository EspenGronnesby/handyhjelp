import { useState } from 'react';
import { Pencil, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { ContactInfoEditModal } from './ContactInfoEditModal';

export const EditableContactInfo = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: address } = useEditableContent('kontakt-info', 'address');
  const { content: phone } = useEditableContent('kontakt-info', 'phone');
  const { content: email } = useEditableContent('kontakt-info', 'email');
  const { content: hours } = useEditableContent('kontakt-info', 'hours');
  const { content: responseTime } = useEditableContent('kontakt-info', 'response_time');

  const defaultData = {
    address: address || 'Ægirsvei 3, Kristiansand',
    phone: phone || '+47 41250553',
    email: email || 'Team@handyhjelp.no',
    hours: hours || 'Mandag - Fredag: 09:00 - 17:00',
    responseTime: responseTime || 'Responstid: 1-3 virkedager'
  };

  return (
    <>
      <div className="relative space-y-4">
        {/* Edit icon */}
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-0 right-0 z-10 bg-white rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}

        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold">Adresse</p>
            <a 
              href="https://www.google.com/maps/place/Ægirsvei+3,+Kristiansand" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {defaultData.address}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold">Telefon</p>
            <a href={`tel:${defaultData.phone.replace(/\s/g, '')}`} className="text-primary hover:underline">
              {defaultData.phone}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold">E-post</p>
            <a href={`mailto:${defaultData.email}`} className="text-primary hover:underline">
              {defaultData.email}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold">Åpningstider</p>
            <p className="text-muted-foreground">{defaultData.hours}</p>
            <p className="text-muted-foreground text-sm">{defaultData.responseTime}</p>
          </div>
        </div>
      </div>

      <ContactInfoEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentData={defaultData}
      />
    </>
  );
};
