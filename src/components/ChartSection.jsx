import React, { useMemo, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTickets } from '../contexts/TicketsContext';

const ChartSection = () => {
  const { filteredData, originalData } = useTickets();
  
  // Log para depuração
  useEffect(() => {
    console.log('ChartSection renderizado');
    console.log('Dados filtrados:', filteredData?.length || 0);
    console.log('Dados originais:', originalData?.length || 0);
  }, [filteredData, originalData]);
  
  // Cores para os gráficos
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  // Preparar dados para gráfico de tickets por mês usando useMemo
  const ticketsByMonth = useMemo(() => {
    console.log('Calculando tickets por mês');
    if (!filteredData || filteredData.length === 0) {
      console.log('Sem dados para tickets por mês');
      return [];
    }
    
    const ticketsByMonth = {};
    
    filteredData.forEach(ticket => {
      if (ticket.month) {
        if (!ticketsByMonth[ticket.month]) {
          ticketsByMonth[ticket.month] = 0;
        }
        ticketsByMonth[ticket.month]++;
      }
    });
    
    const result = Object.entries(ticketsByMonth).map(([month, total]) => ({
      month: month.substring(5) + '/' + month.substring(0, 4),
      total
    })).sort((a, b) => {
      const [monthA, yearA] = a.month.split('/');
      const [monthB, yearB] = b.month.split('/');
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });
    
    console.log('Tickets por mês calculados:', result.length);
    return result;
  }, [filteredData]);
  
  // Preparar dados para gráfico de distribuição por nível usando useMemo
  const ticketsByLevel = useMemo(() => {
    console.log('Calculando tickets por nível');
    if (!filteredData || filteredData.length === 0) {
      console.log('Sem dados para tickets por nível');
      return [];
    }
    
    const ticketsByLevel = {};
    
    filteredData.forEach(ticket => {
      if (ticket.supportLevel) {
        if (!ticketsByLevel[ticket.supportLevel]) {
          ticketsByLevel[ticket.supportLevel] = 0;
        }
        ticketsByLevel[ticket.supportLevel]++;
      }
    });
    
    const result = Object.entries(ticketsByLevel)
      .filter(([level]) => level !== 'Outros')
      .map(([name, value]) => ({ name, value }));
    
    console.log('Tickets por nível calculados:', result.length);
    return result;
  }, [filteredData]);
  
  // Preparar dados para gráfico de desempenho por analista usando useMemo
  const analystPerformance = useMemo(() => {
    console.log('Calculando desempenho por analista');
    if (!filteredData || filteredData.length === 0) {
      console.log('Sem dados para desempenho por analista');
      return [];
    }
    
    const analystPerformance = {};
    
    filteredData.forEach(ticket => {
      if (ticket.Assignee) {
        if (!analystPerformance[ticket.Assignee]) {
          analystPerformance[ticket.Assignee] = {
            name: ticket.Assignee,
            total: 0,
            resolved: 0
          };
        }
        
        analystPerformance[ticket.Assignee].total++;
        
        if (ticket.Resolved) {
          analystPerformance[ticket.Assignee].resolved++;
        }
      }
    });
    
    const result = Object.values(analystPerformance)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Mostrar apenas os 10 principais analistas
    
    console.log('Desempenho por analista calculado:', result.length);
    return result;
  }, [filteredData]);
  
  // Preparar dados para gráfico de tempo de resolução usando useMemo
  const resolutionTime = useMemo(() => {
    console.log('Calculando tempo de resolução');
    if (!filteredData || filteredData.length === 0) {
      console.log('Sem dados para tempo de resolução');
      return [];
    }
    
    const resolutionTime = {};
    
    filteredData.forEach(ticket => {
      if (ticket.Assignee && ticket.resolutionTimeHours) {
        if (!resolutionTime[ticket.Assignee]) {
          resolutionTime[ticket.Assignee] = {
            name: ticket.Assignee,
            totalTime: 0,
            count: 0
          };
        }
        
        resolutionTime[ticket.Assignee].totalTime += ticket.resolutionTimeHours;
        resolutionTime[ticket.Assignee].count++;
      }
    });
    
    const result = Object.values(resolutionTime)
      .map(analyst => ({
        name: analyst.name,
        avgTime: analyst.totalTime / analyst.count
      }))
      .sort((a, b) => a.avgTime - b.avgTime)
      .slice(0, 10); // Mostrar apenas os 10 principais analistas
    
    console.log('Tempo de resolução calculado:', result.length);
    return result;
  }, [filteredData]);
  
  // Verificar se há dados para renderizar
  const hasData = filteredData && filteredData.length > 0;
  
  // Renderização condicional com mensagem quando não há dados
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
              <BarChart
                data={ticketsByMonth}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
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
                <Tooltip formatter={(value) => [`${value} tickets`, 'Quantidade']} />
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
            <BarChart
              data={analystPerformance}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              layout="vertical"
            >
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
            <BarChart
              data={resolutionTime}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value) => [`${value.toFixed(1)} horas`, 'Tempo Médio']} />
              <Legend />
              <Bar 
                dataKey="avgTime" 
                name="Tempo Médio (horas)" 
                fill="#f59e0b"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
