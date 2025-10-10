import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/CarCard";
import { HTMLContent } from "@/components/HTMLContent";
import { ArrowRight, Star, Shield, HeadphonesIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-showroom.jpg";
import DOMPurify from "dompurify";

export default function Home() {
  const { data: homeContent, isLoading: homeLoading } = useQuery({
    queryKey: ["home-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_content")
        .select("*")
        .eq("status", "active")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const { data: cars, isLoading: carsLoading } = useQuery({
    queryKey: ["featured-cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("status", "active")
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const getSection = (type: string) => {
    return homeContent?.find((section) => section.section_type === type);
  };

  const heroSection = getSection("hero");
  const aboutSection = getSection("about");
  const ctaSection = getSection("cta");

  // Decode HTML entities and strip wrapping <p> tags for titles/subtitles
  const decodeHtml = (input: string) => {
    if (typeof window === "undefined") return input;
    const textarea = document.createElement("textarea");
    textarea.innerHTML = input;
    return textarea.value;
  };
  const stripPTags = (html: string) =>
    html.replace(/^\s*<p>([\s\S]*?)<\/p>\s*$/i, "$1");

  // Prepare sanitized HTML for hero and about titles/descriptions
  const heroTitleRaw =
    heroSection?.title || "Experience Automotive Excellence";
  const heroDescRaw =
    heroSection?.description ||
    "Discover the world's finest collection of luxury, sports, and electric vehicles";
  const heroTitleHTML = DOMPurify.sanitize(
    stripPTags(decodeHtml(heroTitleRaw)),
    { ALLOWED_TAGS: ["strong", "em", "u", "span", "br"], ALLOWED_ATTR: [] }
  );
  const heroDescHTML = DOMPurify.sanitize(
    stripPTags(decodeHtml(heroDescRaw)),
    { ALLOWED_TAGS: ["strong", "em", "u", "span", "br"], ALLOWED_ATTR: [] }
  );

  const aboutTitleRaw = aboutSection?.title || "Welcome to Elite Motors";
  const aboutTitleHTML = DOMPurify.sanitize(
    stripPTags(decodeHtml(aboutTitleRaw)),
    { ALLOWED_TAGS: ["strong", "em", "u", "span", "br"], ALLOWED_ATTR: [] }
  );

  if (homeLoading || carsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const categories = [
    {
      title: "Luxury",
      description: "Premium vehicles for distinguished taste",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
    },
    {
      title: "Sports",
      description: "High-performance racing machines",
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop",
    },
    {
      title: "SUVs",
      description: "Spacious and versatile family vehicles",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop",
    },
    {
      title: "Electric",
      description: "Sustainable future of mobility",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop",
    },
  ];

  const testimonials = [
    {
      name: "Michael Rodriguez",
      role: "Business Owner",
      content: "Exceptional service and an incredible selection of vehicles. Found my dream car with Elite Motors!",
      rating: 5,
    },
    {
      name: "Sarah Thompson",
      role: "Executive",
      content: "Professional, knowledgeable staff who made the buying process seamless. Highly recommend!",
      rating: 5,
    },
    {
      name: "James Chen",
      role: "Entrepreneur",
      content: "The auction platform is fantastic. Won an amazing sports car at a great price!",
      rating: 5,
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroSection?.image_url || heroImage}
            alt="Luxury car showroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1
            className="text-5xl md:text-7xl font-heading font-bold mb-6 animate-fade-in-up"
            dangerouslySetInnerHTML={{ __html: heroTitleHTML }}
          />

          <p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in"
            dangerouslySetInnerHTML={{ __html: heroDescHTML }}
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button variant="hero" size="lg" asChild>
              <Link to={heroSection?.button_link || "/cars"}>
                {heroSection?.button_text || "View Collection"} <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button variant="premium" size="lg" asChild>
              <Link to="/auction">Explore Auctions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2
                className="text-4xl md:text-5xl font-heading font-bold mb-6"
                dangerouslySetInnerHTML={{ __html: aboutTitleHTML }}
              />

              <HTMLContent 
                content={aboutSection?.description || "For over two decades, Elite Motors has been the premier destination for automotive excellence."} 
                className="text-lg text-muted-foreground mb-8"
              />
              <Button variant="hero" size="lg" asChild>
                <Link to="/about">
                  Learn More <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6 animate-scale-in">
              <div className="bg-card p-6 rounded-2xl shadow-premium text-center">
                <div className="text-4xl font-heading font-bold text-accent mb-2">20+</div>
                <div className="text-muted-foreground">Years Experience</div>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-premium text-center">
                <div className="text-4xl font-heading font-bold text-accent mb-2">5000+</div>
                <div className="text-muted-foreground">Cars Sold</div>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-premium text-center">
                <div className="text-4xl font-heading font-bold text-accent mb-2">98%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-premium text-center">
                <div className="text-4xl font-heading font-bold text-accent mb-2">24/7</div>
                <div className="text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Featured <span className="text-accent">Collection</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked selection of our most exceptional vehicles
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars?.map((car) => (
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
          <div className="text-center mt-12">
            <Button variant="premium" size="lg" asChild>
              <Link to="/cars">
                View All Cars <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-primary-foreground">
              Explore by <span className="text-accent">Category</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect vehicle for your lifestyle
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.title}
                to="/cars"
                className="group relative overflow-hidden rounded-2xl aspect-square animate-scale-in"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-300">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Why Choose <span className="text-accent">Elite Motors</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-premium text-center animate-fade-in">
              <div className="inline-flex p-4 bg-accent/10 rounded-full mb-6">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">Premium Selection</h3>
              <p className="text-muted-foreground">
                Curated collection of the world's finest vehicles, rigorously inspected for excellence
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-premium text-center animate-fade-in">
              <div className="inline-flex p-4 bg-accent/10 rounded-full mb-6">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">Trusted Service</h3>
              <p className="text-muted-foreground">
                20+ years of excellence with transparent pricing and comprehensive warranties
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-premium text-center animate-fade-in">
              <div className="inline-flex p-4 bg-accent/10 rounded-full mb-6">
                <HeadphonesIcon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">24/7 Support</h3>
              <p className="text-muted-foreground">
                Expert assistance available around the clock for all your automotive needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              What Our <span className="text-accent">Clients Say</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-card p-8 rounded-2xl shadow-premium animate-fade-in"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-premium">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-primary-foreground">
            {ctaSection?.title || "Ready to Find Your Dream Car?"}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {ctaSection?.description || "Start your journey with Elite Motors today"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/cars">Browse Collection</Link>
            </Button>
            <Button variant="premium" size="lg" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
