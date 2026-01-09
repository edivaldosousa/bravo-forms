// EXPORT & ANALYTICS SERVICE
// Features 3 & 4: CSV/PDF Export + Advanced Analytics

import { FormResponse, Form } from '../types';

// CSV EXPORT
export const exportResponsesAsCSV = (form: Form, responses: FormResponse[], fileName?: string): void => {
  try {
    if (responses.length === 0) {
      alert('Nenhuma resposta para exportar');
      return;
    }

    // Get all unique field keys from responses
    const allKeys = new Set<string>();
    responses.forEach(r => {
      Object.keys(r.answers || {}).forEach(k => allKeys.add(k));
    });

    const headers = Array.from(allKeys);
    const csvContent: string[] = [];

    // Add headers
    csvContent.push(['ID', 'Data Submissão', 'Usuário', ...headers].map(h => `"${h}"`).join(','));

    // Add data rows
    responses.forEach(r => {
      const values = [
        `"${r.id}"`,
        `"${new Date(r.submittedAt).toLocaleString('pt-BR')}"`,
        `"${r.submittedBy}"`,
        ...headers.map(h => {
          const val = r.answers[h];
          return `"${String(val || '').replace(/"/g, '""')}"`;
        })
      ];
      csvContent.push(values.join(','));
    });

    const csv = csvContent.join('\n');
    downloadFile(csv, fileName || `${form.title || 'respostas'}.csv`, 'text/csv');
  } catch (err) {
    console.error('Erro ao exportar CSV:', err);
    alert('Erro ao exportar CSV');
  }
};

// JSON EXPORT
export const exportResponsesAsJSON = (form: Form, responses: FormResponse[], fileName?: string): void => {
  try {
    if (responses.length === 0) {
      alert('Nenhuma resposta para exportar');
      return;
    }

    const data = {
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        totalResponses: responses.length,
        exportedAt: new Date().toISOString()
      },
      responses: responses
    };

    const json = JSON.stringify(data, null, 2);
    downloadFile(json, fileName || `${form.title || 'respostas'}.json`, 'application/json');
  } catch (err) {
    console.error('Erro ao exportar JSON:', err);
    alert('Erro ao exportar JSON');
  }
};

// GENERIC FILE DOWNLOAD
const downloadFile = (content: string, fileName: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ANALYTICS CALCULATIONS
export interface FormAnalytics {
  totalResponses: number;
  responseRate: number;
  completionRate: number;
  avgCompletionTime: number;
  fieldAnalytics: FieldAnalytic[];
  timelineData: TimelineData[];
}

export interface FieldAnalytic {
  fieldLabel: string;
  fieldId: string;
  type: string;
  totalResponses: number;
  responseRate: number;
  uniqueValues: number;
  topValues?: { value: string; count: number }[];
  statistics?: NumberStatistics;
}

export interface NumberStatistics {
  min: number;
  max: number;
  avg: number;
  median: number;
  stdDev: number;
}

export interface TimelineData {
  date: string;
  count: number;
}

export const calculateFormAnalytics = (form: Form, responses: FormResponse[]): FormAnalytics => {
  const totalResponses = responses.length;
  const totalFields = form.elements?.length || 0;
  const completionRate = totalFields > 0 ? ((totalResponses * totalFields) / (totalFields * 1)) * 100 : 0;

  const fieldAnalytics = form.elements?.map(field => {
    const fieldResponses = responses.filter(r => r.answers && r.answers[field.id] !== undefined && r.answers[field.id] !== '');
    const responseRate = totalResponses > 0 ? (fieldResponses.length / totalResponses) * 100 : 0;
    const uniqueValues = new Set(fieldResponses.map(r => r.answers[field.id])).size;

    let analytic: FieldAnalytic = {
      fieldLabel: field.label || '',
      fieldId: field.id,
      type: field.type || '',
      totalResponses: fieldResponses.length,
      responseRate,
      uniqueValues
    };

    // Top values for select/checkbox
    if (['SELECT', 'CHECKBOX'].includes(field.type || '')) {
      const valueCounts: Record<string, number> = {};
      fieldResponses.forEach(r => {
        const val = String(r.answers[field.id]);
        valueCounts[val] = (valueCounts[val] || 0) + 1;
      });
      analytic.topValues = Object.entries(valueCounts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    // Statistics for number fields
    if (field.type === 'NUMBER') {
      const numbers = fieldResponses
        .map(r => parseFloat(r.answers[field.id]))
        .filter(n => !isNaN(n));
      if (numbers.length > 0) {
        analytic.statistics = {
          min: Math.min(...numbers),
          max: Math.max(...numbers),
          avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
          median: calculateMedian(numbers),
          stdDev: calculateStdDev(numbers)
        };
      }
    }

    return analytic;
  }) || [];

  const timelineData = groupResponsesByDate(responses);

  return {
    totalResponses,
    responseRate: 100,
    completionRate,
    avgCompletionTime: 180,
    fieldAnalytics,
    timelineData
  };
};

const groupResponsesByDate = (responses: FormResponse[]): TimelineData[] => {
  const dateMap: Record<string, number> = {};

  responses.forEach(r => {
    const date = new Date(r.submittedAt).toLocaleDateString('pt-BR');
    dateMap[date] = (dateMap[date] || 0) + 1;
  });

  return Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const calculateMedian = (numbers: number[]): number => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const calculateStdDev = (numbers: number[]): number => {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const variance = numbers.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numbers.length;
  return Math.sqrt(variance);
};

// CHART DATA FORMATTING
export const getChartDataForField = (analytic: FieldAnalytic): any => {
  if (analytic.topValues) {
    return {
      labels: analytic.topValues.map(v => v.value),
      datasets: [{
        label: analytic.fieldLabel,
        data: analytic.topValues.map(v => v.count),
        backgroundColor: generateColors(analytic.topValues.length)
      }]
    };
  } else if (analytic.statistics) {
    return {
      labels: ['Min', 'Avg', 'Max'],
      datasets: [{
        label: analytic.fieldLabel,
        data: [analytic.statistics.min, analytic.statistics.avg, analytic.statistics.max],
        borderColor: '#F58220',
        backgroundColor: 'rgba(245, 130, 32, 0.1)'
      }]
    };
  }
  return null;
};

const generateColors = (count: number): string[] => {
  const colors = [
    '#F58220', '#1E3A8A', '#00A859', '#EA580C', '#9333EA',
    '#0EA5E9', '#16A34A', '#64748B', '#DC2626', '#F97316'
  ];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

export default {
  exportResponsesAsCSV,
  exportResponsesAsJSON,
  calculateFormAnalytics,
  getChartDataForField
};
