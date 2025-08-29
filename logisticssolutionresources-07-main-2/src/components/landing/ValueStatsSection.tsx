import React, { useEffect } from 'react';

const ValueStatsSection = () => {
  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '-35%', label: 'Admin time' },
    { value: '+22%', label: 'On-time KPI' },
    { value: '<5min', label: 'Defect → notify' }
  ];

  useEffect(() => {
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
    <section className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-2xl border border-border p-6 text-center bg-card reveal">
            <div className="text-3xl font-extrabold">{stat.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <style>{`
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
    </section>
  );
};

export default ValueStatsSection;