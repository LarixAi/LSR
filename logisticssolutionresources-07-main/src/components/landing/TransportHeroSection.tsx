import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const TransportHeroSection = () => {
  useEffect(() => {
    // Reveal on scroll animation
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('show');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    
    return () => {
      document.querySelectorAll('.reveal').forEach(el => io.unobserve(el));
    };
  }, []);

  return (
    <>
      <section id="home" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="reveal">
              <p className="inline-flex items-center text-xs uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
                PSV • School Transport • Council Contracts
              </p>
              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
                Run your transport business <span className="text-primary">smarter</span> — from jobs to compliance.
              </h1>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl">
                Assign drivers, manage routes, track MOT/service dates, capture defects, and share role-based portals with parents and councils.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link to="/auth">
                  <Button className="px-6 py-3 rounded-2xl shadow-lg shadow-primary/30 font-semibold">
                    Start free
                  </Button>
                </Link>
                <Link to="/auth#demo">
                  <Button variant="outline" className="px-6 py-3 rounded-2xl">
                    <Play className="w-4 h-4 mr-2" />
                    Watch 90-sec demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Product Mock */}
            <div className="relative reveal">
              <div className="aspect-video rounded-3xl bg-secondary border border-border p-2 shadow-2xl">
                <div className="h-full w-full rounded-2xl bg-background border border-border grid grid-rows-[auto,1fr] overflow-hidden">
                  <div className="h-10 border-b border-border flex items-center gap-2 px-3">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="w-3 h-3 rounded-full bg-muted"></span>
                    <span className="w-3 h-3 rounded-full bg-muted"></span>
                    <span className="ml-3 text-xs text-muted-foreground">Live board — Jobs · Vehicles · Compliance</span>
                  </div>
                  <div className="p-4 grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">Today's Jobs</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex justify-between"><span>School Run A</span><span className="text-muted-foreground">07:45</span></li>
                        <li className="flex justify-between"><span>Airport Transfer</span><span className="text-muted-foreground">10:00</span></li>
                        <li className="flex justify-between"><span>Private Hire</span><span className="text-muted-foreground">14:30</span></li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">Vehicle Alerts</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex justify-between"><span>MOT — BX12 ABC</span><span className="text-primary">Due in 7 days</span></li>
                        <li className="flex justify-between"><span>Service — ZR08 LMN</span><span className="text-muted-foreground">1,200 mi</span></li>
                        <li className="flex justify-between"><span>Insurance — KY65 PQR</span><span className="text-muted-foreground">Oct 10</span></li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-border p-3 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Compliance Feed</p>
                      <div className="mt-2 text-sm grid sm:grid-cols-3 gap-3">
                        <div className="rounded-lg bg-secondary p-3">Walk-around — BX12 ABC ✅</div>
                        <div className="rounded-lg bg-secondary p-3">Defect logged — mirror 🔧</div>
                        <div className="rounded-lg bg-secondary p-3">Tacho break alert ⏱️</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo Marquee */}
        <div className="overflow-hidden py-6 border-y border-border bg-secondary/30">
          <div className="flex gap-12 marquee whitespace-nowrap px-6 text-muted-foreground text-sm">
            <span>Volvo</span><span>Arriva</span><span>Transdev</span>
            <span>Go-Ahead</span><span>Stagecoach</span><span>Keolis</span>
            <span>Volvo</span><span>Arriva</span><span>Transdev</span>
            <span>Go-Ahead</span><span>Stagecoach</span><span>Keolis</span>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
        .marquee {
          animation: marquee 18s linear infinite;
        }
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: all 0.6s ease;
        }
        .reveal.show {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </>
  );
};

export default TransportHeroSection;