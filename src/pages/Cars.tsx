import { useState } from "react";
import { CarCard } from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Cars() {
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTransmission, setSelectedTransmission] = useState("all");
  const [yearRange, setYearRange] = useState([2020, 2025]);
  const [mileageRange, setMileageRange] = useState([0, 100000]);
  const [selectedColor, setSelectedColor] = useState("all");

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredCars = (cars || []).filter((car) => {
    const matchesCategory = selectedCategory === "all" || car.category?.toLowerCase() === selectedCategory;
    const matchesTransmission =
      selectedTransmission === "all" || car.transmission?.toLowerCase() === selectedTransmission;
    const matchesPrice = Number(car.price) >= priceRange[0] && Number(car.price) <= priceRange[1];
    const matchesYear = (car.year || 0) >= yearRange[0] && (car.year || 0) <= yearRange[1];
    const matchesMileage = (car.mileage || 0) >= mileageRange[0] && (car.mileage || 0) <= mileageRange[1];
    const matchesColor = selectedColor === "all" || car.color?.toLowerCase() === selectedColor;
    return matchesCategory && matchesTransmission && matchesPrice && matchesYear && matchesMileage && matchesColor;
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
            Our <span className="text-accent">Collection</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated selection of the world's finest vehicles
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="glass-effect rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-heading font-bold">Filters</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">
                  Price Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </label>
                <Slider
                  min={0}
                  max={500000}
                  step={10000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-4"
                />
              </div>

              {/* Year Range Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">
                  Year: {yearRange[0]} - {yearRange[1]}
                </label>
                <Slider
                  min={2015}
                  max={2025}
                  step={1}
                  value={yearRange}
                  onValueChange={setYearRange}
                  className="mb-4"
                />
              </div>

              {/* Mileage Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">
                  Mileage: {mileageRange[0].toLocaleString()} - {mileageRange[1].toLocaleString()} km
                </label>
                <Slider
                  min={0}
                  max={150000}
                  step={5000}
                  value={mileageRange}
                  onValueChange={setMileageRange}
                  className="mb-4"
                />
              </div>

              {/* Color Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colors</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transmission Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Transmission</label>
                <Select value={selectedTransmission} onValueChange={setSelectedTransmission}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="premium"
                className="w-full"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedTransmission("all");
                  setPriceRange([0, 500000]);
                  setYearRange([2020, 2025]);
                  setMileageRange([0, 100000]);
                  setSelectedColor("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </aside>

          {/* Cars Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-accent">{filteredCars.length}</span> vehicles
              </p>
            </div>

            {filteredCars.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {filteredCars.map((car) => (
                  <CarCard 
                    key={car.id}
                    id={car.id}
                    name={car.name}
                    description={car.description || ""}
                    price={Number(car.price)}
                    image={car.image_url || ""}
                    imageHover={car.image_hover_url || car.image_url || ""}
                    doors={car.doors || 0}
                    speed={car.speed || ""}
                    year={car.year || 0}
                    passengers={car.passengers || 0}
                    engine={car.engine || ""}
                    transmission={car.transmission || ""}
                    mileage={car.mileage || 0}
                    color={car.color || ""}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">No vehicles match your filters</p>
                <Button
                  variant="hero"
                  className="mt-6"
                  onClick={() => {
                  setSelectedCategory("all");
                  setSelectedTransmission("all");
                  setPriceRange([0, 500000]);
                  setYearRange([2020, 2025]);
                  setMileageRange([0, 100000]);
                  setSelectedColor("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
