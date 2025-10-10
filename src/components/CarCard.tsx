import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car, Users, Gauge, Calendar, Fuel, TrendingUp, Palette } from "lucide-react";
import { PurchaseDialog } from "@/components/PurchaseDialog";

interface CarCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imageHover?: string;
  doors: number;
  speed: string;
  year: number;
  passengers: number;
  engine: string;
  transmission: string;
  mileage: number;
  color: string;
}

export const CarCard = ({
  id,
  name,
  description,
  price,
  image,
  imageHover,
  doors,
  speed,
  year,
  passengers,
  engine,
  transmission,
  mileage,
  color,
}: CarCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"buy" | "rent">("buy");

  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-premium transition-smooth animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={isHovered && imageHover ? imageHover : image}
          alt={name}
          className="w-full h-full object-cover transition-smooth group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-semibold shadow-glow">
          ${price.toLocaleString()}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-heading font-bold mb-2">{name}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{doors} Doors</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{speed}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{year}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{passengers} Seats</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Fuel className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{engine}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Palette className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{color}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="hero" 
            className="flex-1"
            onClick={() => {
              setTransactionType("buy");
              setDialogOpen(true);
            }}
          >
            Buy Now
          </Button>
          <Button 
            variant="premium" 
            className="flex-1"
            onClick={() => {
              setTransactionType("rent");
              setDialogOpen(true);
            }}
          >
            Rent Now
          </Button>
        </div>
      </div>

      {/* Purchase Dialog */}
      <PurchaseDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        carId={id}
        carName={name}
        price={price}
        type={transactionType}
      />
    </div>
  );
};
