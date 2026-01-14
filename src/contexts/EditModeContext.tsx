import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EditModeContextType {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  isOwner: boolean;       // Only owner can use edit mode
  isAdmin: boolean;       // Admin access (owner always has this)
  canEditSite: boolean;   // Only owner with editMode enabled
}

const EditModeContext = createContext<EditModeContextType>({
  editMode: false,
  setEditMode: () => {},
  isOwner: false,
  isAdmin: false,
  canEditSite: false,
});

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const [editMode, setEditModeState] = useState(false);
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRolesAndEditMode = async () => {
      if (!user) {
        setIsOwner(false);
        setIsAdmin(false);
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
          setIsOwner(false);
          setIsAdmin(false);
          setEditModeState(false);
          return;
        }

        const roles = (rolesData || []).map(r => r.role);
        const userIsOwner = roles.includes('platform_owner');
        const userIsAdmin = roles.includes('admin') || userIsOwner;

        setIsOwner(userIsOwner);
        setIsAdmin(userIsAdmin);

        // Only owner can use edit mode
        if (userIsOwner) {
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
        setIsOwner(false);
        setIsAdmin(false);
        setEditModeState(false);
      }
    };

    checkRolesAndEditMode();
  }, [user]);

  const setEditMode = async (value: boolean) => {
    // Only owner can toggle edit mode
    if (!user || !isOwner) return;

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

  // canEditSite is true only for owner with editMode enabled
  const canEditSite = isOwner && editMode;

  return (
    <EditModeContext.Provider value={{ 
      editMode, 
      setEditMode, 
      isOwner,
      isAdmin,
      canEditSite,
    }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => useContext(EditModeContext);
