import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface HomeSection {
  id?: string;
  section_type: string;
  title: string;
  description: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  status: string;
}

export default function HomeManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('hero');

  const { data: sections, isLoading } = useQuery({
    queryKey: ['home-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (section: HomeSection) => {
      if (section.id) {
        const { error } = await supabase
          .from('home_content')
          .update(section)
          .eq('id', section.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_content')
          .insert(section);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-content'] });
      toast({ title: 'Success', description: 'Content saved successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const getSection = (type: string) => {
    return sections?.find(s => s.section_type === type) || {
      section_type: type,
      title: '',
      description: '',
      status: 'active'
    };
  };

  const SectionForm = ({ sectionType }: { sectionType: string }) => {
    const section = getSection(sectionType);
    const [formData, setFormData] = useState<HomeSection>(section as HomeSection);

    const handleSave = () => {
      saveMutation.mutate(formData);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{sectionType} Section</CardTitle>
          <CardDescription>Manage the {sectionType} section content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <RichTextEditor
              value={formData.title || ''}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="Enter title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              value={formData.description || ''}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Enter description..."
            />
          </div>

          <ImageUploader
            label="Background Image"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
          />

          {sectionType === 'hero' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="button_text">Button Text</Label>
                <Input
                  id="button_text"
                  value={formData.button_text || ''}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="View Our Collection"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_link">Button Link</Label>
                <Input
                  id="button_link"
                  value={formData.button_link || ''}
                  onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                  placeholder="/cars"
                />
              </div>
            </>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === 'active'}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
              }
            />
            <Label htmlFor="status">Active</Label>
          </div>

          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Home Page Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage the content displayed on your home page
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="cta">Call to Action</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <SectionForm sectionType="hero" />
        </TabsContent>

        <TabsContent value="about">
          <SectionForm sectionType="about" />
        </TabsContent>

        <TabsContent value="cta">
          <SectionForm sectionType="cta" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
