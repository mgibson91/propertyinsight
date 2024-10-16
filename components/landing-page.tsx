'use client';

import { Home, TrendingUp, Bell, Users } from 'lucide-react';
import Particles from '@/components/ui/particles';
import { Button, Heading, TextField } from '@radix-ui/themes';

export function LandingPageComponent() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col relative">
      <Particles className="fixed inset-0 -z-10" quantity={100} ease={80} color="#ffffff" refresh />
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-accent-text" />
            <span className="ml-2 text-xl font-bold text-accent-text">Property Insight</span>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-primary-text-contrast sm:text-5xl sm:tracking-tight lg:text-6xl">
            Navigate the Property Market with Confidence
          </h1>
          <p className="mt-5 text-xl text-primary-text max-w-3xl mx-auto">
            Join our limited beta and gain access to advanced market insights, ML-based valuations, and personalized
            alerts.
          </p>
          <form className="mt-8 flex flex-col items-center justify-center lg:flex-row lg:space-y-0 lg:space-x-4">
            <TextField.Root
              type="email"
              placeholder="Enter your email"
              className="w-full bg-accent-bg text-accent-text lg:max-w-[500px] lg:flex-grow"
            />
            <Button className="lg:w-auto">Claim Your Early Access Spot</Button>
          </form>
        </section>

        <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-accent-text" />}
              title="Advanced Market Search"
              description="Intuitive and powerful search tools to find the perfect property."
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6 text-accent-text" />}
              title="Smart Alerts"
              description="Get notified about great deals matching your criteria."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-accent-text" />}
              title="Collaborative Platform"
              description="Shape the future of property insights with your feedback."
            />
          </div>
        </section>

        <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-primary-text-contrast">Built With You, For You</h2>
          <p className="mt-4 text-lg text-primary-text max-w-3xl mx-auto">
            We're creating a unique platform where users are involved from the very beginning. Your input will shape our
            features, ensuring we build exactly what you need.
          </p>
        </section>

        <section className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-primary-text-contrast text-center mb-4">
            Join the Exclusive Beta
          </h2>
          <div className="text-center mb-8">
            <p className="text-6xl font-bold text-accent-solid mb-2">50</p>
            <p className="text-xl text-primary-text font-semibold mb-2">early access slots remaining</p>
            <p className="text-primary-text">Get exclusive benefits and shape the future of property insights.</p>
          </div>
          <form className="space-y-4 flex flex-col justify-center items-center lg:flex-row lg:space-y-0 lg:space-x-4">
            <TextField.Root
              type="email"
              placeholder="Enter your email"
              className="w-full bg-accent-bg text-accent-text lg:min-w-[500px] lg:flex-grow"
            />
            <Button size="2" type="submit" className="lg:w-auto">
              Secure Your Early Access
            </Button>
          </form>
        </section>
      </main>

      <footer className="bg-transparent">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-accent-text text-sm">© 2024 Property Insight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg p-8 relative shadow-lg transition-transform transform hover:scale-105">
      <div className="rounded-lg absolute w-full h-full bg-gradient-to-r from-accent-bg to-accent-bg-dark opacity-60 z-[-1]"></div>
      <div className={'flex flex-col gap-2 p-6'}>
        <div className="flex items-center justify-center w-14 h-14 bg-accent-bg-subtle rounded-full mb-4">{icon}</div>
        <Heading>{title}</Heading>
        <p className="text-primary-text">{description}</p>
      </div>
    </div>
  );
}
