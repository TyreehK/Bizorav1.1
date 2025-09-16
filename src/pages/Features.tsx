import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Receipt, 
  PieChart, 
  FileText, 
  CreditCard, 
  Users, 
  Globe, 
  Shield,
  Smartphone,
  Clock,
  Zap,
  TrendingUp,
  CheckCircle
} from "lucide-react";

const Features = () => {
  const mainFeatures = [
    {
      title: "Automatische boekhouding",
      description: "Koppel je bankrekening en laat automatisch je transacties verwerken. Bizora herkent patronen en categoriseert alles voor je.",
      features: ["Bankkoppeling", "Slimme categorisatie", "Automatische matching", "Real-time updates"],
      image: Calculator
    },
    {
      title: "Facturen versturen",
      description: "Maak en verstuur professionele facturen in seconden. Houd automatisch bij welke facturen betaald zijn.",
      features: ["Professionele templates", "Automatische herinneringen", "Online betaling", "Debiteuren beheer"],
      image: Receipt
    },
    {
      title: "Rapportages en inzichten",
      description: "Krijg direct inzicht in je financiële situatie met overzichtelijke rapporten en real-time dashboards.",
      features: ["Winst & Verlies", "Liquiditeit", "BTW rapportage", "Custom dashboards"],
      image: PieChart
    },
    {
      title: "BTW en belastingen",
      description: "Bereid automatisch je BTW-aangifte voor en blijf compliant met alle Nederlandse belastingregels.",
      features: ["BTW berekening", "Quarterly aangiftes", "Compliance check", "Belasting voorbereiding"],
      image: FileText
    }
  ];

  const allFeatures = [
    { icon: CreditCard, title: "Uitgaven beheer", description: "Fotografeer bonnetjes en laat ze automatisch verwerken" },
    { icon: Users, title: "Samenwerken", description: "Werk samen met je accountant of boekhouder" },
    { icon: Globe, title: "Meerdere valuta", description: "Handel internationaal met automatische wisselkoersen" },
    { icon: Shield, title: "Bankwaardige beveiliging", description: "Jouw gegevens zijn volledig beveiligd" },
    { icon: Smartphone, title: "Mobiele app", description: "Beheer je administratie onderweg" },
    { icon: Clock, title: "Urenregistratie", description: "Registreer tijd en factureer direct door" },
    { icon: Zap, title: "Integraties", description: "Koppel met je favoriete tools en systemen" },
    { icon: TrendingUp, title: "Voorspellingen", description: "Voorspel je cashflow en plan vooruit" }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4">Alle functionaliteiten</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Alles voor je administratie
            <br />
            <span className="text-primary">in één platform</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Van automatische boekhouding tot professionele rapporten. 
            Bizora heeft alle tools die je nodig hebt om je financiën onder controle te houden.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Gratis proberen
          </Button>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {mainFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                    <feature.image className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feature.features.map((item, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              En nog veel meer...
            </h2>
            <p className="text-xl text-muted-foreground">
              Ontdek alle mogelijkheden van Bizora
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allFeatures.map((feature, index) => (
              <Card key={index} className="p-6 shadow-sm border-border hover:shadow-md transition-shadow">
                <feature.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">200+ Koppelingen</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Koppel met je favoriete tools
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Bizora werkt naadloos samen met de tools die je al gebruikt. 
                Van webshops tot betaalproviders - we hebben de koppeling die je nodig hebt.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Alle Nederlandse banken</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Webshops: Shopify, WooCommerce, Magento</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Betaling: PayPal, Stripe, Mollie, iDEAL</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground">CRM: HubSpot, Salesforce, Pipedrive</span>
                </div>
              </div>
              
              <Button className="bg-primary hover:bg-primary/90">
                Bekijk alle koppelingen
              </Button>
            </div>
            
            <div className="bg-background rounded-xl p-8 shadow-md">
              <div className="grid grid-cols-3 gap-6">
                {[
                  "ING", "ABN", "Rabo", "Shopify", "PayPal", "Stripe",
                  "Mollie", "Exact", "Xero", "Zapier", "Slack", "API"
                ].map((integration, index) => (
                  <div key={index} className="bg-muted rounded-lg p-4 text-center">
                    <div className="w-8 h-8 bg-primary rounded mx-auto mb-2"></div>
                    <div className="text-xs font-medium text-foreground">{integration}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Probeer alle functies gratis
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start vandaag nog met een gratis proefperiode van 30 dagen. 
            Geen creditcard vereist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Gratis aanmelden
            </Button>
            <Button size="lg" variant="outline">
              Plan een demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;