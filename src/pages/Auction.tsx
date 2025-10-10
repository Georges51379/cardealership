import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Gavel, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import DOMPurify from "dompurify";

interface AuctionCar {
  id: string;
  car_name: string;
  current_bid: number;
  image_url: string;
  end_time: string;
  total_bids: number;
  status: string;
}

interface Bid {
  id: string;
  bidder_name: string;
  bid_amount: number;
  created_at: string;
}

// Zod validation schema
const createBidSchema = (minBid: number) => z.object({
  bidderName: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  bidderEmail: z.string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  bidAmount: z.number()
    .positive('Bid must be positive')
    .refine((val) => val >= minBid, {
      message: `Bid must be at least $${minBid.toLocaleString()}`
    })
});

// Anonymize names for display
const anonymizeName = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return `${parts[0][0]}***`;
  }
  return `${parts[0]} ${parts[1][0]}.`;
};

const AuctionCard = ({ car }: { car: AuctionCar }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidderName, setBidderName] = useState("");
  const [bidderEmail, setBidderEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const minBid = car.current_bid + 100;

  // Fetch recent bids for this auction
  const { data: recentBids } = useQuery({
    queryKey: ['recent-bids', car.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('bidder_name, bid_amount, created_at')
        .eq('auction_id', car.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Bid[];
    }
  });

  // Real-time subscription for auction updates
  useEffect(() => {
    const channel = supabase
      .channel(`auction-${car.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auctions',
          filter: `id=eq.${car.id}`
        },
        (payload) => {
          console.log('Auction updated:', payload);
          queryClient.invalidateQueries({ queryKey: ["auctions"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${car.id}`
        },
        (payload: any) => {
          console.log('New bid placed:', payload);
          queryClient.invalidateQueries({ queryKey: ["auctions"] });
          queryClient.invalidateQueries({ queryKey: ['recent-bids', car.id] });
          toast.info(`New bid: $${payload.new.bid_amount.toLocaleString()}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [car.id, queryClient]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(car.end_time).getTime() - now;

      if (distance < 0) {
        setTimeLeft("ENDED");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [car.end_time]);

  const bidMutation = useMutation({
    mutationFn: async (bidData: { auction_id: string; bid_amount: number; bidder_name: string; bidder_email: string }) => {
      // Triggers will handle validation and updates automatically
      const { error } = await supabase
        .from("bids")
        .insert([bidData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      toast.success(`Bid of $${bidAmount} placed successfully!`);
      setIsBidOpen(false);
      setBidAmount("");
      setBidderName("");
      setBidderEmail("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to place bid");
    },
  });

  const handleBid = () => {
    setErrors({});
    
    const bid = parseFloat(bidAmount);
    const bidSchema = createBidSchema(minBid);
    
    const result = bidSchema.safeParse({
      bidderName,
      bidderEmail,
      bidAmount: bid
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    bidMutation.mutate({
      auction_id: car.id,
      bid_amount: bid,
      bidder_name: bidderName,
      bidder_email: bidderEmail,
    });
  };

  return (
    <>
      <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-premium transition-smooth animate-fade-in">
        <div className="relative">
          <img src={car.image_url} alt={car.car_name} className="w-full h-64 object-cover" />
          <div className="absolute top-4 right-4 glass-effect px-4 py-2 rounded-full">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-accent" />
              <span>{timeLeft}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-2xl font-heading font-bold mb-4">{car.car_name}</h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Bid:</span>
              <span className="text-2xl font-bold text-accent">${Number(car.current_bid).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Bids:</span>
              <span className="font-semibold">{car.total_bids}</span>
            </div>
          </div>

          {/* Recent Bids */}
          {recentBids && recentBids.length > 0 && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">Recent Bids:</h4>
              <div className="space-y-2">
                {recentBids.map((bid, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span 
                      className="text-muted-foreground"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(anonymizeName(bid.bidder_name), { ALLOWED_TAGS: [] }) 
                      }}
                    />
                    <span className="font-semibold">${bid.bid_amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="hero"
            className="w-full"
            onClick={() => setIsBidOpen(true)}
            disabled={timeLeft === "ENDED"}
          >
            <Gavel className="mr-2 h-4 w-4" />
            {timeLeft === "ENDED" ? "Auction Ended" : "Place Bid"}
          </Button>
        </div>
      </div>

      <Dialog open={isBidOpen} onOpenChange={setIsBidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Your Bid</DialogTitle>
            <DialogDescription>
              Current bid: ${Number(car.current_bid).toLocaleString()} - {car.car_name}
              <br />
              <span className="text-accent font-semibold">Minimum bid: ${minBid.toLocaleString()}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="bidAmount">Bid Amount ($)</Label>
              <Input
                id="bidAmount"
                type="number"
                placeholder={`Minimum: $${minBid.toLocaleString()}`}
                value={bidAmount}
                onChange={(e) => {
                  setBidAmount(e.target.value);
                  setErrors({ ...errors, bidAmount: '' });
                }}
                className={errors.bidAmount ? 'border-destructive' : ''}
              />
              {errors.bidAmount && (
                <p className="text-sm text-destructive mt-1">{errors.bidAmount}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bidderName">Your Name</Label>
              <Input
                id="bidderName"
                placeholder="John Doe"
                value={bidderName}
                onChange={(e) => {
                  setBidderName(e.target.value);
                  setErrors({ ...errors, bidderName: '' });
                }}
                className={errors.bidderName ? 'border-destructive' : ''}
              />
              {errors.bidderName && (
                <p className="text-sm text-destructive mt-1">{errors.bidderName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bidderEmail">Your Email</Label>
              <Input
                id="bidderEmail"
                type="email"
                placeholder="john@example.com"
                value={bidderEmail}
                onChange={(e) => {
                  setBidderEmail(e.target.value);
                  setErrors({ ...errors, bidderEmail: '' });
                }}
                className={errors.bidderEmail ? 'border-destructive' : ''}
              />
              {errors.bidderEmail && (
                <p className="text-sm text-destructive mt-1">{errors.bidderEmail}</p>
              )}
            </div>

            <Button 
              variant="hero" 
              className="w-full" 
              onClick={handleBid}
              disabled={bidMutation.isPending}
            >
              {bidMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Bid...
                </>
              ) : (
                "Confirm Bid"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function Auction() {
  const { data: auctions, isLoading } = useQuery({
    queryKey: ["auctions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auctions")
        .select("*")
        .eq("status", "active")
        .order("end_time", { ascending: true });
      if (error) throw error;
      return data as AuctionCar[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4">
            Live <span className="text-accent">Auctions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bid on exclusive vehicles and win your dream car at competitive prices
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="glass-effect p-6 rounded-2xl text-center">
            <div className="inline-flex p-3 bg-accent/10 rounded-full mb-4">
              <Gavel className="h-6 w-6 text-accent" />
            </div>
            <div className="text-3xl font-heading font-bold text-accent mb-2">
              {auctions?.length || 0}
            </div>
            <div className="text-muted-foreground">Active Auctions</div>
          </div>

          <div className="glass-effect p-6 rounded-2xl text-center">
            <div className="inline-flex p-3 bg-accent/10 rounded-full mb-4">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div className="text-3xl font-heading font-bold text-accent mb-2">
              {auctions?.reduce((sum, car) => sum + Number(car.total_bids), 0) || 0}
            </div>
            <div className="text-muted-foreground">Total Bids</div>
          </div>

          <div className="glass-effect p-6 rounded-2xl text-center">
            <div className="inline-flex p-3 bg-accent/10 rounded-full mb-4">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div className="text-3xl font-heading font-bold text-accent mb-2">24/7</div>
            <div className="text-muted-foreground">Live Bidding</div>
          </div>
        </div>

        {/* Auction Cards */}
        {auctions && auctions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions.map((car) => (
              <AuctionCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No active auctions at the moment</p>
          </div>
        )}

        {/* How It Works */}
        <section className="mt-20 gradient-premium rounded-3xl p-12">
          <h2 className="text-3xl font-heading font-bold text-center mb-12 text-primary-foreground">
            How <span className="text-accent">Bidding</span> Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-heading font-bold text-accent mb-4">1</div>
              <h3 className="text-xl font-heading font-semibold mb-3 text-primary-foreground">
                Browse Auctions
              </h3>
              <p className="text-muted-foreground">
                Explore our live auctions and find vehicles that interest you
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl font-heading font-bold text-accent mb-4">2</div>
              <h3 className="text-xl font-heading font-semibold mb-3 text-primary-foreground">
                Place Your Bid
              </h3>
              <p className="text-muted-foreground">
                Submit competitive bids and watch the auction in real-time
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl font-heading font-bold text-accent mb-4">3</div>
              <h3 className="text-xl font-heading font-semibold mb-3 text-primary-foreground">Win & Drive</h3>
              <p className="text-muted-foreground">
                Win the auction and complete the purchase to drive away
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
