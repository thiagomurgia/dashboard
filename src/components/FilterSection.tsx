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
    <div className="card">
      <h2 className="card-header">Filtros e Configurações</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período de Análise:
          </label>
          <div className="flex space-x-4 items-center">
            <div className="flex-1">
              <input
                type="date"
                className="input-field"
                value={dateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </div>
            <span className="text-gray-500">→</span>
            <div className="flex-1">
              <input
                type="date"
                className="input-field"
                value={dateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Esquema de Cores:
          </label>
          <select className="input-field">
            <option value="default">Padrão</option>
            <option value="viridis">Viridis</option>
            <option value="plasma">Plasma</option>
            <option value="inferno">Inferno</option>
            <option value="magma">Magma</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Salários dos Analistas (R$):
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['nivel_1', 'nivel_2', 'nivel_3'] as const).map(level => (
            <div key={level}>
              <label className="block text-sm text-gray-600 mb-1">
                {`Nível ${level.split('_')[1]}:`}
              </label>
              <input
                type="number"
                className={`input-field ${errors[level] ? 'border-red-500' : ''}`}
                value={salaries[level] || ''}
                onChange={(e) => updateSalary(level, e.target.value)}
                min="0"
                step="100"
              />
              {errors[level] && <p className="error-message">{errors[level]}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Projeção de Crescimento de Tickets (%):
          </label>
          <input
            type="number"
            className={`input-field ${errors.growth ? 'border-red-500' : ''}`}
            value={growthProjection || ''}
            onChange={(e) => updateGrowthProjection(e.target.value)}
            min="0"
            max="100"
            step="5"
          />
          {errors.growth && <p className="error-message">{errors.growth}</p>}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
