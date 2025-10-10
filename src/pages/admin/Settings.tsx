import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useQueryClient } from '@tanstack/react-query';

interface SiteSettings {
  id: string;
  maintenance_mode: boolean;
  site_title: string;
  logo_url: string | null;
  favicon_url: string | null;
}

export default function Settings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          maintenance_mode: settings.maintenance_mode,
          site_title: settings.site_title,
          logo_url: settings.logo_url,
          favicon_url: settings.favicon_url,
        })
        .eq('id', settings.id);

      if (error) throw error;

      // Invalidate site settings cache to reflect changes immediately
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your website configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
          <CardDescription>
            Enable maintenance mode to show a maintenance page to all visitors except admins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, non-admin users will see a maintenance page
              </p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, maintenance_mode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Site Branding</CardTitle>
          <CardDescription>
            Customize your site's appearance with logos and title
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-title">Site Title</Label>
            <Input
              id="site-title"
              value={settings.site_title}
              onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
              placeholder="Premium Car Dealership"
            />
            <p className="text-xs text-muted-foreground">
              This appears in the browser tab and search results
            </p>
          </div>

          <ImageUploader
            label="Logo (Navbar & Footer)"
            value={settings.logo_url || ''}
            onChange={(url) => setSettings({ ...settings, logo_url: url })}
            path="branding"
          />

          <ImageUploader
            label="Favicon (Browser Tab Icon)"
            value={settings.favicon_url || ''}
            onChange={(url) => setSettings({ ...settings, favicon_url: url })}
            path="branding"
            accept="image/png,image/x-icon,image/svg+xml"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}