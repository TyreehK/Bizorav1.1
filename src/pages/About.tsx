import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, Heart, MapPin, Mail, Calendar } from "lucide-react";

const About = () => {
  const team = [
    {
      name: "Emma de Vries",
      role: "CEO & Oprichter",
      description: "Meer dan 15 jaar ervaring in fintech en een passie voor het vereenvoudigen van ondernemerschap.",
      avatar: "E"
    },
    {
      name: "Thomas Bakker",
      role: "CTO & Oprichter", 
      description: "Tech-expert met ervaring bij grote banken. Bouwt de technologie die boekhouding simpel maakt.",
      avatar: "T"
    },
    {
      name: "Sophie Janssen",
      role: "Head of Product",
      description: "Zorgt ervoor dat complexe processen aanvoelen als een fluitje van een cent voor onze gebruikers.",
      avatar: "S"
    },
    {
      name: "Mark de Vries",
      role: "Customer Success",
      description: "Helpt dagelijks ondernemers om het maximale uit Bizora te halen en succesvol te zijn.",
      avatar: "M"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Eenvoud boven alles",
      description: "We geloven dat boekhouding niet ingewikkeld hoeft te zijn. Daarom maken we alles zo simpel mogelijk."
    },
    {
      icon: Users,
      title: "Klant centraal",
      description: "Onze klanten staan altijd op de eerste plaats. Hun succes is ons succes."
    },
    {
      icon: Award,
      title: "Kwaliteit gegarandeerd", 
      description: "We streven naar perfectie in alles wat we doen. Van software tot service."
    },
    {
      icon: Heart,
      title: "Passie voor ondernemen",
      description: "We zijn net zo gepassioneerd over ondernemen als onze klanten. Die passie zie je terug in ons product."
    }
  ];

  const timeline = [
    {
      year: "2019",
      title: "De start van Bizora",
      description: "Emma en Thomas richtten Bizora op vanuit hun eigen frustratie met ingewikkelde boekhoudsoftware."
    },
    {
      year: "2020", 
      title: "Eerste 1.000 klanten",
      description: "Ondanks een moeilijk jaar bereikten we onze eerste mijlpaal van 1.000 tevreden ondernemers."
    },
    {
      year: "2021",
      title: "Grote investering",
      description: "Een succesvolle investeringsronde van €2 miljoen om ons team uit te breiden."
    },
    {
      year: "2022",
      title: "10.000 ondernemers",
      description: "We passeerden de 10.000 actieve gebruikers en lanceerden onze mobiele app."
    },
    {
      year: "2023",
      title: "Europese expansie", 
      description: "Uitbreiding naar België en Duitsland. Bizora wordt internationaal."
    },
    {
      year: "2024",
      title: "AI-powered features",
      description: "Lancering van kunstmatige intelligentie functies voor nog slimmere automatisering."
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4">Over Bizora</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Onze missie: boekhouding
            <br />
            <span className="text-primary">voor iedereen simpel maken</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sinds 2019 helpen we duizenden ondernemers hun administratie te automatiseren. 
            We geloven dat elke ondernemer zich moet kunnen focussen op waar hij of zij goed in is: ondernemen.
          </p>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground">380.000+</div>
              <div className="text-muted-foreground">Ondernemers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">€100M+</div>
              <div className="text-muted-foreground">Verwerkt</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Waar we voor staan
            </h2>
            <p className="text-xl text-muted-foreground">
              Deze waarden sturen alles wat we doen en bepalen hoe we ons product bouwen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center shadow-sm border-border bg-background">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Het team achter Bizora
            </h2>
            <p className="text-xl text-muted-foreground">
              Ontmoet de mensen die dagelijks werken aan de beste boekhoudervaring
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center shadow-sm border-border bg-background">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">{member.name}</h3>
                <div className="text-primary font-medium mb-3 text-sm">{member.role}</div>
                <p className="text-sm text-muted-foreground">{member.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Het verhaal van Bizora
            </h2>
            <p className="text-xl text-muted-foreground">
              Van startup tot de boekhoudoplossing voor honderdduizenden ondernemers
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary"></div>
            <div className="space-y-12">
              {timeline.map((milestone, index) => (
                <div key={index} className="relative flex items-start space-x-6">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm relative z-10">
                    {milestone.year.slice(-2)}
                  </div>
                  <Card className="flex-1 p-6 shadow-sm border-border bg-background">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">{milestone.year}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Office & Contact */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Kom langs op ons kantoor
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Ons team werkt vanuit het hart van Amsterdam. 
                Kom gerust langs voor een koffie en een persoonlijke demo.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-foreground">Hoofdkantoor Amsterdam</div>
                    <div className="text-muted-foreground">
                      Herengracht 123<br />
                      1015 BG Amsterdam<br />
                      Nederland
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Email ons</div>
                    <div className="text-muted-foreground">hello@bizora.nl</div>
                  </div>
                </div>
              </div>

              <Button className="mt-8 bg-primary hover:bg-primary/90">
                Plan een bezoek
              </Button>
            </div>
            
            <Card className="p-8 shadow-sm border-border bg-background">
              <h3 className="text-2xl font-bold text-foreground mb-6">Stuur ons een bericht</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Naam</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    placeholder="Je volledige naam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    placeholder="je.email@bedrijf.nl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bericht</label>
                  <textarea 
                    rows={4}
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    placeholder="Waar kunnen we je mee helpen?"
                  ></textarea>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Verstuur bericht
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;