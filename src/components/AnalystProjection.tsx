import React, { useEffect } from 'react';
import { useTickets } from '../contexts/TicketsContext';

const AnalystProjection: React.FC = () => {
  const {
    analystProjection,
    growthProjection,
    updateGrowthProjection,
    errors,
    filteredData,
    originalData,
  } = useTickets();

  // Log para depuração
  useEffect(() => {
    console.log('AnalystProjection renderizado');
    console.log('Projeção:', analystProjection);
    console.log('Dados filtrados:', filteredData?.length || 0);
    console.log('Dados originais:', originalData?.length || 0);
  }, [analystProjection, filteredData, originalData]);

  const handleGrowthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateGrowthProjection(e.target.value);
  };

  const hasData = filteredData && filteredData.length > 0;

  if (!hasData) {
    return (
      <div className="card">
        <h2 className="card-header">Projeção de Necessidade de Analistas</h2>
        <div className="p-6 text-center text-gray-500">
          <p>Carregue uma planilha para visualizar as projeções.</p>
          <p className="text-sm text-gray-400 mt-2">
            As projeções serão exibidas automaticamente após o processamento dos dados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-header mb-6 text-xl font-semibold text-gray-800">
        Projeção de Necessidade de Analistas
      </h2>

      {/* Campo de projeção de crescimento */}
      <div className="mb-6">
        <label htmlFor="growth-input" className="block text-sm font-medium text-gray-700 mb-1">
          Projeção de Crescimento de Tickets (%):
        </label>
        <input
          id="growth-input"
          type="number"
          value={growthProjection}
          onChange={handleGrowthChange}
          className={`w-full p-2 rounded-md border transition duration-300 outline-none focus:ring-2 ${
            errors.growth ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
          }`}
          min={0}
          max={100}
        />
        {errors.growth && (
          <p className="text-red-500 text-sm mt-1">{errors.growth}</p>
        )}
      </div>

      {/* Banner de crescimento */}
      {!errors.growth && (
        <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-4 py-3 mb-6 shadow-sm">
          Projeção com crescimento de <span className="font-bold">{growthProjection}%</span> no volume de tickets
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Nível de Suporte</th>
              <th className="px-4 py-3 text-right">Tickets Atuais</th>
              <th className="px-4 py-3 text-right">Tickets Projetados</th>
              <th className="px-4 py-3 text-right">Analistas Atuais</th>
              <th className="px-4 py-3 text-right">Necessários</th>
              <th className="px-4 py-3 text-right">Adicionais</th>
            </tr>
          </thead>
          <tbody>
            {analystProjection && analystProjection.length > 0 ? (
              analystProjection.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium">{item.level}</td>
                  <td className="px-4 py-3 text-right">{item.currentTickets.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right">{item.projectedTickets.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right">{item.currentAnalysts}</td>
                  <td className="px-4 py-3 text-right">{item.neededAnalysts}</td>
                  <td className="px-4 py-3 text-right font-semibold">
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
                <td colSpan={6} className="px-4 py-4 text-center italic text-gray-500">
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
