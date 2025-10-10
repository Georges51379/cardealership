import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AboutManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('hero');

  const { data: sections, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_content')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (section: any) => {
      if (section.id) {
        const { error } = await supabase
          .from('about_content')
          .update(section)
          .eq('id', section.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('about_content')
          .insert(section);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-content'] });
      toast({ title: 'Success', description: 'Content saved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const getSection = (type: string) => {
    return sections?.find(s => s.section_type === type) || {
      section_type: type,
      content: {},
      status: 'active'
    };
  };

  const SectionForm = ({ sectionType }: { sectionType: string }) => {
    const section = getSection(sectionType);
    const content = (section.content || {}) as { title?: string; description?: string; image_url?: string };
    const [formData, setFormData] = useState({
      ...section,
      content: {
        title: content.title || '',
        description: content.description || '',
        image_url: content.image_url || ''
      }
    });

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
            <Label>Title</Label>
            <RichTextEditor
              value={formData.content.title}
              onChange={(value) => setFormData({
                ...formData,
                content: { ...formData.content, title: value }
              })}
              placeholder="Enter title..."
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor
              value={formData.content.description}
              onChange={(value) => setFormData({
                ...formData,
                content: { ...formData.content, description: value }
              })}
              placeholder="Enter description..."
            />
          </div>

          <ImageUploader
            label="Section Image"
            value={formData.content.image_url}
            onChange={(url) => setFormData({
              ...formData,
              content: { ...formData.content, image_url: url }
            })}
          />

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
        <h1 className="text-3xl font-bold">About Page Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage the content displayed on your about page
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="story">Our Story</TabsTrigger>
          <TabsTrigger value="mission">Mission</TabsTrigger>
          <TabsTrigger value="vision">Vision</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <SectionForm sectionType="hero" />
        </TabsContent>

        <TabsContent value="story">
          <SectionForm sectionType="story" />
        </TabsContent>

        <TabsContent value="mission">
          <SectionForm sectionType="mission" />
        </TabsContent>

        <TabsContent value="vision">
          <SectionForm sectionType="vision" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
