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
  analystProjection: any[];
  insights: any[];
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
          const created = row.Created ? new Date(row.Created) : null;
          const resolved = row.Resolved ? new Date(row.Resolved) : null;
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

  const kpis = useMemo<KPIs>(() => {
    if (filteredData.length === 0) {
      return { totalTickets: 0, avgResolutionTime: 0, resolutionRate: 0, avgCostPerTicket: 0 };
    }
    const totalTickets = filteredData.length;
    const resolvedTickets = filteredData.filter(ticket => ticket.Resolved);
    const resolutionRate = (resolvedTickets.length / totalTickets) * 100;
    const avgResolutionTime = resolvedTickets.reduce((sum, ticket) => sum + (ticket.resolutionTimeHours || 0), 0) / (resolvedTickets.length || 1);

    const levelToSalary = {
      'Nível 1': salaries.nivel_1,
      'Nível 2': salaries.nivel_2,
      'Nível 3': salaries.nivel_3,
      'Outros': (salaries.nivel_1 + salaries.nivel_2 + salaries.nivel_3) / 3,
    };

    const ticketsByLevel: Record<string, number> = {};
    resolvedTickets.forEach(ticket => {
      const level = ticket.supportLevel || 'Outros';
      ticketsByLevel[level] = (ticketsByLevel[level] || 0) + 1;
    });

    let totalCost = 0;
    Object.entries(ticketsByLevel).forEach(([level, count]) => {
      totalCost += levelToSalary[level as keyof typeof levelToSalary] || 0;

    });

    const avgCostPerTicket = totalCost / (resolvedTickets.length || 1);

    return { totalTickets, avgResolutionTime, resolutionRate, avgCostPerTicket };
  }, [filteredData, salaries]);

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
    analystProjection: [], // você pode substituir depois
    insights: [],          // você pode substituir depois
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
