'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Target, BarChart3, Brain, ArrowRight, Mail } from 'lucide-react';
import Particles from '@/components/ui/particles';

export function BetaLandingPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary relative">
      <Particles className="fixed inset-0 -z-10" quantity={100} ease={80} color="#ffffff" refresh />
      <header className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Property Insight</span>
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="#features" className="text-muted-foreground hover:text-primary">
                Coming Soon
              </a>
            </li>
            <li>
              <a href="#cta" className="text-muted-foreground hover:text-primary">
                Join Beta
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up">
            The Future of <span className="text-primary">Property Insights</span> is Coming
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in-up animation-delay-200">
            Whether you're an investor, homeowner, or just curious about property trends, join our beta for exclusive
            access!
          </p>
          <Button size="lg" className="animate-fade-in-up animation-delay-400">
            Join Beta <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

        {/* Animated Feature Preview */}
        <section className="container mx-auto px-4 py-16">
          <div className="relative h-64 md:h-96 bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-bold text-primary">Coming Soon</div>
            </div>
            <div className="absolute top-4 left-4 animate-float">
              <Card className="w-48">
                <CardContent className="p-4">
                  <Search className="h-6 w-6 text-primary mb-2" />
                  <div className="text-sm font-semibold">Advanced Market Filter</div>
                  <Badge variant="secondary" className="mt-2">
                    In Development
                  </Badge>
                </CardContent>
              </Card>
            </div>
            <div className="absolute bottom-4 right-4 animate-float animation-delay-200">
              <Card className="w-48">
                <CardContent className="p-4">
                  <Target className="h-6 w-6 text-primary mb-2" />
                  <div className="text-sm font-semibold">Opportunity Finder</div>
                  <Badge variant="secondary" className="mt-2">
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
              <Card className="w-56">
                <CardContent className="p-4">
                  <Brain className="h-6 w-6 text-primary mb-2" />
                  <div className="text-sm font-semibold">AI Valuation</div>
                  <Badge variant="secondary" className="mt-2">
                    In Testing
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Upcoming Features */}
        <section id="features" className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Exciting Features on the Horizon</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="transform transition-all hover:scale-105">
              <CardContent className="p-6">
                <Search className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Property Search</h3>
                <p className="text-muted-foreground mb-4">
                  Find your dream home or next investment with our advanced filtering system, tailored to your specific
                  needs and preferences.
                </p>
                <Badge>Coming Soon</Badge>
              </CardContent>
            </Card>
            <Card className="transform transition-all hover:scale-105">
              <CardContent className="p-6">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Market Opportunity Alerts</h3>
                <p className="text-muted-foreground mb-4">
                  Stay ahead of the curve with personalized alerts on market trends, price changes, and investment
                  opportunities in your area of interest.
                </p>
                <Badge>In Development</Badge>
              </CardContent>
            </Card>
            <Card className="transform transition-all hover:scale-105">
              <CardContent className="p-6">
                <Brain className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI-Powered Valuations</h3>
                <p className="text-muted-foreground mb-4">
                  Get accurate property valuations based on the latest market data, whether you're buying, selling, or
                  just curious about your home's worth.
                </p>
                <Badge>Beta Testing</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Beta Tester Benefits */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Beta Tester Perks</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Early Access</h3>
                  <p className="text-muted-foreground">
                    Be the first to explore our innovative features and help shape the future of property insights for
                    everyone.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Exclusive Insights</h3>
                  <p className="text-muted-foreground">
                    Gain valuable knowledge on local market trends, whether you're an investor, homeowner, or simply
                    interested in property markets.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section id="cta" className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Be Part of the Property Insight Revolution</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join our exclusive beta program and help us create the ultimate property insights tool for everyone.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="max-w-xs"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Button size="lg" className="w-full sm:w-auto">
              Join Beta <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0 md:mr-4">
                  <h3 className="text-2xl font-semibold mb-2">Stay in the Loop</h3>
                  <p className="text-muted-foreground">
                    Get the latest updates on our beta program and launch information.
                  </p>
                </div>
                <div className="flex w-full md:w-auto">
                  <Input type="email" placeholder="Your email" className="w-full md:w-auto" />
                  <Button className="ml-2">
                    <Mail className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-muted mt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Property Insight Beta</h3>
              <p className="text-sm text-muted-foreground">Shaping the future of property investment tools.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contact</h4>
              <p className="text-sm text-muted-foreground">
                <Mail className="h-4 w-4 inline-block mr-2" />
                beta@propertyinsight.com
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Legal</h4>
              <ul className="text-sm text-muted-foreground">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Beta Agreement</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-muted-foreground/20 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Property Insight. All rights reserved. | Beta Version
          </div>
        </div>
      </footer>
    </div>
  );
}
