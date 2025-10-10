import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HTMLContent } from "@/components/HTMLContent";
import { Award, Users, Shield, TrendingUp, Linkedin, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-showroom.jpg";
import DOMPurify from 'dompurify';

export default function About() {
  const { data: aboutContent, isLoading } = useQuery({
    queryKey: ["about-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_content")
        .select("*")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const getSection = (type: string) => {
    const section = aboutContent?.find((s) => s.section_type === type);
    return section?.content as any;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const heroSection = getSection("hero");
  const storySection = getSection("story");
  const statsSection = getSection("stats");
  const missionSection = getSection("mission");
  const visionSection = getSection("vision");
  const teamSection = getSection("team");

  const stats = statsSection?.items || [
    { label: "Years in Business", value: "20+", icon: "Award" },
    { label: "Cars Sold", value: "5,000+", icon: "TrendingUp" },
    { label: "Happy Clients", value: "4,500+", icon: "Users" },
    { label: "Satisfaction Rate", value: "98%", icon: "Shield" },
  ];

  const team = teamSection?.members || [
    {
      name: "Alexander Morgan",
      role: "Chief Executive Officer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
      name: "Sophia Martinez",
      role: "Head of Sales",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    },
    {
      name: "James Chen",
      role: "Director of Operations",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Success Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    },
  ];

  const getIcon = (iconName: string) => {
    const icons: any = { Award, TrendingUp, Users, Shield };
    return icons[iconName] || Award;
  };

  // Decode and sanitize hero title/subtitle to render inline HTML safely
  const decodeHtml = (input: string) => {
    if (typeof window === 'undefined') return input;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    return textarea.value;
  };
  const stripPTags = (html: string) => html.replace(/^\s*<p>([\s\S]*?)<\/p>\s*$/i, '$1');

  const heroTitleRaw = heroSection?.title || "About Elite Motors";
  const heroSubtitleRaw = heroSection?.subtitle || "Two decades of excellence in luxury automotive sales and service";
  const heroTitleHTML = DOMPurify.sanitize(stripPTags(decodeHtml(heroTitleRaw)), { ALLOWED_TAGS: ['strong','em','u','span','br'], ALLOWED_ATTR: [] });
  const heroSubtitleHTML = DOMPurify.sanitize(stripPTags(decodeHtml(heroSubtitleRaw)), { ALLOWED_TAGS: ['strong','em','u','span','br'], ALLOWED_ATTR: [] });

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroSection?.image || heroImage} alt="About Elite Motors" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1
            className="text-5xl md:text-7xl font-heading font-bold mb-6 animate-fade-in-up"
            dangerouslySetInnerHTML={{ __html: heroTitleHTML }}
          />
          <p
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in"
            dangerouslySetInnerHTML={{ __html: heroSubtitleHTML }}
          />
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-heading font-bold mb-6 text-center">
              Our <span className="text-accent">Story</span>
            </h2>
            <HTMLContent 
              content={storySection?.content || storySection?.text || `
                <p>Founded in 2004, Elite Motors began with a simple vision: to redefine the luxury car buying experience. What started as a small showroom with a handful of premium vehicles has evolved into one of the most prestigious automotive destinations in the region.</p>
                <p>Our founder, Alexander Morgan, recognized that purchasing a luxury vehicle should be as exceptional as the cars themselves. This philosophy drives everything we do, from our carefully curated inventory to our white-glove customer service.</p>
                <p>Today, Elite Motors represents the pinnacle of automotive excellence, offering an unparalleled selection of luxury, sports, and electric vehicles from the world's most prestigious manufacturers. Our commitment to quality, transparency, and customer satisfaction has earned us the trust of thousands of discerning clients.</p>
              `}
              className="space-y-6 text-lg text-muted-foreground"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold mb-12 text-center text-primary-foreground">
            Excellence in <span className="text-accent">Numbers</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat: any) => {
              const Icon = getIcon(stat.icon);
              return (
                <div
                  key={stat.label}
                  className="glass-effect p-8 rounded-2xl text-center animate-scale-in"
                >
                  <div className="inline-flex p-4 bg-accent/10 rounded-full mb-6">
                    <Icon className="h-8 w-8 text-accent" />
                  </div>
                  <div className="text-5xl font-heading font-bold text-accent mb-3">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-card p-8 rounded-2xl shadow-premium">
              <h3 className="text-3xl font-heading font-bold mb-6">
                Our <span className="text-accent">Mission</span>
              </h3>
              <HTMLContent 
                content={missionSection?.text || `
                  <p>To provide an unparalleled automotive experience by offering the world's finest vehicles, backed by exceptional service, transparent practices, and unwavering commitment to customer satisfaction. We strive to make every client interaction memorable and every vehicle purchase a celebration.</p>
                `}
                className="text-lg text-muted-foreground"
              />
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-premium">
              <h3 className="text-3xl font-heading font-bold mb-6">
                Our <span className="text-accent">Vision</span>
              </h3>
              <HTMLContent 
                content={visionSection?.text || `
                  <p>To be recognized as the premier destination for luxury automotive excellence, setting industry standards for quality, innovation, and customer care. We envision a future where Elite Motors is synonymous with trust, prestige, and the ultimate automotive experience.</p>
                `}
                className="text-lg text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Meet Our <span className="text-accent">Team</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passionate professionals dedicated to delivering excellence
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member: any) => (
              <div
                key={member.name}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-premium transition-smooth animate-fade-in"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-smooth hover:scale-110"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-heading font-bold mb-2">{member.name}</h3>
                  <p className="text-muted-foreground mb-4">{member.role}</p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-smooth"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span>Connect</span>
                  </a>
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
            Ready to Experience Excellence?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Visit our showroom or contact us to begin your journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/cars">View Collection</Link>
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
