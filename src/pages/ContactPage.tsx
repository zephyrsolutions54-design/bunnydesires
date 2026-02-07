import { useState } from "react";
import PageLayout from "@/components/landing/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const categories = [
  "General Inquiry",
  "Technical Support",
  "Payment Issues",
  "Account Help",
  "Report Abuse",
  "Creator Application",
  "Partnership",
];

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <PageLayout title="Contact Us">
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {[
          { icon: Mail, label: "Email", value: "support@bunnydesires.com" },
          { icon: Phone, label: "Phone", value: "+91-XXXXXXXXXX" },
          { icon: Clock, label: "Hours", value: "9 AM – 9 PM IST (Mon-Sat)" },
          { icon: MapPin, label: "Office", value: "Mumbai, India" },
        ].map((info) => (
          <div key={info.label} className="glass rounded-xl p-4 border border-border/30 flex items-center gap-3">
            <info.icon className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{info.label}</p>
              <p className="font-medium text-sm">{info.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="glass rounded-xl p-6 border border-border/30">
        <h2 className="font-display text-xl font-semibold mb-6">Send us a message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required placeholder="Your name" className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="you@example.com" className="bg-background border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select required>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" required placeholder="How can we help?" rows={5} className="bg-background border-border" />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Sending..." : "Submit"}
          </Button>
        </form>
      </section>
    </PageLayout>
  );
};

export default ContactPage;
