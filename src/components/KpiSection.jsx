import React, { useEffect } from 'react';
import { useTickets } from '../contexts/TicketsContext';

const KpiSection = () => {
  const { kpis, filteredData, originalData } = useTickets();

  // Log para depuração
  useEffect(() => {
    console.log('KpiSection renderizado');
    console.log('KPIs:', kpis);
    console.log('Dados filtrados:', filteredData?.length || 0);
    console.log('Dados originais:', originalData?.length || 0);
  }, [kpis, filteredData, originalData]);

  // Formatar números para exibição
  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  // Formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Verificar se há dados para renderizar
  const hasData = filteredData && filteredData.length > 0;

  // Renderização condicional com mensagem quando não há dados
  if (!hasData) {
    return (
      <div className="card">
        <h2 className="card-header">KPIs Essenciais</h2>
        <div className="p-6 text-center">
          <p className="text-gray-500">Carregue uma planilha para visualizar os KPIs.</p>
          <p className="text-gray-400 text-sm mt-2">Os indicadores serão exibidos automaticamente após o processamento dos dados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-header">KPIs Essenciais</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <span className="kpi-value text-blue-600">{formatNumber(kpis.totalTickets)}</span>
          <span className="kpi-label">Total de Tickets</span>
        </div>
        
        <div className="kpi-card">
          <span className="kpi-value text-indigo-600">
            {kpis.avgResolutionTime.toFixed(1)}h
          </span>
          <span className="kpi-label">Tempo Médio de Resolução</span>
        </div>
        
        <div className="kpi-card">
          <span className="kpi-value text-green-600">
            {kpis.resolutionRate.toFixed(1)}%
          </span>
          <span className="kpi-label">Taxa de Resolução</span>
        </div>
        
        <div className="kpi-card">
          <span className="kpi-value text-red-600">
            {formatCurrency(kpis.avgCostPerTicket)}
          </span>
          <span className="kpi-label">Custo Médio por Ticket Resolvido</span>
        </div>
      </div>
    </div>
  );
};

export default KpiSection;
