import { Activity, Clock, MapPin, Phone, Shield, Users, Star, ArrowRight, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import doctor1 from "@/assets/doctor1.png";
import doctor2 from "@/assets/doctor2.png";
import doctor3 from "@/assets/doctor3.png";
import doctor4 from "@/assets/doctor4.png";

const doctors = [
  { name: "Dr. Rajesh Kumar", specialty: "General Physician", img: doctor1, available: true },
  { name: "Dr. Priya Sharma", specialty: "Gynecologist", img: doctor2, available: true },
  { name: "Dr. Amit Verma", specialty: "Pediatrician", img: doctor3, available: true },
  { name: "Dr. Sneha Patel", specialty: "Dermatologist", img: doctor4, available: true },
];

const features = [
  { icon: Clock, title: "24/7 AI Assistant", desc: "Book appointments anytime with our smart chatbot", color: "neon-text-cyan" },
  { icon: Shield, title: "Secure & Private", desc: "Your health data is encrypted and protected", color: "neon-text-green" },
  { icon: Users, title: "Expert Doctors", desc: "Trusted team of experienced specialists", color: "neon-text-pink" },
  { icon: Star, title: "Easy Scheduling", desc: "Book, reschedule or cancel in seconds", color: "neon-text-yellow" },
];

export default function LandingPage() {
  const [dark, setDark] = useState(true);
  const [activeDoctor, setActiveDoctor] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Auto-rotate doctor images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDoctor(prev => (prev + 1) % doctors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen stars-bg relative overflow-hidden">
      <div className="stars-layer" />
      <div className="stars-layer stars-layer-2" />
      <div className="stars-layer stars-layer-3" />

      {/* Nav */}
      <nav className="glass-panel border-b sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-cyan">
            <Activity className="w-5 h-5 neon-text-cyan" />
          </div>
          <span className="font-display text-sm sm:text-base font-bold neon-text-cyan tracking-wider">MEDI ASSIST</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            {dark ? <Sun className="w-4 h-4 neon-text-yellow" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
          <Link to="/login" className="text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 text-muted-foreground transition-colors">
            Doctor Login
          </Link>
          <Link to="/auth" className="text-[10px] sm:text-xs px-3 py-1.5 rounded-lg bg-primary/20 border neon-border-cyan neon-text-cyan font-display font-bold tracking-wider hover:bg-primary/30 transition-colors">
            Sign Up / Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-4 sm:px-8 py-12 sm:py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold neon-text-cyan leading-tight tracking-wider">
              Book Appointment<br />
              <span className="neon-text-green">With Trusted Doctors</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-md">
              Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free using our AI-powered chatbot.
            </p>
            <div className="flex gap-3 mt-6">
              <Link to="/auth" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan font-display text-sm font-bold neon-text-cyan tracking-wider hover:bg-primary/30 transition-all">
                Book Appointment <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <div className="flex -space-x-3">
                {doctors.map((d, i) => (
                  <img key={i} src={d.img} alt={d.name} className="w-10 h-10 rounded-full border-2 border-background object-cover" width={40} height={40} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Trusted by <span className="neon-text-green font-bold">1000+</span> patients</p>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-primary/20 to-neon-green/10 neon-glow-cyan flex items-center justify-center">
                <img src={doctor1} alt="Doctor" className="w-60 h-60 lg:w-68 lg:h-68 object-cover rounded-full" width={272} height={272} />
              </div>
              <div className="absolute -bottom-4 -right-4 glass-panel border neon-border-green rounded-xl px-4 py-2 animate-pulse-neon">
                <p className="text-xs neon-text-green font-display font-bold">● Available Now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 sm:px-8 py-12 max-w-6xl mx-auto">
        <h2 className="font-display text-lg sm:text-2xl font-bold neon-text-cyan text-center tracking-wider mb-8">Why Choose Us?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="glass-panel border neon-border-cyan rounded-xl p-4 text-center hover:scale-105 transition-transform">
              <f.icon className={`w-8 h-8 mx-auto mb-2 ${f.color}`} />
              <h3 className="font-display text-xs sm:text-sm font-bold text-foreground">{f.title}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Doctors */}
      <section className="relative z-10 px-4 sm:px-8 py-12 max-w-6xl mx-auto">
        <h2 className="font-display text-lg sm:text-2xl font-bold neon-text-cyan text-center tracking-wider mb-2">Top Doctors</h2>
        <p className="text-xs sm:text-sm text-muted-foreground text-center mb-8">Browse through our trusted specialists</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {doctors.map((d, i) => (
            <div key={i} className="glass-panel border neon-border-green rounded-xl overflow-hidden hover:scale-105 transition-transform">
              <div className="bg-gradient-to-b from-primary/10 to-transparent p-4 flex justify-center">
                <img src={d.img} alt={d.name} className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-lg" loading="lazy" width={144} height={144} />
              </div>
              <div className="p-3 text-center">
                <p className="text-[10px] neon-text-green flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Available</p>
                <h3 className="font-display text-xs sm:text-sm font-bold text-foreground mt-1">{d.name}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{d.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Policies */}
      <section className="relative z-10 px-4 sm:px-8 py-12 max-w-6xl mx-auto">
        <h2 className="font-display text-lg sm:text-2xl font-bold neon-text-cyan text-center tracking-wider mb-8">Hospital Policies</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Visitor Policy", desc: "Visitors allowed during 10 AM - 8 PM. Max 2 visitors per patient at a time.", icon: Users },
            { title: "Refund Policy", desc: "Full refund if appointment cancelled 24 hours before. 50% if within 24 hours.", icon: Shield },
            { title: "Emergency Protocol", desc: "24/7 emergency services available. Call our helpline for immediate assistance.", icon: Phone },
            { title: "Patient Privacy", desc: "All patient data is encrypted and HIPAA compliant. Your privacy is our priority.", icon: Shield },
            { title: "Appointment Rules", desc: "Please arrive 15 minutes before your scheduled time. Carry valid ID proof.", icon: Clock },
            { title: "Payment Options", desc: "We accept Cash, UPI, Cards, and all major insurance providers.", icon: Star },
          ].map((p, i) => (
            <div key={i} className="glass-panel border neon-border-pink rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <p.icon className="w-5 h-5 neon-text-pink" />
                <h3 className="font-display text-xs sm:text-sm font-bold text-foreground">{p.title}</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="relative z-10 px-4 sm:px-8 py-12 max-w-6xl mx-auto">
        <h2 className="font-display text-lg sm:text-2xl font-bold neon-text-cyan text-center tracking-wider mb-8">Contact Us</h2>
        <div className="glass-panel border neon-border-cyan rounded-xl p-6 max-w-lg mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 neon-text-green" />
              <div>
                <p className="text-xs font-bold text-foreground">Phone</p>
                <p className="text-xs text-muted-foreground">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 neon-text-pink" />
              <div>
                <p className="text-xs font-bold text-foreground">Address</p>
                <p className="text-xs text-muted-foreground">123 Medical Road, Sector 5, Near Central Market</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 neon-text-yellow" />
              <div>
                <p className="text-xs font-bold text-foreground">Timings</p>
                <p className="text-xs text-muted-foreground">Mon - Sat: 10:00 AM - 6:00 PM | Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-8 py-12 max-w-6xl mx-auto text-center">
        <div className="glass-panel border neon-border-green rounded-2xl p-8 sm:p-12">
          <h2 className="font-display text-lg sm:text-2xl font-bold neon-text-green tracking-wider mb-3">Ready to Book?</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md mx-auto">Create your free account and chat with our AI assistant to book an appointment instantly.</p>
          <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/20 border neon-border-green neon-glow-green font-display text-sm font-bold neon-text-green tracking-wider hover:bg-primary/30 transition-all">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 glass-panel border-t px-4 sm:px-8 py-6 text-center">
        <p className="text-[10px] sm:text-xs text-muted-foreground">© 2026 Mohd Kaif • Built with AI assistance</p>
      </footer>
    </div>
  );
}
