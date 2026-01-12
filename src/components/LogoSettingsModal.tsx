import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { LogoSettings } from '@/hooks/useLogoSettings';

interface LogoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LogoSettings;
  onSave: (settings: LogoSettings) => Promise<boolean>;
}

export const LogoSettingsModal = ({
  isOpen,
  onClose,
  settings,
  onSave,
}: LogoSettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState<LogoSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave(localSettings);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  const updateSetting = (key: keyof LogoSettings, value: number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Logo-innstillinger</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mobile Settings */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4" />
              <span>Mobil</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Høyde</Label>
                <span className="text-xs font-mono">{localSettings.mobileHeight}px</span>
              </div>
              <Slider
                value={[localSettings.mobileHeight]}
                onValueChange={([value]) => updateSetting('mobileHeight', value)}
                min={24}
                max={80}
                step={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Padding</Label>
                <span className="text-xs font-mono">{localSettings.mobilePadding}px</span>
              </div>
              <Slider
                value={[localSettings.mobilePadding]}
                onValueChange={([value]) => updateSetting('mobilePadding', value)}
                min={0}
                max={32}
                step={2}
              />
            </div>
          </div>

          {/* Tablet Settings */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Tablet className="h-4 w-4" />
              <span>Nettbrett</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Høyde</Label>
                <span className="text-xs font-mono">{localSettings.tabletHeight}px</span>
              </div>
              <Slider
                value={[localSettings.tabletHeight]}
                onValueChange={([value]) => updateSetting('tabletHeight', value)}
                min={32}
                max={100}
                step={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Padding</Label>
                <span className="text-xs font-mono">{localSettings.tabletPadding}px</span>
              </div>
              <Slider
                value={[localSettings.tabletPadding]}
                onValueChange={([value]) => updateSetting('tabletPadding', value)}
                min={0}
                max={40}
                step={2}
              />
            </div>
          </div>

          {/* Desktop Settings */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Monitor className="h-4 w-4" />
              <span>Desktop</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Høyde</Label>
                <span className="text-xs font-mono">{localSettings.desktopHeight}px</span>
              </div>
              <Slider
                value={[localSettings.desktopHeight]}
                onValueChange={([value]) => updateSetting('desktopHeight', value)}
                min={40}
                max={120}
                step={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Padding</Label>
                <span className="text-xs font-mono">{localSettings.desktopPadding}px</span>
              </div>
              <Slider
                value={[localSettings.desktopPadding]}
                onValueChange={([value]) => updateSetting('desktopPadding', value)}
                min={0}
                max={48}
                step={2}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Lagrer...' : 'Lagre'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
