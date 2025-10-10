import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function ContactManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const { data: contactInfo, isLoading } = useQuery({
    queryKey: ['admin-contact-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .eq('status', 'active')
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: submissions } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (contactInfo?.id) {
        const { error } = await supabase
          .from('contact_info')
          .update(formData)
          .eq('id', contactInfo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_info')
          .insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-info'] });
      toast({ title: 'Success', description: 'Contact info saved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ read_status: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    }
  });

  const ContactInfoForm = () => {
    const [formData, setFormData] = useState(contactInfo || {
      address: '',
      phone_numbers: [] as Array<{ label: string; number: string }>,
      email_addresses: [] as Array<{ label: string; email: string }>,
      working_hours: '',
      map_embed_url: ''
    });

    const [newPhone, setNewPhone] = useState({ label: '', number: '' });
    const [newEmail, setNewEmail] = useState({ label: '', email: '' });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveMutation.mutate(formData);
    };

    const addPhone = () => {
      if (newPhone.label && newPhone.number) {
        const phones = (formData.phone_numbers || []) as Array<{ label: string; number: string }>;
        setFormData({
          ...formData,
          phone_numbers: [...phones, newPhone]
        });
        setNewPhone({ label: '', number: '' });
      }
    };

    const addEmail = () => {
      if (newEmail.label && newEmail.email) {
        const emails = (formData.email_addresses || []) as Array<{ label: string; email: string }>;
        setFormData({
          ...formData,
          email_addresses: [...emails, newEmail]
        });
        setNewEmail({ label: '', email: '' });
      }
    };

    const removePhone = (index: number) => {
      const phones = [...((formData.phone_numbers || []) as Array<{ label: string; number: string }>)];
      phones.splice(index, 1);
      setFormData({ ...formData, phone_numbers: phones });
    };

    const removeEmail = (index: number) => {
      const emails = [...((formData.email_addresses || []) as Array<{ label: string; email: string }>)];
      emails.splice(index, 1);
      setFormData({ ...formData, email_addresses: emails });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={formData.address || ''}
              onChange={(value) => setFormData({ ...formData, address: value })}
              placeholder="Enter address..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phone Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {((formData.phone_numbers || []) as Array<{ label: string; number: string }>).map((phone, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={phone.label} disabled className="flex-1" />
                <Input value={phone.number} disabled className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removePhone(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Label (e.g., Main Office)"
                value={newPhone.label}
                onChange={(e) => setNewPhone({ ...newPhone, label: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Phone Number"
                value={newPhone.number}
                onChange={(e) => setNewPhone({ ...newPhone, number: e.target.value })}
                className="flex-1"
              />
              <Button type="button" onClick={addPhone}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {((formData.email_addresses || []) as Array<{ label: string; email: string }>).map((email, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={email.label} disabled className="flex-1" />
                <Input value={email.email} disabled className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeEmail(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Label (e.g., General Inquiries)"
                value={newEmail.label}
                onChange={(e) => setNewEmail({ ...newEmail, label: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Email Address"
                value={newEmail.email}
                onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
                className="flex-1"
              />
              <Button type="button" onClick={addEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={formData.working_hours || ''}
              onChange={(value) => setFormData({ ...formData, working_hours: value })}
              placeholder="Enter working hours..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Maps Embed URL</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="https://www.google.com/maps/embed?pb=..."
              value={formData.map_embed_url || ''}
              onChange={(e) => setFormData({ ...formData, map_embed_url: e.target.value })}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
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
        <h1 className="text-3xl font-bold">Contact Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage contact information and submissions
        </p>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Contact Information</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions
            {submissions?.filter(s => !s.read_status).length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full">
                {submissions.filter(s => !s.read_status).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ContactInfoForm />
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Contact Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions?.map((submission) => (
                    <TableRow key={submission.id} className={!submission.read_status ? 'bg-muted/50' : ''}>
                      <TableCell>{format(new Date(submission.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{submission.name}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.subject}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          submission.read_status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.read_status ? 'Read' : 'Unread'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              if (!submission.read_status) {
                                markAsReadMutation.mutate({ id: submission.id, status: true });
                              }
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `mailto:${submission.email}`}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Name</Label>
                <p className="mt-1">{selectedSubmission.name}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Email</Label>
                <p className="mt-1">{selectedSubmission.email}</p>
              </div>
              {selectedSubmission.phone && (
                <div>
                  <Label className="text-sm font-semibold">Phone</Label>
                  <p className="mt-1">{selectedSubmission.phone}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-semibold">Subject</Label>
                <p className="mt-1">{selectedSubmission.subject}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Message</Label>
                <p className="mt-1 whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Submitted At</Label>
                <p className="mt-1">{format(new Date(selectedSubmission.created_at), 'PPpp')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
