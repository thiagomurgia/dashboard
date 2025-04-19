import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';

// Contexto para gerenciar os dados dos tickets
const TicketsContext = createContext();

// Níveis de suporte predefinidos
const SUPPORT_LEVELS = {
  'nivel_1': ['Matheus Paleari', 'Vitor Pereira', 'Arthur Domingues', 'Paulo Bonella', 'Rafael Purgly', 'Thiago Murgia', 'Lucas Bergamin', 'Welington Lara'],
  'nivel_2': ['Laura almeida', 'Valdinei Costa', 'Luiz Magalhães', 'Emerson Melo', 'Luan Viana', 'Karina Apolinario', 'Carol Rodrigues', 'Rodolfo Santana', 'Gabriel Faria', 'Daniella Ponciano'],
  'nivel_3': ['Agatha Anunciação']
};

export const TicketsProvider = ({ children }) => {
  // Estado para forçar atualizações
  const [forceUpdate, setForceUpdate] = useState(0);
  // Estado para armazenar os dados originais e filtrados
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Estado para armazenar as configurações de filtro
  const [dateRange, setDateRange] = useState({
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-04-17')
  });
  
  // Estado para armazenar os salários dos analistas
  const [salaries, setSalaries] = useState({
    nivel_1: 3000,
    nivel_2: 4500,
    nivel_3: 6000
  });
  
  // Estado para armazenar a projeção de crescimento
  const [growthProjection, setGrowthProjection] = useState(10);
  
  // Estado para armazenar os erros
  const [errors, setErrors] = useState({});
  
  // Estado para armazenar o arquivo carregado
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Função para processar o arquivo Excel
  const processExcelFile = (file) => {
    console.log('===== INÍCIO DO PROCESSAMENTO DE ARQUIVO =====');
    console.log('Arquivo recebido:', file.name);
    
    // Limpar dados anteriores para forçar a atualização dos componentes
    setOriginalData([]);
    setFilteredData([]);
    console.log('Dados anteriores limpos');
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('Arquivo carregado, iniciando processamento');
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        console.log('Nome da planilha:', sheetName);
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('Dados JSON extraídos:', jsonData.length, 'registros');
        console.log('Amostra de dados:', jsonData.slice(0, 2));
        
        if (jsonData.length === 0) {
          throw new Error('A planilha não contém dados');
        }
        
        // Verificar estrutura dos dados
        const firstRow = jsonData[0];
        console.log('Estrutura da primeira linha:', Object.keys(firstRow));
        
        // Verificar campos obrigatórios
        const requiredFields = ['Assignee', 'Created', 'Resolved'];
        const missingFields = requiredFields.filter(field => !Object.keys(firstRow).includes(field));
        
        if (missingFields.length > 0) {
          console.error('Campos obrigatórios ausentes:', missingFields);
          throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}. A planilha deve conter os campos: Assignee, Created e Resolved.`);
        }
        
        // Processar os dados
        console.log('Iniciando processamento dos dados...');
        const processedData = jsonData.map((row, index) => {
          // Converter datas
          const created = row.Created ? new Date(row.Created) : null;
          const resolved = row.Resolved ? new Date(row.Resolved) : null;
          
          // Calcular tempo de resolução em horas
          const resolutionTimeHours = created && resolved 
            ? (resolved - created) / (1000 * 60 * 60) 
            : null;
          
          // Determinar nível de suporte
          let supportLevel = 'Outros';
          if (row.Assignee) {
            if (SUPPORT_LEVELS.nivel_1.includes(row.Assignee)) {
              supportLevel = 'Nível 1';
            } else if (SUPPORT_LEVELS.nivel_2.includes(row.Assignee)) {
              supportLevel = 'Nível 2';
            } else if (SUPPORT_LEVELS.nivel_3.includes(row.Assignee)) {
              supportLevel = 'Nível 3';
            }
          }
          
          // Log para as primeiras 5 linhas
          if (index < 5) {
            console.log(`Linha ${index+1} processada:`, {
              assignee: row.Assignee,
              created: created,
              resolved: resolved,
              supportLevel: supportLevel,
              resolutionTime: resolutionTimeHours
            });
          }
          
          return {
            ...row,
            Created: created,
            Resolved: resolved,
            resolutionTimeHours,
            supportLevel,
            month: created ? created.toISOString().substring(0, 7) : null // Formato YYYY-MM
          };
        });
        
        console.log('Processamento concluído:', processedData.length, 'registros processados');
        
        // Atualizar dados imediatamente e depois novamente após um atraso
        // Isso garante que os dados sejam atualizados mesmo que o setTimeout falhe
        console.log('Atualizando dados imediatamente...');
        setOriginalData(processedData);
        setUploadedFile(file.name);
        applyFilters(processedData, dateRange);
        
        // Incrementar forceUpdate para forçar re-renderização de todos os componentes
        setForceUpdate(prev => prev + 1);
        console.log('ForceUpdate incrementado:', forceUpdate + 1);
        
        // Atualizar novamente após um atraso para garantir que a UI seja atualizada
        console.log('Agendando atualização adicional após 100ms...');
        setTimeout(() => {
          console.log('Executando atualização agendada...');
          // Forçar uma nova referência de array para garantir que o React detecte a mudança
          setOriginalData([...processedData]);
          setUploadedFile(file.name);
          applyFilters([...processedData], dateRange);
          
          // Incrementar forceUpdate novamente
          setForceUpdate(prev => prev + 1);
          console.log('ForceUpdate incrementado novamente:', forceUpdate + 2);
          
          // Limpar erros relacionados ao upload
          setErrors(prev => ({...prev, upload: null}));
          
          console.log(`Processados ${processedData.length} tickets do arquivo ${file.name}`);
          console.log('===== FIM DO PROCESSAMENTO DE ARQUIVO =====');
        }, 100);
      } catch (error) {
        console.error('Erro ao processar o arquivo:', error);
        setErrors(prev => ({
          ...prev, 
          upload: 'Erro ao processar o arquivo. Verifique se o formato é válido.'
        }));
      }
    };
    
    reader.onerror = () => {
      setErrors(prev => ({
        ...prev, 
        upload: 'Erro ao ler o arquivo. Tente novamente.'
      }));
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  // Função para aplicar filtros aos dados
  const applyFilters = (data, range) => {
    console.log('===== APLICANDO FILTROS =====');
    console.log('Dados recebidos para filtrar:', data ? data.length : 0, 'registros');
    
    if (!data || data.length === 0) {
      console.log('Sem dados para filtrar, retornando');
      return;
    }
    
    console.log('Intervalo de datas:', range.startDate, 'até', range.endDate);
    
    const filtered = data.filter(ticket => {
      // Filtrar por data
      if (ticket.Created && range.startDate && range.endDate) {
        return ticket.Created >= range.startDate && ticket.Created <= range.endDate;
      }
      return true;
    });
    
    console.log('Dados filtrados:', filtered.length, 'registros');
    console.log('Amostra de dados filtrados:', filtered.slice(0, 2));
    
    // Forçar uma nova referência de array para garantir que o React detecte a mudança
    setFilteredData([...filtered]);
    console.log('===== FILTROS APLICADOS =====');
  };
  
  // Efeito para aplicar filtros quando os dados ou o intervalo de datas mudam
  useEffect(() => {
    console.log('useEffect para aplicar filtros acionado');
    if (originalData && originalData.length > 0) {
      console.log('Aplicando filtros aos dados originais:', originalData.length, 'registros');
      applyFilters(originalData, dateRange);
    }
  }, [originalData, dateRange]);
  
  // Efeito para forçar atualização dos componentes quando os dados mudam
  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      console.log('Dados filtrados atualizados, forçando re-renderização');
      setForceUpdate(prev => prev + 1);
    }
  }, [filteredData]);
  
  // Função para atualizar os salários com validação
  const updateSalary = (level, value) => {
    // Validar entrada
    if (value === '' || isNaN(value)) {
      setSalaries(prev => ({...prev, [level]: 0}));
      setErrors(prev => ({
        ...prev, 
        [level]: 'O salário deve ser um número válido'
      }));
      return;
    }
    
    const numValue = Number(value);
    if (numValue < 0) {
      setSalaries(prev => ({...prev, [level]: 0}));
      setErrors(prev => ({
        ...prev, 
        [level]: 'O salário não pode ser negativo'
      }));
      return;
    }
    
    // Atualizar salário e limpar erro
    setSalaries(prev => ({...prev, [level]: numValue}));
    setErrors(prev => {
      const newErrors = {...prev};
      delete newErrors[level];
      return newErrors;
    });
  };
  
  // Função para atualizar a projeção de crescimento com validação
  const updateGrowthProjection = (value) => {
    // Validar entrada
    if (value === '' || isNaN(value)) {
      setGrowthProjection(0);
      setErrors(prev => ({
        ...prev, 
        growth: 'A projeção deve ser um número válido'
      }));
      return;
    }
    
    const numValue = Number(value);
    if (numValue < 0) {
      setGrowthProjection(0);
      setErrors(prev => ({
        ...prev, 
        growth: 'A projeção não pode ser negativa'
      }));
      return;
    }
    
    // Atualizar projeção e limpar erro
    setGrowthProjection(numValue);
    setErrors(prev => {
      const newErrors = {...prev};
      delete newErrors.growth;
      return newErrors;
    });
  };
  
  // Calcular KPIs usando useMemo para memoização
  const kpis = useMemo(() => {
    console.log('===== CALCULANDO KPIs =====');
    console.log('Dados filtrados disponíveis:', filteredData ? filteredData.length : 0, 'registros');
    
    if (!filteredData || filteredData.length === 0) {
      console.log('Sem dados para calcular KPIs, retornando valores padrão');
      return {
        totalTickets: 0,
        avgResolutionTime: 0,
        resolutionRate: 0,
        avgCostPerTicket: 0
      };
    }
    
    const totalTickets = filteredData.length;
    console.log('Total de tickets:', totalTickets);
    
    // Tickets resolvidos
    const resolvedTickets = filteredData.filter(ticket => ticket.Resolved);
    console.log('Tickets resolvidos:', resolvedTickets.length);
    
    const resolutionRate = (resolvedTickets.length / totalTickets) * 100;
    console.log('Taxa de resolução:', resolutionRate.toFixed(2) + '%');
    
    // Tempo médio de resolução
    const avgResolutionTime = resolvedTickets.reduce(
      (sum, ticket) => sum + (ticket.resolutionTimeHours || 0), 
      0
    ) / (resolvedTickets.length || 1);
    console.log('Tempo médio de resolução:', avgResolutionTime.toFixed(2) + 'h');
    
    // Calcular custo por ticket resolvido por nível
    const ticketsByLevel = {};
    resolvedTickets.forEach(ticket => {
      if (!ticketsByLevel[ticket.supportLevel]) {
        ticketsByLevel[ticket.supportLevel] = 0;
      }
      ticketsByLevel[ticket.supportLevel]++;
    });
    
    console.log('Distribuição de tickets por nível:', ticketsByLevel);
    
    // Mapear níveis para salários
    const levelToSalary = {
      'Nível 1': salaries.nivel_1,
      'Nível 2': salaries.nivel_2,
      'Nível 3': salaries.nivel_3,
      'Outros': (salaries.nivel_1 + salaries.nivel_2 + salaries.nivel_3) / 3
    };
    
    console.log('Salários por nível:', levelToSalary);
    
    // Calcular custo por ticket por nível
    let totalCost = 0;
    Object.entries(ticketsByLevel).forEach(([level, count]) => {
      if (count > 0) {
        totalCost += (levelToSalary[level] || 0) / count * count;
      }
    });
    
    const avgCostPerTicket = totalCost / (resolvedTickets.length || 1);
    console.log('Custo médio por ticket:', avgCostPerTicket.toFixed(2));
    
    const result = {
      totalTickets,
      avgResolutionTime,
      resolutionRate,
      avgCostPerTicket
    };
    
    console.log('KPIs calculados:', result);
    console.log('===== FIM DO CÁLCULO DE KPIs =====');
    
    return result;
  }, [filteredData, salaries]);
  
  // Calcular projeção de analistas usando useMemo
  const analystProjection = useMemo(() => {
    console.log('===== CALCULANDO PROJEÇÃO DE ANALISTAS =====');
    console.log('Dados filtrados disponíveis:', filteredData ? filteredData.length : 0, 'registros');
    
    if (!filteredData || filteredData.length === 0) {
      console.log('Sem dados para calcular projeções, retornando array vazio');
      return [];
    }
    
    // Agrupar tickets por nível de suporte
    const ticketsByLevel = {};
    filteredData.forEach(ticket => {
      if (!ticketsByLevel[ticket.supportLevel]) {
        ticketsByLevel[ticket.supportLevel] = {
          total: 0,
          resolved: 0
        };
      }
      ticketsByLevel[ticket.supportLevel].total++;
      if (ticket.Resolved) {
        ticketsByLevel[ticket.supportLevel].resolved++;
      }
    });
    
    // Contar analistas por nível
    const analystsByLevel = {
      'Nível 1': SUPPORT_LEVELS.nivel_1.length,
      'Nível 2': SUPPORT_LEVELS.nivel_2.length,
      'Nível 3': SUPPORT_LEVELS.nivel_3.length,
      'Outros': 0
    };
    
    // Calcular dias no período
    const days = Math.max(
      1, 
      Math.ceil((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24))
    );
    
    // Calcular projeção
    const projection = Object.entries(ticketsByLevel)
      .filter(([level]) => level !== 'Outros') // Excluir "Outros" da projeção
      .map(([level, data]) => {
        const currentTickets = data.total;
        const ticketsPerDay = currentTickets / days;
        const projectedTickets = ticketsPerDay * (1 + growthProjection / 100) * days;
        
        // Capacidade por analista (10 tickets por dia é considerado adequado)
        const analystCapacity = 10 * days;
        const currentAnalysts = analystsByLevel[level] || 0;
        const neededAnalysts = Math.ceil(projectedTickets / analystCapacity);
        const additionalAnalysts = Math.max(0, neededAnalysts - currentAnalysts);
        
        return {
          level,
          currentTickets,
          projectedTickets: Math.round(projectedTickets),
          currentAnalysts,
          neededAnalysts,
          additionalAnalysts
        };
      });
    
    return projection;
  }, [filteredData, dateRange, growthProjection]);
  
  // Gerar insights dinâmicos usando useMemo
  const insights = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }
    
    const insightsList = [];
    
    // Analista mais eficiente
    const analystPerformance = {};
    filteredData.forEach(ticket => {
      if (!ticket.Assignee || !ticket.Resolved) return;
      
      if (!analystPerformance[ticket.Assignee]) {
        analystPerformance[ticket.Assignee] = {
          resolved: 0,
          totalTime: 0
        };
      }
      
      analystPerformance[ticket.Assignee].resolved++;
      analystPerformance[ticket.Assignee].totalTime += ticket.resolutionTimeHours || 0;
    });
    
    // Calcular eficiência (tickets resolvidos / tempo médio)
    Object.keys(analystPerformance).forEach(analyst => {
      const avgTime = analystPerformance[analyst].totalTime / analystPerformance[analyst].resolved;
      analystPerformance[analyst].efficiency = analystPerformance[analyst].resolved / avgTime;
    });
    
    // Encontrar o analista mais eficiente
    let mostEfficientAnalyst = null;
    let highestEfficiency = 0;
    
    Object.entries(analystPerformance).forEach(([analyst, data]) => {
      if (data.efficiency > highestEfficiency && data.resolved > 10) { // Mínimo de 10 tickets para considerar
        highestEfficiency = data.efficiency;
        mostEfficientAnalyst = {
          name: analyst,
          resolved: data.resolved,
          avgTime: data.totalTime / data.resolved
        };
      }
    });
    
    if (mostEfficientAnalyst) {
      insightsList.push({
        type: 'efficiency',
        title: 'Analista mais eficiente',
        content: `${mostEfficientAnalyst.name} - resolve ${mostEfficientAnalyst.resolved} tickets com tempo médio de ${mostEfficientAnalyst.avgTime.toFixed(1)} horas.`
      });
    }
    
    // Nível mais sobrecarregado
    const levelPerformance = {};
    filteredData.forEach(ticket => {
      if (!ticket.supportLevel) return;
      
      if (!levelPerformance[ticket.supportLevel]) {
        levelPerformance[ticket.supportLevel] = {
          total: 0,
          resolved: 0,
          totalTime: 0
        };
      }
      
      levelPerformance[ticket.supportLevel].total++;
      if (ticket.Resolved) {
        levelPerformance[ticket.supportLevel].resolved++;
        levelPerformance[ticket.supportLevel].totalTime += ticket.resolutionTimeHours || 0;
      }
    });
    
    // Calcular tempo médio e taxa de resolução por nível
    Object.keys(levelPerformance).forEach(level => {
      if (levelPerformance[level].resolved > 0) {
        levelPerformance[level].avgTime = 
          levelPerformance[level].totalTime / levelPerformance[level].resolved;
        levelPerformance[level].resolutionRate = 
          (levelPerformance[level].resolved / levelPerformance[level].total) * 100;
      } else {
        levelPerformance[level].avgTime = 0;
        levelPerformance[level].resolutionRate = 0;
      }
    });
    
    // Encontrar o nível mais sobrecarregado (maior tempo médio)
    let mostOverloadedLevel = null;
    let highestAvgTime = 0;
    
    Object.entries(levelPerformance).forEach(([level, data]) => {
      if (level !== 'Outros' && data.avgTime > highestAvgTime) {
        highestAvgTime = data.avgTime;
        mostOverloadedLevel = {
          name: level,
          avgTime: data.avgTime,
          resolutionRate: data.resolutionRate
        };
      }
    });
    
    if (mostOverloadedLevel) {
      insightsList.push({
        type: 'overload',
        title: 'Nível mais sobrecarregado',
        content: `${mostOverloadedLevel.name} - tempo médio de resolução de ${mostOverloadedLevel.avgTime.toFixed(1)} horas e taxa de resolução de ${mostOverloadedLevel.resolutionRate.toFixed(1)}%.`
      });
    }
    
    // Melhor custo-benefício
    const levelCost = {};
    const levelToSalary = {
      'Nível 1': salaries.nivel_1,
      'Nível 2': salaries.nivel_2,
      'Nível 3': salaries.nivel_3
    };
    
    Object.entries(levelPerformance).forEach(([level, data]) => {
      if (level !== 'Outros' && data.resolved > 0 && levelToSalary[level]) {
        levelCost[level] = levelToSalary[level] / data.resolved;
      }
    });
    
    // Encontrar o nível com melhor custo-benefício
    let bestValueLevel = null;
    let lowestCost = Infinity;
    
    Object.entries(levelCost).forEach(([level, cost]) => {
      if (cost < lowestCost) {
        lowestCost = cost;
        bestValueLevel = {
          name: level,
          cost
        };
      }
    });
    
    if (bestValueLevel) {
      insightsList.push({
        type: 'cost',
        title: 'Melhor custo-benefício',
        content: `${bestValueLevel.name} - custo médio por ticket de R$ ${bestValueLevel.cost.toFixed(2)}.`
      });
    }
    
    // Recomendações
    const recommendations = [];
    
    // Verificar níveis sobrecarregados
    Object.entries(levelPerformance).forEach(([level, data]) => {
      if (level !== 'Outros') {
        const analysts = level === 'Nível 1' ? SUPPORT_LEVELS.nivel_1.length :
                        level === 'Nível 2' ? SUPPORT_LEVELS.nivel_2.length :
                        level === 'Nível 3' ? SUPPORT_LEVELS.nivel_3.length : 0;
        
        const ticketsPerAnalyst = data.total / (analysts || 1);
        
        if (ticketsPerAnalyst > 300) {
          recommendations.push(`Considerar aumentar a equipe de ${level} devido ao alto volume de tickets por analista.`);
        }
        
        if (data.avgTime > 200) {
          recommendations.push(`Investigar o alto tempo de resolução no ${level} (média de ${data.avgTime.toFixed(1)} horas).`);
        }
      }
    });
    
    // Verificar analistas com desempenho discrepante
    const avgResolutionTime = filteredData.reduce(
      (sum, ticket) => sum + (ticket.resolutionTimeHours || 0), 
      0
    ) / filteredData.filter(ticket => ticket.resolutionTimeHours).length;
    
    Object.entries(analystPerformance).forEach(([analyst, data]) => {
      const analystAvgTime = data.totalTime / data.resolved;
      if (analystAvgTime > avgResolutionTime * 2 && data.resolved > 10) {
        recommendations.push(`Verificar necessidade de treinamento para ${analyst} (tempo médio ${analystAvgTime.toFixed(1)}h vs. média geral ${avgResolutionTime.toFixed(1)}h).`);
      }
    });
    
    if (recommendations.length > 0) {
      insightsList.push({
        type: 'recommendations',
        title: 'Recomendações',
        content: recommendations
      });
    }
    
    return insightsList;
  }, [filteredData, salaries]);
  
  // Valor do contexto
  const value = {
    originalData,
    filteredData,
    dateRange,
    setDateRange,
    salaries,
    updateSalary,
    growthProjection,
    updateGrowthProjection,
    errors,
    uploadedFile,
    processExcelFile,
    kpis,
    analystProjection,
    insights,
    forceUpdate // Incluir forceUpdate para que os componentes sejam notificados de mudanças
  };
  
  return (
    <TicketsContext.Provider value={value}>
      {children}
    </TicketsContext.Provider>
  );
};

// Hook para usar o contexto
export const useTickets = () => {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets deve ser usado dentro de um TicketsProvider');
  }
  return context;
};
