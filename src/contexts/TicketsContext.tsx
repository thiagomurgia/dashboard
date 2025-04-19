import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
import * as XLSX from 'xlsx';

interface Ticket {
  Assignee?: string;
  Created?: Date;
  Resolved?: Date;
  resolutionTimeHours?: number;
  supportLevel?: string;
  month?: string;
  [key: string]: any;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface Salaries {
  nivel_1: number;
  nivel_2: number;
  nivel_3: number;
}

interface KPIs {
  totalTickets: number;
  avgResolutionTime: number;
  resolutionRate: number;
  avgCostPerTicket: number;
  costPerMonth: Record<string, number>;
}

interface AnalystProjection {
  level: string;
  currentTickets: number;
  projectedTickets: number;
  currentAnalysts: number;
  neededAnalysts: number;
  additionalAnalysts: number;
}

interface Insight {
  level: string;
  message: string;
}

interface TicketsContextType {
  originalData: Ticket[];
  filteredData: Ticket[];
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  salaries: Salaries;
  updateSalary: (level: string, value: string) => void;
  growthProjection: number;
  updateGrowthProjection: (value: string) => void;
  errors: Record<string, string>;
  uploadedFile: string | null;
  processExcelFile: (file: File) => void;
  kpis: KPIs;
  analystProjection: AnalystProjection[];
  insights: Insight[];
  forceUpdate: number;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

const SUPPORT_LEVELS = {
  nivel_1: ['Matheus Paleari', 'Vitor Pereira', 'Arthur Domingues', 'Paulo Bonella', 'Rafael Purgly', 'Thiago Murgia', 'Lucas Bergamin', 'Welington Lara'],
  nivel_2: ['Laura almeida', 'Valdinei Costa', 'Luiz Magalhães', 'Emerson Melo', 'Luan Viana', 'Karina Apolinario', 'Carol Rodrigues', 'Rodolfo Santana', 'Gabriel Faria', 'Daniella Ponciano'],
  nivel_3: ['Agatha Anunciação']
};

export const TicketsProvider = ({ children }: { children: ReactNode }) => {
  const [forceUpdate, setForceUpdate] = useState(0);
  const [originalData, setOriginalData] = useState<Ticket[]>([]);
  const [filteredData, setFilteredData] = useState<Ticket[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-04-17'),
  });
  const [salaries, setSalaries] = useState<Salaries>({
    nivel_1: 3000,
    nivel_2: 4500,
    nivel_3: 6000,
  });
  const [growthProjection, setGrowthProjection] = useState<number>(10);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const applyFilters = (data: Ticket[], range: DateRange) => {
    const filtered = data.filter(ticket => {
      if (ticket.Created && range.startDate && range.endDate) {
        return ticket.Created >= range.startDate && ticket.Created <= range.endDate;
      }
      return true;
    });
    setFilteredData([...filtered]);
  };

  const processExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) throw new Error('Planilha sem dados.');

        const processedData: Ticket[] = jsonData.map((row) => {
          let created = null;
          if (row.Created) {
            if (!isNaN(row.Created)) {
              created = new Date(Math.round((row.Created - 25569) * 86400 * 1000));
            } else {
              created = new Date(row.Created);
            }
          }
          let resolved = null;
          if (row.Resolved) {
            if (!isNaN(row.Resolved)) {
              resolved = new Date(Math.round((row.Resolved - 25569) * 86400 * 1000));
            } else {
              resolved = new Date(row.Resolved);
            }
          }
          const resolutionTimeHours = created && resolved ? (resolved.getTime() - created.getTime()) / (1000 * 60 * 60) : null;

          let supportLevel = 'Outros';
          if (row.Assignee) {
            if (SUPPORT_LEVELS.nivel_1.includes(row.Assignee)) supportLevel = 'Nível 1';
            else if (SUPPORT_LEVELS.nivel_2.includes(row.Assignee)) supportLevel = 'Nível 2';
            else if (SUPPORT_LEVELS.nivel_3.includes(row.Assignee)) supportLevel = 'Nível 3';
          }

          return {
            ...row,
            Created: created,
            Resolved: resolved,
            resolutionTimeHours,
            supportLevel,
            month: created ? created.toISOString().substring(0, 7) : null,
          };
        });

