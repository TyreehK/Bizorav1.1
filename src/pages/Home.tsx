import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Shield, Zap, FileText, Calculator, TrendingUp } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Calculator,
      title: "Automatische boekhouding",
      description: "Koppel je bankrekening en laat Bizora automatisch je transacties categoriseren."
    },
    {
      icon: FileText,
      title: "Facturen maken",
      description: "Verstuur professionele facturen en houd je debiteuren bij."
    },
    {
      icon: TrendingUp,
      title: "Inzichtelijke rapporten",
      description: "Krijg direct inzicht in je financiële situatie met duidelijke overzichten."
    },
    {
      icon: Shield,
      title: "Veilig en betrouwbaar",
      description: "Je gegevens zijn veilig met bankwaardige beveiliging."
    }
  ];

  const testimonials = [
    {
      name: "Sarah van der Berg",
      role: "Eigenaar, Studio Berg",
      content: "Bizora heeft mijn administratie zo veel eenvoudiger gemaakt. Ik bespaar wekelijks uren.",
      avatar: "S"
    },
    {
      name: "Mark Janssen", 
      role: "Freelance Developer",
      content: "Eindelijk een boekhouding tool die ik zelf kan gebruiken. Simpel en overzichtelijk.",
      avatar: "M"
    },
    {
      name: "Linda Peters",
      role: "Webshop eigenaar", 
      content: "De automatische koppeling met mijn webshop is fantastisch. Alles wordt automatisch verwerkt.",
      avatar: "L"
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Je boekhouding.
                <br />
                <span className="text-primary">Zo gebeurd,</span>
                <br />
                met Bizora
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Automatiseer je administratie en focus op waar je van houdt: ondernemen. 
                Bizora maakt boekhouding simpel voor iedere ondernemer.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
                  Gratis aanmelden
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  Het verhaal van Bizora
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">S</div>
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-xs font-semibold">M</div>
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-foreground text-xs font-semibold">L</div>
                </div>
                <span>Meer dan 380.000 ondernemers gingen je voor</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-muted rounded-2xl p-8 shadow-md">
                <div className="aspect-video bg-background rounded-lg shadow-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Calculator className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-muted-foreground">Demo video placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Steeds automatischer.
            <br />
            Steeds completer.
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Als ondernemer wil je de vrijheid om je werk goed te doen. Geen gedoe met facturen sturen, btw betalen of betalingen in de gaten houden. Bij Bizora werken we elke dag aan het meest slimme boekrpakket. Zodat jij kunt doen waar je goed in bent.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Alles wat je nodig hebt
            </h2>
            <p className="text-xl text-muted-foreground">
              Van facturen tot rapporten. Bizora regelt je complete administratie.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 shadow-sm border-border hover:shadow-md transition-shadow">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">380.000+</div>
              <div className="text-lg opacity-90">Tevreden ondernemers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">€2.5M+</div>
              <div className="text-lg opacity-90">Dagelijks verwerkt</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">99.9%</div>
              <div className="text-lg opacity-90">Uptime garantie</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Wat onze klanten zeggen
            </h2>
            <p className="text-xl text-muted-foreground">
              Meer dan 380.000 ondernemers zijn je voorgegaan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 shadow-sm border-border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Begin vandaag nog met Bizora
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Probeer Bizora 30 dagen gratis. Geen creditcard vereist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
              Gratis aanmelden
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              Plan een demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;