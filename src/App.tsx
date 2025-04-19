import React from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import FilterSection from './components/FilterSection';
import KpiSection from './components/KpiSection';
import ChartSection from './components/ChartSection';
import AnalystProjection from './components/AnalystProjection'
import InsightsSection from './components/InsightsSection';
import Footer from './components/Footer';
import { TicketsProvider } from './contexts/TicketsContext';

function App() {
  return (
    <TicketsProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6 min-h-screen">
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
