import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEditMode } from '@/contexts/EditModeContext';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Eye } from 'lucide-react';

export const SiteEditingPanel = () => {
  const { editMode, setEditMode } = useEditMode();
  const { toast } = useToast();
  const [localEditMode, setLocalEditMode] = useState(editMode);

  useEffect(() => {
    setLocalEditMode(editMode);
  }, [editMode]);

  const handleToggle = async (checked: boolean) => {
    setLocalEditMode(checked);
    await setEditMode(checked);

    toast({
      title: checked ? "Redigeringsmodus aktivert" : "Redigeringsmodus deaktivert",
      description: checked 
        ? "Blyant-ikoner vises nå på nettsiden" 
        : "Nettsiden vises i normalmodus"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Nettstedredigering
        </CardTitle>
        <CardDescription>
          Rediger innhold direkte på nettsiden uten å bruke credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <div className="font-medium">Redigeringsmodus</div>
            <div className="text-sm text-muted-foreground">
              Aktiver for å vise redigeringsikoner
            </div>
          </div>
          <Switch
            checked={localEditMode}
            onCheckedChange={handleToggle}
          />
        </div>

        {localEditMode ? (
          <Alert className="bg-green-50 border-green-200">
            <Pencil className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Redigering aktivert - Blyant-ikoner vises på nettsiden
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              ℹ️ Redigering deaktivert - Nettsiden vises i normalmodus
            </AlertDescription>
          </Alert>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-900">
            <strong>💡 Slik fungerer det:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Aktiver redigeringsmodus med bryteren over</li>
              <li>Gå til nettsiden og hover over innhold du vil endre</li>
              <li>Klikk på blyant-ikonet som vises</li>
              <li>Rediger tekst, bilder eller farger direkte</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