        setOriginalData(processedData);
        setUploadedFile(file.name);
        applyFilters(processedData, dateRange);
        setForceUpdate(prev => prev + 1);
      } catch (error) {
        setErrors(prev => ({ ...prev, upload: 'Erro ao processar o arquivo.' }));
      }
    };

    reader.onerror = () => {
      setErrors(prev => ({ ...prev, upload: 'Erro ao ler o arquivo.' }));
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (originalData.length > 0) {
      applyFilters(originalData, dateRange);
    }
  }, [originalData, dateRange]);

  useEffect(() => {
    if (filteredData.length > 0) {
      setForceUpdate(prev => prev + 1);
    }
  }, [filteredData]);

  const updateSalary = (level: string, value: string) => {
    if (value === '' || isNaN(Number(value))) {
      setErrors(prev => ({ ...prev, [level]: 'Valor inválido' }));
      return;
    }
    const numValue = Number(value);
    if (numValue < 0) {
      setErrors(prev => ({ ...prev, [level]: 'Valor negativo' }));
      return;
    }
    setSalaries(prev => ({ ...prev, [level]: numValue }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[level];
      return newErrors;
    });
  };

  const updateGrowthProjection = (value: string) => {
    if (value === '' || isNaN(Number(value))) {
      setErrors(prev => ({ ...prev, growth: 'Valor inválido' }));
      return;
    }
    const numValue = Number(value);
    if (numValue < 0) {
      setErrors(prev => ({ ...prev, growth: 'Valor negativo' }));
      return;
    }
    setGrowthProjection(numValue);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.growth;
      return newErrors;
    });
  };

  const levelToSalary: Record<string, number> = useMemo(() => ({
    'Nível 1': salaries.nivel_1,
    'Nível 2': salaries.nivel_2,
    'Nível 3': salaries.nivel_3,
    'Outros': (salaries.nivel_1 + salaries.nivel_2 + salaries.nivel_3) / 3,
  }), [salaries]);

  const kpis = useMemo<KPIs>(() => {
    const resolved = filteredData.filter(t => t.Resolved);
    const totalTickets = filteredData.length;
    const resolutionRate = resolved.length / totalTickets * 100;
    const avgResolutionTime = resolved.reduce((sum, t) => sum + (t.resolutionTimeHours || 0), 0) / (resolved.length || 1);

    const costPerMonth: Record<string, number> = {};
    const monthlyTickets: Record<string, Ticket[]> = {};

    resolved.forEach(ticket => {
      if (!ticket.month) return;
      if (!monthlyTickets[ticket.month]) monthlyTickets[ticket.month] = [];
      monthlyTickets[ticket.month].push(ticket);
    });

    Object.entries(monthlyTickets).forEach(([month, tickets]) => {
      const byLevel: Record<string, number> = {};
      tickets.forEach(ticket => {
        const level = ticket.supportLevel || 'Outros';
        byLevel[level] = (byLevel[level] || 0) + 1;
      });
      let totalCost = 0;
      Object.entries(byLevel).forEach(([level, count]) => {
        totalCost += (levelToSalary[level] || 0) * (count / tickets.length);
      });
      costPerMonth[month] = totalCost;
    });

    const allCosts = Object.values(costPerMonth);
    const avgCostPerTicket = allCosts.reduce((a, b) => a + b, 0) / (allCosts.length || 1);

    return {
      totalTickets,
      avgResolutionTime,
      resolutionRate,
      avgCostPerTicket,
      costPerMonth
    };
  }, [filteredData, levelToSalary]);

  const value: TicketsContextType = {
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
    analystProjection: [],
    insights: [],
    forceUpdate,
  };

  return (
    <TicketsContext.Provider value={value}>
      {children}
    </TicketsContext.Provider>
  );
};

export const useTickets = (): TicketsContextType => {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets deve ser usado dentro de um TicketsProvider');
  }
  return context;
};
