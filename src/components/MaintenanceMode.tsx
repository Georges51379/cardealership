import { Construction } from "lucide-react";

export const MaintenanceMode = () => {
  return (
    <div className="fixed inset-0 h-screen flex items-center justify-center bg-[hsl(220,70%,15%)] z-50 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex p-8 bg-white/5 backdrop-blur-sm rounded-full mb-8 border border-white/10">
          <Construction className="h-20 w-20 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-white">
          Under Maintenance
        </h1>
        <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
          We're currently performing scheduled maintenance to improve your experience.
          We'll be back shortly!
        </p>
        <p className="text-lg text-white/60">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
};
