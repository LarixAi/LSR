import React from 'react';

const ResultsSection = () => {
  const results = [
    {
      percentage: '83%',
      description: 'Reduced time spent on inspections',
      company: 'STANLEY STEEMER'
    },
    {
      percentage: '48%',
      description: 'Saved on maintenance costs with Transentrix',
      company: 'SMART WATT'
    },
    {
      percentage: '10×',
      description: 'Reduced time spent on fleet reports',
      company: 'NEWKIRK'
    }
  ];

  return (
    <section id="results" className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold">
          Save time. Cut costs. Drive real results.
        </h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <div key={index} className="rounded-2xl border border-primary/30 bg-card p-8 shadow-lg">
              <div className="text-6xl font-black tracking-tight">{result.percentage}</div>
              <p className="mt-4 text-muted-foreground">{result.description}</p>
              <div className="mt-4 text-xs tracking-widest text-muted-foreground">
                {result.company}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;