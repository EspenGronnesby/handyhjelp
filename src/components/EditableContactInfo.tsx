import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useContactInfo } from '@/hooks/useContactInfo';
import { ContactInfoEditModal } from './ContactInfoEditModal';
import { EditButton } from './ui/EditButton';

export const EditableContactInfo = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { address, phone, email, hours, responseTime, phoneHref, emailHref } = useContactInfo();

  const defaultData = { address, phone, email, hours, responseTime };

  return (
    <>
      <div className="relative space-y-4">
        {/* Edit icon */}
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
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
            <a href={phoneHref} className="text-primary hover:underline">
              {phone}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold">E-post</p>
            <a href={emailHref} className="text-primary hover:underline">
              {email}
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
