import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EditModeContextType {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  isAdmin: boolean;
}

const EditModeContext = createContext<EditModeContextType>({
  editMode: false,
  setEditMode: () => {},
  isAdmin: false
});

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const [editMode, setEditModeState] = useState(false);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndEditMode = async () => {
      if (!user) {
        setIsAdmin(false);
        setEditModeState(false);
        return;
      }

      try {
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError) {
          console.error('Error checking admin role:', roleError);
          setIsAdmin(false);
          setEditModeState(false);
          return;
        }

        const userIsAdmin = !!roleData;
        setIsAdmin(userIsAdmin);

        if (userIsAdmin) {
          // Fetch edit mode status from profile
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
        console.error('Error in checkAdminAndEditMode:', error);
        setIsAdmin(false);
        setEditModeState(false);
      }
    };

    checkAdminAndEditMode();
  }, [user]);

  const setEditMode = async (value: boolean) => {
    if (!user || !isAdmin) return;

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

  return (
    <EditModeContext.Provider value={{ editMode, setEditMode, isAdmin }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => useContext(EditModeContext);
