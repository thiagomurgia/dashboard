import React, { useEffect } from 'react';
import { useTickets } from '../contexts/TicketsContext';

const AnalystProjection = () => {
  const { analystProjection, growthProjection, updateGrowthProjection, errors, filteredData, originalData } = useTickets();

  // Log para depuração
  useEffect(() => {
    console.log('AnalystProjection renderizado');
    console.log('Projeção:', analystProjection);
    console.log('Dados filtrados:', filteredData?.length || 0);
    console.log('Dados originais:', originalData?.length || 0);
  }, [analystProjection, filteredData, originalData]);

  const handleGrowthChange = (e) => {
    updateGrowthProjection(e.target.value);
  };

  // Verificar se há dados para renderizar
  const hasData = filteredData && filteredData.length > 0;

  // Renderização condicional com mensagem quando não há dados
  if (!hasData) {
    return (
      <div className="card">
        <h2 className="card-header">Projeção de Necessidade de Analistas</h2>
        <div className="p-6 text-center">
          <p className="text-gray-500">Carregue uma planilha para visualizar as projeções.</p>
          <p className="text-gray-400 text-sm mt-2">As projeções serão exibidas automaticamente após o processamento dos dados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-header">Projeção de Necessidade de Analistas</h2>
      
      <div className="mb-4 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Projeção de Crescimento de Tickets (%):
        </label>
        <input
          type="number"
          value={growthProjection}
          onChange={handleGrowthChange}
          className={`w-full p-2 border rounded-lg ${errors.growth ? 'border-red-500' : 'border-gray-300'}`}
          min="0"
        />
        {errors.growth && (
          <p className="text-red-500 text-sm mt-1">{errors.growth}</p>
        )}
      </div>
      
      {errors.growth ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">
            {errors.growth}
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p>
            Projeção com crescimento de <span className="font-semibold">{growthProjection}%</span> no volume de tickets
          </p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Nível de Suporte</th>
              <th className="py-2 px-4 border-b text-right">Tickets Atuais</th>
              <th className="py-2 px-4 border-b text-right">Tickets Projetados</th>
              <th className="py-2 px-4 border-b text-right">Analistas Atuais</th>
              <th className="py-2 px-4 border-b text-right">Analistas Necessários</th>
              <th className="py-2 px-4 border-b text-right">Analistas Adicionais</th>
            </tr>
          </thead>
          <tbody>
            {analystProjection && analystProjection.length > 0 ? (
              analystProjection.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-4 border-b">{item.level}</td>
                  <td className="py-2 px-4 border-b text-right">{item.currentTickets.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-4 border-b text-right">{item.projectedTickets.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-4 border-b text-right">{item.currentAnalysts}</td>
                  <td className="py-2 px-4 border-b text-right">{item.neededAnalysts}</td>
                  <td className="py-2 px-4 border-b text-right font-semibold">
                    {item.additionalAnalysts > 0 ? (
                      <span className="text-red-600">+{item.additionalAnalysts}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
                  Calculando projeções...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalystProjection;
