import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  FileText, 
  Users,
  HelpCircle,
  Calendar,
  CheckCircle
} from "lucide-react";

const Contact = () => {
  const contactMethods = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Direct contact met ons support team",
      availability: "Ma-Vr 9:00-18:00",
      action: "Start gesprek",
      primary: true
    },
    {
      icon: Phone,
      title: "Telefoon",
      description: "+31 20 123 4567",
      availability: "Ma-Vr 9:00-17:00",
      action: "Bel nu"
    },
    {
      icon: Mail,
      title: "Email",
      description: "support@bizora.nl",
      availability: "Reactie binnen 4 uur",
      action: "Stuur email"
    },
    {
      icon: Calendar,
      title: "Plan een demo",
      description: "Persoonlijke rondleiding",
      availability: "Ma-Vr naar afspraak",
      action: "Plan demo"
    }
  ];

  const supportTopics = [
    {
      icon: HelpCircle,
      title: "Algemene vragen",
      description: "Vragen over functies, prijzen of hoe Bizora werkt"
    },
    {
      icon: FileText,
      title: "Technische hulp",
      description: "Hulp bij integraties, bugs of technische problemen"
    },
    {
      icon: Users,
      title: "Account beheer",
      description: "Vragen over je account, facturering of instellingen"
    },
    {
      icon: CheckCircle,
      title: "Boekhouding advies",
      description: "Hulp bij BTW, belastingen en boekhoudprocessen"
    }
  ];

  const offices = [
    {
      city: "Amsterdam",
      address: "Herengracht 123, 1015 BG Amsterdam",
      phone: "+31 20 123 4567",
      type: "Hoofdkantoor"
    },
    {
      city: "Rotterdam", 
      address: "Coolsingel 456, 3012 AB Rotterdam",
      phone: "+31 10 234 5678",
      type: "Vestiging"
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4">We helpen je graag</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Hulp nodig?
            <br />
            <span className="text-primary">We staan voor je klaar</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Heb je vragen over Bizora? Ons team van experts staat klaar om je te helpen. 
            Kies de manier van contact die het beste bij je past.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Gemiddelde reactietijd: 2 uur</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <span>98% klanttevredenheid</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card 
                key={index} 
                className={`p-6 text-center shadow-sm border-border bg-background hover:shadow-md transition-shadow ${
                  method.primary ? 'border-2 border-primary' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                  method.primary ? 'bg-primary text-white' : 'bg-muted text-primary'
                }`}>
                  <method.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{method.title}</h3>
                <p className="text-muted-foreground mb-3">
                  {method.description}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {method.availability}
                </p>
                <Button 
                  className={method.primary ? "bg-primary hover:bg-primary/90 w-full" : "w-full"}
                  variant={method.primary ? "default" : "outline"}
                >
                  {method.action}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Stuur ons een bericht
            </h2>
            <p className="text-xl text-muted-foreground">
              Vul het formulier in en we nemen binnen 4 uur contact met je op
            </p>
          </div>

          <Card className="p-8 shadow-sm border-border bg-background">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6">Je gegevens</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Voornaam *</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      placeholder="Jan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Achternaam *</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      placeholder="de Vries"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input 
                      type="email" 
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      placeholder="jan.devries@bedrijf.nl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Telefoon</label>
                    <input 
                      type="tel" 
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      placeholder="+31 6 12345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bedrijfsnaam</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      placeholder="Je Bedrijf BV"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6">Je vraag</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Onderwerp *</label>
                    <select className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background">
                      <option>Kies een onderwerp...</option>
                      <option>Algemene vraag</option>
                      <option>Demo aanvraag</option>
                      <option>Technische hulp</option>
                      <option>Prijzen & plannen</option>
                      <option>Accountancy ondersteuning</option>
                      <option>Account problemen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bericht *</label>
                    <textarea 
                      rows={8}
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      placeholder="Beschrijf je vraag in detail..."
                    ></textarea>
                  </div>
                  <div className="flex items-start space-x-3">
                    <input 
                      type="checkbox" 
                      id="newsletter" 
                      className="mt-1 rounded border-border"
                    />
                    <label htmlFor="newsletter" className="text-sm text-muted-foreground">
                      Ik wil updates ontvangen over nieuwe functies en tips voor Bizora
                    </label>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Verstuur bericht
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Support Topics */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Waarmee kunnen we helpen?
            </h2>
            <p className="text-xl text-muted-foreground">
              Onze meest voorkomende onderwerpen waar we je graag bij helpen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportTopics.map((topic, index) => (
              <Card key={index} className="p-6 text-center shadow-sm border-border bg-background hover:shadow-md transition-shadow group cursor-pointer">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <topic.icon className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{topic.title}</h3>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Kom langs op kantoor
            </h2>
            <p className="text-xl text-muted-foreground">
              Bezoek een van onze locaties voor een persoonlijk gesprek
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {offices.map((office, index) => (
              <Card key={index} className="p-6 shadow-sm border-border bg-background text-center">
                <Badge className="mb-4" variant={office.type === "Hoofdkantoor" ? "default" : "secondary"}>
                  {office.type}
                </Badge>
                <h3 className="text-xl font-semibold mb-4 text-foreground">{office.city}</h3>
                <div className="space-y-3 text-sm text-muted-foreground mb-6">
                  <div className="flex items-start justify-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{office.address}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{office.phone}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Route plannen
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-24 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Snel antwoord nodig?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Bekijk onze uitgebreide kennisbank voor directe antwoorden op veelgestelde vragen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Bekijk FAQ
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Kennisbank
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;