import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EditModeContextType {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  isAdmin: boolean; // Legacy - true for platform_owner
  isPlatformOwner: boolean;
  isTenantAdmin: boolean;
  canEditSite: boolean; // Only platform_owner can edit site content
}

const EditModeContext = createContext<EditModeContextType>({
  editMode: false,
  setEditMode: () => {},
  isAdmin: false,
  isPlatformOwner: false,
  isTenantAdmin: false,
  canEditSite: false,
});

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const [editMode, setEditModeState] = useState(false);
  const { user } = useAuth();
  const [isPlatformOwner, setIsPlatformOwner] = useState(false);
  const [isTenantAdmin, setIsTenantAdmin] = useState(false);
  const [isLegacyAdmin, setIsLegacyAdmin] = useState(false);

  useEffect(() => {
    const checkRolesAndEditMode = async () => {
      if (!user) {
        setIsPlatformOwner(false);
        setIsTenantAdmin(false);
        setIsLegacyAdmin(false);
        setEditModeState(false);
        return;
      }

      try {
        // Fetch all roles for the user
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error checking roles:', rolesError);
          setIsPlatformOwner(false);
          setIsTenantAdmin(false);
          setIsLegacyAdmin(false);
          setEditModeState(false);
          return;
        }

        const roles = (rolesData || []).map(r => r.role);
        const userIsPlatformOwner = roles.includes('platform_owner');
        const userIsTenantAdmin = roles.includes('tenant_admin');
        const userIsLegacyAdmin = roles.includes('admin');

        setIsPlatformOwner(userIsPlatformOwner);
        setIsTenantAdmin(userIsTenantAdmin);
        setIsLegacyAdmin(userIsLegacyAdmin || userIsPlatformOwner);

        // Only platform_owner can use edit mode
        if (userIsPlatformOwner) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('edit_mode_enabled')
            .eq('id', user.id)
            .single();

          setEditModeState(profileData?.edit_mode_enabled || false);
        } else {
          setEditModeState(false);
        }
      } catch (error) {
        console.error('Error in checkRolesAndEditMode:', error);
        setIsPlatformOwner(false);
        setIsTenantAdmin(false);
        setIsLegacyAdmin(false);
        setEditModeState(false);
      }
    };

    checkRolesAndEditMode();
  }, [user]);

  const setEditMode = async (value: boolean) => {
    // Only platform_owner can toggle edit mode
    if (!user || !isPlatformOwner) return;

    setEditModeState(value);

    try {
      await supabase
        .from('profiles')
        .update({ edit_mode_enabled: value })
        .eq('id', user.id);

      localStorage.setItem('editMode', JSON.stringify(value));
    } catch (error) {
      console.error('Error updating edit mode:', error);
    }
  };

  // canEditSite is true only for platform_owner with editMode enabled
  const canEditSite = isPlatformOwner && editMode;

  return (
    <EditModeContext.Provider value={{ 
      editMode, 
      setEditMode, 
      isAdmin: isLegacyAdmin || isPlatformOwner,
      isPlatformOwner,
      isTenantAdmin,
      canEditSite,
    }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => useContext(EditModeContext);
