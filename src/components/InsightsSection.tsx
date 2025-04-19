import React, { useEffect } from 'react';
import { useTickets } from '../contexts/TicketsContext';

const InsightsSection: React.FC = () => {
  const { insights, filteredData, originalData } = useTickets();

  useEffect(() => {
    console.log('InsightsSection renderizado');
    console.log('Insights:', insights);
    console.log('Dados filtrados:', filteredData?.length || 0);
    console.log('Dados originais:', originalData?.length || 0);
  }, [insights, filteredData, originalData]);

  const hasData = filteredData && filteredData.length > 0;

  if (!hasData) {
    return (
      <div className="card">
        <h2 className="card-header">Insights e Recomendações</h2>
        <div className="p-6 text-center">
          <p className="text-gray-500">Carregue uma planilha para visualizar os insights.</p>
          <p className="text-gray-400 text-sm mt-2">Os insights serão gerados automaticamente após o processamento dos dados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-header">Insights e Recomendações</h2>

      {!insights || insights.length === 0 ? (
        <div className="p-4 text-gray-500 text-center">
          Não há dados suficientes para gerar insights.
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                insight.type === 'efficiency'
                  ? 'bg-green-50 border border-green-200'
                  : insight.type === 'overload'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : insight.type === 'cost'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>

              {insight.type === 'recommendations' && Array.isArray(insight.content) ? (
                <ul className="list-disc pl-5 space-y-1">
                  {insight.content.map((recommendation: string, i: number) => (
                    <li key={i}>{recommendation}</li>
                  ))}
                </ul>
              ) : (
                <p>{insight.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightsSection;
