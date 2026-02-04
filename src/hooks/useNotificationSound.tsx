import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Simple beep using Web Audio API (no external file needed)
function createBeep(): () => void {
  return () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      if (import.meta.env.DEV) console.log('Could not play notification beep:', error);
    }
  };
}

export function useNotificationSound() {
  const { user } = useAuth();
  const permissionRequested = useRef(false);
  const playBeep = useRef(createBeep());

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (permissionRequested.current) return;
    
    if ('Notification' in window && Notification.permission === 'default') {
      permissionRequested.current = true;
      try {
        await Notification.requestPermission();
      } catch (error) {
        if (import.meta.env.DEV) console.log('Notification permission request failed:', error);
      }
    }
  }, []);

  // Play notification sound using Web Audio API
  const playSound = useCallback(() => {
    playBeep.current();
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/lovable-uploads/1269f51d-725a-4c46-a6aa-cad9053d1c73.png',
          badge: '/lovable-uploads/1269f51d-725a-4c46-a6aa-cad9053d1c73.png',
        });
      } catch (error) {
        if (import.meta.env.DEV) console.log('Could not show notification:', error);
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
