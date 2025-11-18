import { Shield, Users, CheckCircle, Clock } from "lucide-react";

export const WhyUsStats = () => {
  const stats = [
    {
      icon: Shield,
      value: "20+",
      label: "års erfaring"
    },
    {
      icon: Users,
      value: "200+",
      label: "fornøyde kunder"
    },
    {
      icon: CheckCircle,
      value: "100%",
      label: "tilfredsgaranti"
    },
    {
      icon: Clock,
      value: "<2t",
      label: "responstid"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-2 font-heading">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
