import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ChevronRight, Home, Building2, User, Phone, Mail, MapPin } from "lucide-react";

interface FormData {
  type: "private" | "business" | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  description: string;
}

export const QuoteForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    type: null,
    name: "",
    email: "",
    phone: "",
    address: "",
    serviceType: "",
    description: ""
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    toast({
      title: "Quote Request Submitted!",
      description: "We'll contact you within 24 hours with a free quote.",
      duration: 5000,
    });
    // Reset form
    setStep(1);
    setFormData({
      type: null,
      name: "",
      email: "",
      phone: "",
      address: "",
      serviceType: "",
      description: ""
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.type !== null;
      case 2:
        return formData.serviceType !== "";
      case 3:
        return formData.name && formData.email && formData.phone && formData.address;
      case 4:
        return formData.description.length > 10;
      default:
        return false;
    }
  };

  return (
    <Card className="form-professional">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Get a Free Quote</h3>
        <div className="text-sm text-muted-foreground">
          {step}/4: {step === 1 && "Client Type"}
          {step === 2 && "Service Needed"}
          {step === 3 && "Contact Info"}
          {step === 4 && "Project Details"}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium">Private or Business?</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={formData.type === "private" ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setFormData({ ...formData, type: "private" })}
            >
              <Home className="h-6 w-6" />
              <span>Private</span>
            </Button>
            <Button
              variant={formData.type === "business" ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setFormData({ ...formData, type: "business" })}
            >
              <Building2 className="h-6 w-6" />
              <span>Business</span>
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium">What service do you need?</Label>
          <div className="space-y-2">
            {[
              "Property Maintenance & Repairs",
              "Landscaping & Gardening", 
              "Cleaning Services",
              "Security & Monitoring",
              "Seasonal Services",
              "Emergency Repairs",
              "Other"
            ].map((service) => (
              <Button
                key={service}
                variant={formData.serviceType === service ? "default" : "outline"}
                className="w-full justify-start h-12"
                onClick={() => setFormData({ ...formData, serviceType: service })}
              >
                {service}
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium">Your Contact Information</Label>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Full Name"
                className="pl-10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Phone Number"
                className="pl-10"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Property Address"
                className="pl-10"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium">Describe Your Project</Label>
          <Textarea
            placeholder="Please provide details about the work needed, timeline, and any specific requirements..."
            className="min-h-32"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            The more details you provide, the more accurate your quote will be.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        {step > 1 && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        <div className="ml-auto">
          {step < 4 ? (
            <Button 
              onClick={handleNext} 
              disabled={!isStepValid()}
              className="bg-success hover:bg-success-hover text-success-foreground"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="bg-success hover:bg-success-hover text-success-foreground"
            >
              Submit Request
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Your contact information is only used for this quote request. We never share your details with third parties.
      </p>
    </Card>
  );
};