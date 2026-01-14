import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useNotificationSound() {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const permissionRequested = useRef(false);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (permissionRequested.current) return;
    
    if ('Notification' in window && Notification.permission === 'default') {
      permissionRequested.current = true;
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.log('Notification permission request failed:', error);
      }
    }
  }, []);

  // Play notification sound
  const playSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/notification-sound.mp3');
      audioRef.current.volume = 0.5;
    }
    
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((error) => {
      console.log('Could not play notification sound:', error);
    });
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch (error) {
        console.log('Could not show notification:', error);
      }
    }
  }, []);

  useEffect(() => {
    requestPermission();

    if (!user) return;

    const channel = supabase
      .channel('notification-alerts')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          const newNotification = payload.new as { title: string; message: string };
          
          // Play sound
          playSound();
          
          // Show browser notification
          showBrowserNotification(newNotification.title, newNotification.message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, requestPermission, playSound, showBrowserNotification]);
}
