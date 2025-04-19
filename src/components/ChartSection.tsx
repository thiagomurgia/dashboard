import React, { useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTickets } from '../contexts/TicketsContext';

interface TicketByMonth {
  month: string;
  total: number;
}

interface TicketByLevel {
  name: string;
  value: number;
}

interface AnalystData {
  name: string;
  total: number;
  resolved: number;
}

interface ResolutionTimeData {
  name: string;
  avgTime: number;
}

const ChartSection: React.FC = () => {
  const { filteredData, originalData } = useTickets();

  useEffect(() => {
    console.log('ChartSection renderizado');
    console.log('Dados filtrados:', filteredData?.length || 0);
    console.log('Dados originais:', originalData?.length || 0);
  }, [filteredData, originalData]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const ticketsByMonth = useMemo<TicketByMonth[]>(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const tickets: Record<string, number> = {};
    filteredData.forEach(ticket => {
      if (ticket.month) {
        tickets[ticket.month] = (tickets[ticket.month] || 0) + 1;
      }
    });
    return Object.entries(tickets)
      .map(([month, total]) => ({
        month: month.substring(5) + '/' + month.substring(0, 4),
        total,
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split('/').map(Number);
        const [monthB, yearB] = b.month.split('/').map(Number);
        return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
      });
  }, [filteredData]);

  const ticketsByLevel = useMemo<TicketByLevel[]>(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const levels: Record<string, number> = {};
    filteredData.forEach(ticket => {
      if (ticket.supportLevel && ticket.supportLevel !== 'Outros') {
        levels[ticket.supportLevel] = (levels[ticket.supportLevel] || 0) + 1;
      }
    });
    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const analystPerformance = useMemo<AnalystData[]>(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const performance: Record<string, AnalystData> = {};
    filteredData.forEach(ticket => {
      if (ticket.Assignee) {
        if (!performance[ticket.Assignee]) {
          performance[ticket.Assignee] = {
            name: ticket.Assignee,
            total: 0,
            resolved: 0,
          };
        }
        performance[ticket.Assignee].total++;
        if (ticket.Resolved) performance[ticket.Assignee].resolved++;
      }
    });
    return Object.values(performance)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredData]);

  const resolutionTime = useMemo<ResolutionTimeData[]>(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const resolution: Record<string, { name: string; totalTime: number; count: number }> = {};
    filteredData.forEach(ticket => {
      if (ticket.Assignee && ticket.resolutionTimeHours) {
        if (!resolution[ticket.Assignee]) {
          resolution[ticket.Assignee] = {
            name: ticket.Assignee,
            totalTime: 0,
            count: 0,
          };
        }
        resolution[ticket.Assignee].totalTime += ticket.resolutionTimeHours;
        resolution[ticket.Assignee].count++;
      }
    });
    return Object.values(resolution)
      .map(({ name, totalTime, count }) => ({
        name,
        avgTime: totalTime / count,
      }))
      .sort((a, b) => a.avgTime - b.avgTime)
      .slice(0, 10);
  }, [filteredData]);

  const hasData = filteredData && filteredData.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="card">
          <h2 className="card-header">Gráficos</h2>
          <div className="p-6 text-center">
            <p className="text-gray-500">Carregue uma planilha para visualizar os gráficos.</p>
            <p className="text-gray-400 text-sm mt-2">Os gráficos serão exibidos automaticamente após o processamento dos dados.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="card-header">Volume de Tickets por Mês</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketsByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total de Tickets" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="card-header">Distribuição por Nível de Suporte</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketsByLevel}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {ticketsByLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} tickets`, 'Quantidade']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header">Desempenho por Analista</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analystPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total de Tickets" fill="#3b82f6" />
              <Bar dataKey="resolved" name="Tickets Resolvidos" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header">Tempo Médio de Resolução por Analista (horas)</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resolutionTime} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)} horas`, 'Tempo Médio']} />
              <Legend />
              <Bar dataKey="avgTime" name="Tempo Médio (horas)" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
