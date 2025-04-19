import React from 'react';
import { useTickets } from '../contexts/TicketsContext';

const FilterSection: React.FC = () => {
  const {
    dateRange,
    setDateRange,
    salaries,
    updateSalary,
    growthProjection,
    updateGrowthProjection,
    errors,
  } = useTickets();

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: new Date(value),
    }));
  };

  return (
    <div className="card space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
        Filtros e Configurações
      </h2>

      {/* Período + Esquema de cores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período de Análise
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input-field w-full"
              value={dateRange.startDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
            <span className="text-gray-500">→</span>
            <input
              type="date"
              className="input-field w-full"
              value={dateRange.endDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Esquema de Cores
          </label>
          <select className="input-field w-full">
            <option value="default">Padrão</option>
            <option value="viridis">Viridis</option>
            <option value="plasma">Plasma</option>
            <option value="inferno">Inferno</option>
            <option value="magma">Magma</option>
          </select>
        </div>
      </div>

      {/* Salários dos níveis */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Salários dos Analistas (R$)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['nivel_1', 'nivel_2', 'nivel_3'] as const).map(level => (
            <div key={level}>
              <label className="block text-sm text-gray-600 mb-1">
                {`Nível ${level.split('_')[1]}`}
              </label>
              <input
                type="number"
                className={`input-field w-full ${errors[level] ? 'border-red-500' : ''}`}
                value={salaries[level] || ''}
                onChange={(e) => updateSalary(level, e.target.value)}
                min="0"
                step="100"
              />
              {errors[level] && (
                <p className="text-xs text-red-500 mt-1">{errors[level]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Projeção de crescimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Projeção de Crescimento de Tickets (%)
          </label>
          <input
            type="number"
            className={`input-field w-full ${errors.growth ? 'border-red-500' : ''}`}
            value={growthProjection || ''}
            onChange={(e) => updateGrowthProjection(e.target.value)}
            min="0"
            max="100"
            step="5"
          />
          {errors.growth && (
            <p className="text-xs text-red-500 mt-1">{errors.growth}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
