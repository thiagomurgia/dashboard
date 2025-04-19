import React, { useEffect } from 'react';
import { useTickets } from '../contexts/TicketsContext';

const KpiSection: React.FC = () => {
  const { kpis, filteredData, originalData } = useTickets();

  // Logs de depuração
  useEffect(() => {
    console.log('KpiSection renderizado');
    console.log('KPIs:', kpis);
    console.log('Dados filtrados:', filteredData?.length || 0);
    console.log('Dados originais:', originalData?.length || 0);
  }, [kpis, filteredData, originalData]);

  // Formatação de número
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  // Formatação de moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const hasData = filteredData && filteredData.length > 0;

  // Estado vazio
  if (!hasData) {
    return (
      <div className="card">
        <h2 className="card-header">KPIs Essenciais</h2>
        <div className="p-6 text-center">
          <p className="text-gray-500">Carregue uma planilha para visualizar os KPIs.</p>
          <p className="text-gray-400 text-sm mt-2">
            Os indicadores serão exibidos automaticamente após o processamento dos dados.
          </p>
        </div>
      </div>
    );
  }

  // Exibição dos KPIs
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
        KPIs Essenciais
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow-sm">
          <span className="text-2xl font-bold text-blue-600">
            {formatNumber(kpis.totalTickets)}
          </span>
          <span className="text-sm text-gray-600 mt-1">Total de Tickets</span>
        </div>

        <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg shadow-sm">
          <span className="text-2xl font-bold text-indigo-600">
            {kpis.avgResolutionTime.toFixed(1)}h
          </span>
          <span className="text-sm text-gray-600 mt-1">Tempo Médio de Resolução</span>
        </div>

        <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg shadow-sm">
          <span className="text-2xl font-bold text-green-600">
            {kpis.resolutionRate.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-600 mt-1">Taxa de Resolução</span>
        </div>

        <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg shadow-sm">
          <span className="text-2xl font-bold text-red-600">
            {formatCurrency(kpis.avgCostPerTicket)}
          </span>
          <span className="text-sm text-gray-600 mt-1">Custo Médio por Ticket Resolvido</span>
        </div>
      </div>
    </div>
  );
};

export default KpiSection;
