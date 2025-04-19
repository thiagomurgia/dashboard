import React from 'react';
import Header from '../src/components/Header';
import UploadSection from '../src/components/UploadSection';
import FilterSection from '../src/components/FilterSection';
import KpiSection from '../src/components/KpiSection';
import ChartSection from '../src/components/ChartSection';
import AnalystProjection from '../src/components/AnalystProjection';
import InsightsSection from '../src/components/InsightsSection';
import Footer from '../src/components/Footer';
import { TicketsProvider } from '../src/contexts/TicketsContext';

function App() {
  return (
    <TicketsProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <UploadSection />
          <FilterSection />
          <KpiSection />
          <ChartSection />
          <AnalystProjection />
          <InsightsSection />
        </main>
        <Footer />
      </div>
    </TicketsProvider>
  );
}

export default App;
