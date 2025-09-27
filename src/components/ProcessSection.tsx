import { Card } from "@/components/ui/card";
import { Send, FileText, Calendar, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Send Request",
    description: "Submit your caretaker service request online with a brief description of your property maintenance needs.",
    icon: Send,
    details: "All property maintenance requests are responded to as quickly as possible."
  },
  {
    number: "2", 
    title: "Get Free Quote",
    description: "Shortly after your request, you'll receive a free, no-obligation quote from a qualified caretaker service provider.",
    icon: FileText,
    details: "Professional assessment and competitive pricing for all services."
  },
  {
    number: "3",
    title: "Book Service",
    description: "Accept the quote and schedule your caretaker services at a time that works best for you.",
    icon: Calendar,
    details: "Flexible scheduling and reliable, professional service delivery."
  }
];

export const ProcessSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="heading-section">
            How to get caretaker services in 3 easy steps:
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We make it simple to connect with professional property caretakers who deliver quality service you can trust.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={step.number} 
                className="card-professional p-8 text-center relative overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Step Number Badge */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mx-auto mb-6 w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <Icon className="h-8 w-8 text-success" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {step.description}
                </p>
                
                <p className="text-sm text-primary font-medium">
                  {step.details}
                </p>

                {/* Connector Arrow (for larger screens) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-background border-2 border-success rounded-full flex items-center justify-center shadow-md">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <p className="text-muted-foreground mb-4">
            Ready to get started with professional property care?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-hero"
            >
              Get Your Free Quote
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};