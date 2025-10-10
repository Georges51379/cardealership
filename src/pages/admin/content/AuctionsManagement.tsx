import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Eye, Trash, Crown, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

export default function AuctionsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [viewBidsAuction, setViewBidsAuction] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [loading, setLoading] = useState(false);

  const { data: auctions, isLoading } = useQuery({
    queryKey: ['admin-auctions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('auctions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch winner info (highest bid) for each closed auction
  const { data: winners } = useQuery({
    queryKey: ['auction-winners'],
    enabled: auctions?.some(a => a.status === 'closed') ?? false,
    queryFn: async () => {
      const closedAuctions = auctions?.filter(a => a.status === 'closed') || [];
      const winnersMap: Record<string, any> = {};
      
      for (const auction of closedAuctions) {
        const { data } = await supabase
          .from('bids')
          .select('*')
          .eq('auction_id', auction.id)
          .order('bid_amount', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (data) {
          winnersMap[auction.id] = data;
        }
      }
      
      return winnersMap;
    }
  });

  const { data: bids } = useQuery({
    queryKey: ['auction-bids', viewBidsAuction?.id],
    enabled: !!viewBidsAuction,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', viewBidsAuction.id)
        .order('bid_amount', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (selectedAuction) {
        const { error } = await supabase
          .from('auctions')
          .update(formData)
          .eq('id', selectedAuction.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('auctions')
          .insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-auctions'] });
      toast({ title: 'Success', description: 'Auction saved successfully' });
      setIsDialogOpen(false);
      setSelectedAuction(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('auctions')
        .update({ status: 'inactive' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-auctions'] });
      toast({ title: 'Success', description: 'Auction deleted successfully' });
    }
  });

  const closeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('auctions')
        .update({ status: 'closed' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['auction-winners'] });
      toast({ title: 'Success', description: 'Auction closed successfully' });
    }
  });

  const filteredAuctions = auctions || [];

  const AuctionForm = () => {
    const [formData, setFormData] = useState(selectedAuction || {
      car_name: '',
      description: '',
      current_bid: 0,
      image_url: '',
      end_time: '',
      status: 'active'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="car_name">Car Name</Label>
          <Input
            id="car_name"
            value={formData.car_name}
            onChange={(e) => setFormData({ ...formData, car_name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_bid">Starting Bid ($)</Label>
          <Input
            id="current_bid"
            type="number"
            value={formData.current_bid}
            onChange={(e) => setFormData({ ...formData, current_bid: parseFloat(e.target.value) })}
            required
          />
        </div>

        <ImageUploader
          label="Auction Image"
          value={formData.image_url}
          onChange={(url) => setFormData({ ...formData, image_url: url })}
        />

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={formData.end_time ? format(new Date(formData.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) => setFormData({ ...formData, end_time: new Date(e.target.value).toISOString() })}
            required
          />
        </div>

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Auction
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Auctions Management</h1>
          <p className="text-muted-foreground mt-2">Manage car auctions, bids, and winners</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                setLoading(true);
                const { data, error } = await supabase.functions.invoke('auction-manager');
                if (error) throw error;
                toast({
                  title: "Success",
                  description: `Processed ${data.processed} ended auction(s)`,
                });
                queryClient.invalidateQueries({ queryKey: ["admin-auctions"] });
              } catch (error) {
                console.error('Error closing auctions:', error);
                toast({
                  title: "Error",
                  description: "Failed to close auctions",
                  variant: "destructive",
                });
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Clock className="mr-2 h-4 w-4" />
            )}
            Close Ended Auctions Now
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedAuction(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Auction
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedAuction ? 'Edit Auction' : 'Add New Auction'}</DialogTitle>
            </DialogHeader>
            <AuctionForm />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All Auctions</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Car Name</TableHead>
                    <TableHead>Current Bid</TableHead>
                    <TableHead>Total Bids</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Winner</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuctions.map((auction) => {
                    const winner = winners?.[auction.id];
                    return (
                      <TableRow key={auction.id}>
                        <TableCell>
                          {auction.image_url && (
                            <img src={auction.image_url} alt={auction.car_name} className="w-16 h-16 object-cover rounded" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(auction.car_name, { ALLOWED_TAGS: [] }) 
                          }} />
                        </TableCell>
                        <TableCell>${auction.current_bid.toLocaleString()}</TableCell>
                        <TableCell>{auction.total_bids}</TableCell>
                        <TableCell>{format(new Date(auction.end_time), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            auction.status === 'active' ? 'bg-green-100 text-green-800' : 
                            auction.status === 'closed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {auction.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {auction.status === 'closed' && winner ? (
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-yellow-500" />
                              <div className="text-sm">
                                <div 
                                  className="font-semibold"
                                  dangerouslySetInnerHTML={{ 
                                    __html: DOMPurify.sanitize(winner.bidder_name, { ALLOWED_TAGS: [] }) 
                                  }}
                                />
                                <div className="text-muted-foreground">${winner.bid_amount.toLocaleString()}</div>
                              </div>
                            </div>
                          ) : auction.status === 'closed' ? (
                            <span className="text-sm text-muted-foreground">No bids</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAuction(auction);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewBidsAuction(auction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {auction.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Close this auction now?')) {
                                    closeMutation.mutate(auction.id);
                                  }
                                }}
                                title="Close Auction"
                              >
                                <Crown className="h-4 w-4" />
                              </Button>
                            )}
                            {auction.status === 'closed' && winner && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.location.href = `mailto:${winner.bidder_email}`}
                                title="Email Winner"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(auction.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewBidsAuction} onOpenChange={() => setViewBidsAuction(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bids for {viewBidsAuction?.car_name}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bidder Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bid Amount</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids?.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>
                    <div dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(bid.bidder_name, { ALLOWED_TAGS: [] }) 
                    }} />
                  </TableCell>
                  <TableCell>{bid.bidder_email}</TableCell>
                  <TableCell>${bid.bid_amount.toLocaleString()}</TableCell>
                  <TableCell>{format(new Date(bid.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
