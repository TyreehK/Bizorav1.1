import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "€19",
      period: "/maand",
      description: "Perfect voor starters en kleine ondernemingen",
      popular: false,
      features: [
        "Tot 100 transacties per maand",
        "Basis factuurstelling",
        "BTW rapportage",
        "1 gebruiker",
        "Email ondersteuning",
        "Mobiele app",
      ],
      notIncluded: [
        "Onbeperkte transacties",
        "Geavanceerde rapporten",
        "API toegang",
        "Priority support"
      ]
    },
    {
      name: "Professional",
      price: "€49",
      period: "/maand",
      description: "Voor groeiende bedrijven die meer nodig hebben",
      popular: true,
      features: [
        "Onbeperkte transacties",
        "Geavanceerde factuurstelling", 
        "Alle rapporten en analyses",
        "Tot 5 gebruikers",
        "Priority ondersteuning",
        "API toegang",
        "Multi-currency",
        "Expense management",
        "Urenregistratie",
        "Aangepaste branding"
      ],
      notIncluded: [
        "Dedicated account manager",
        "Aangepaste integraties"
      ]
    },
    {
      name: "Enterprise",
      price: "Op maat",
      period: "",
      description: "Voor grote organisaties met specifieke wensen",
      popular: false,
      features: [
        "Alles uit Professional",
        "Onbeperkte gebruikers",
        "Dedicated account manager",
        "24/7 telefoonondersteuning",
        "Aangepaste integraties",
        "White-label oplossing",
        "Geavanceerde beveiliging",
        "Compliance rapportage",
        "Multi-entity beheer",
        "SLA garanties"
      ],
      notIncluded: []
    }
  ];

  const faqs = [
    {
      question: "Kan ik altijd van plan wisselen?",
      answer: "Ja, je kunt op elk moment upgraden of downgraden. Wijzigingen gaan direct in en worden pro-rata verrekend."
    },
    {
      question: "Zijn er opstartkosten?",
      answer: "Nee, er zijn geen opstartkosten. Je betaalt alleen het maandelijkse abonnement."
    },
    {
      question: "Hoe kan ik betalen?",
      answer: "We accepteren iDEAL, creditcards en automatische incasso. Je ontvangt elke maand een factuur."
    },
    {
      question: "Wat gebeurt er met mijn gegevens als ik stop?",
      answer: "Je gegevens blijven 90 dagen beschikbaar voor export. Daarna worden ze definitief verwijderd."
    },
    {
      question: "Is er een minimum contract?",
      answer: "Nee, je kunt maandelijks opzeggen. Er zijn geen langetermijncontracten vereist."
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4">Transparante prijzen</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Simpele prijzen voor
            <br />
            <span className="text-primary">ieder bedrijf</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Geen verborgen kosten, geen verrassingen. Kies het plan dat bij jouw bedrijf past 
            en begin vandaag nog.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-primary" />
              <span>30 dagen gratis proberen</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Geen creditcard vereist</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Altijd opzegbaar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative p-8 ${plan.popular ? 'border-2 border-primary shadow-md' : 'border-border shadow-sm'} bg-background`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-2">
                      <Star className="h-4 w-4 mr-1" />
                      Populairst
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <Button 
                  className={`w-full mb-8 ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-foreground hover:bg-foreground/90'}`}
                  size="lg"
                >
                  {plan.name === "Enterprise" ? "Contact opnemen" : "Gratis proberen"}
                </Button>

                <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.notIncluded.length > 0 && (
                    <>
                      {plan.notIncluded.map((feature, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Veelgestelde vragen
            </h2>
            <p className="text-xl text-muted-foreground">
              Heb je nog vragen? We hebben de antwoorden.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 shadow-sm border-border bg-background">
                <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-24 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Speciaal voor grote organisaties
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Heb je specifieke wensen of beheer je meerdere entiteiten? 
            Ons Enterprise plan biedt maatwerk voor jouw organisatie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Plan een gesprek
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Enterprise brochure
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start vandaag nog met je gratis proefperiode. 
            Geen verplichtingen, gewoon proberen.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
            Gratis aanmelden
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Pricing;