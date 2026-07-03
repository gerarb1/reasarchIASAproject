import React, { useState, useCallback } from 'react';
import {
  Database,
  Play,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface DataCleanerWorkspaceProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

interface DataRow {
  id: number;
  sample_id: string;
  temperature: number | null;
  pressure: number | null;
  concentration: number | null;
  ph_level: number | null;
  result: string;
}

// Sample scientific data with nulls and inconsistencies
const RAW_DATA: DataRow[] = [
  { id: 1, sample_id: 'EXP-001', temperature: 25.3, pressure: 1.013, concentration: 0.45, ph_level: 7.2, result: 'POSITIVE' },
  { id: 2, sample_id: 'EXP-002', temperature: null, pressure: 1.015, concentration: 0.52, ph_level: 7.1, result: 'POSITIVE' },
  { id: 3, sample_id: 'EXP-003', temperature: 24.8, pressure: null, concentration: 0.48, ph_level: null, result: 'NEGATIVE' },
  { id: 4, sample_id: 'EXP-004', temperature: 999.0, pressure: 1.012, concentration: -0.3, ph_level: 7.3, result: 'POSITIVE' },
  { id: 5, sample_id: 'EXP-005', temperature: 25.1, pressure: 1.014, concentration: 0.51, ph_level: 14.8, result: 'POSITIVE' },
  { id: 6, sample_id: 'EXP-006', temperature: null, pressure: null, concentration: null, ph_level: 7.0, result: 'NEGATIVE' },
  { id: 7, sample_id: 'EXP-007', temperature: 25.5, pressure: 1.011, concentration: 0.47, ph_level: 7.4, result: 'POSITIVE' },
  { id: 8, sample_id: 'EXP-008', temperature: 24.9, pressure: 1.016, concentration: 0.50, ph_level: null, result: 'NEGATIVE' },
];

// Cleaned data (post R-pipeline)
const CLEANED_DATA: DataRow[] = [
  { id: 1, sample_id: 'EXP-001', temperature: 25.3, pressure: 1.013, concentration: 0.45, ph_level: 7.2, result: 'POSITIVE' },
  { id: 2, sample_id: 'EXP-002', temperature: 25.1, pressure: 1.015, concentration: 0.52, ph_level: 7.1, result: 'POSITIVE' },
  { id: 3, sample_id: 'EXP-003', temperature: 24.8, pressure: 1.013, concentration: 0.48, ph_level: 7.2, result: 'NEGATIVE' },
  { id: 4, sample_id: 'EXP-004', temperature: 25.0, pressure: 1.012, concentration: 0.49, ph_level: 7.3, result: 'POSITIVE' },
  { id: 5, sample_id: 'EXP-005', temperature: 25.1, pressure: 1.014, concentration: 0.51, ph_level: 7.3, result: 'POSITIVE' },
  { id: 6, sample_id: 'EXP-006', temperature: 25.1, pressure: 1.013, concentration: 0.49, ph_level: 7.0, result: 'NEGATIVE' },
  { id: 7, sample_id: 'EXP-007', temperature: 25.5, pressure: 1.011, concentration: 0.47, ph_level: 7.4, result: 'POSITIVE' },
  { id: 8, sample_id: 'EXP-008', temperature: 24.9, pressure: 1.016, concentration: 0.50, ph_level: 7.2, result: 'NEGATIVE' },
];

/** Check if a cell value is anomalous (null, out of range, or negative where shouldn't be) */
function isAnomaly(field: string, value: number | null): boolean {
  if (value === null) return true;
  if (field === 'temperature' && (value > 100 || value < -50)) return true;
  if (field === 'concentration' && value < 0) return true;
  if (field === 'ph_level' && (value < 0 || value > 14)) return true;
  return false;
}

function isCleaned(raw: DataRow, clean: DataRow, field: keyof DataRow): boolean {
  return raw[field] !== clean[field];
}

const COLUMNS: { key: keyof DataRow; label: string }[] = [
  { key: 'sample_id', label: 'Sample ID' },
  { key: 'temperature', label: 'Temp (°C)' },
  { key: 'pressure', label: 'Presión (atm)' },
  { key: 'concentration', label: 'Conc. (mol/L)' },
  { key: 'ph_level', label: 'pH' },
  { key: 'result', label: 'Resultado' },
];

export const DataCleanerWorkspace: React.FC<DataCleanerWorkspaceProps> = ({ showToast }) => {
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRunPipeline = useCallback(async () => {
    setIsPipelineRunning(true);
    setShowDiff(false);
    setProgress(0);

    // Simulate R pipeline stages
    const stages = [
      'Conectando con R Engine...',
      'Detectando valores nulos...',
      'Imputando valores faltantes (KNN)...',
      'Detectando outliers (IQR method)...',
      'Corrigiendo anomalías...',
      'Validando integridad de datos...',
      'Pipeline completado ✓',
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setProgress(Math.round(((i + 1) / stages.length) * 100));
    }

    setIsPipelineRunning(false);
    setShowDiff(true);
    showToast('Pipeline de limpieza ejecutado correctamente', 'success');
  }, [showToast]);

  const renderCell = (
    row: DataRow,
    col: keyof DataRow,
    isRaw: boolean,
    cleanRow?: DataRow
  ) => {
    const value = row[col];
    const numericFields = ['temperature', 'pressure', 'concentration', 'ph_level'];

    if (isRaw && numericFields.includes(col) && isAnomaly(col, value as number | null)) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-mono text-xs font-medium">
          <AlertTriangle className="w-3 h-3" />
          {value === null ? 'NULL' : value}
        </span>
      );
    }

    if (!isRaw && cleanRow && isCleaned(RAW_DATA.find(r => r.id === row.id)!, row, col)) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          {value}
        </span>
      );
    }

    return (
      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
        {value === null ? '—' : String(value)}
      </span>
    );
  };

  const anomalyCount = RAW_DATA.reduce((acc, row) => {
    return acc + (['temperature', 'pressure', 'concentration', 'ph_level'] as const)
      .filter(f => isAnomaly(f, row[f])).length;
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{anomalyCount}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-500">Anomalías detectadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{RAW_DATA.length}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-500">Registros en dataset</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{showDiff ? '100%' : '0%'}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-500">Datos limpios</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
            {showDiff ? 'Vista Comparativa: Antes vs. Después' : 'Dataset Científico (Datos Crudos)'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            {showDiff
              ? 'Valores corregidos resaltados en verde. Anomalías originales en rojo.'
              : 'Valores nulos y anomalías resaltados en rojo. Ejecuta la pipeline para corregirlos.'}
          </p>
        </div>
        {!showDiff && (
          <Button
            variant="primary"
            size="lg"
            icon={isPipelineRunning ? undefined : <Play className="w-4 h-4" />}
            isLoading={isPipelineRunning}
            onClick={handleRunPipeline}
            className="shrink-0 shadow-lg shadow-accent-500/20"
          >
            {isPipelineRunning ? 'Ejecutando...' : 'Ejecutar Pipeline de Limpieza (R Engine)'}
          </Button>
        )}
        {showDiff && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDiff(false)}
          >
            Ver datos crudos
          </Button>
        )}
      </div>

      {/* Pipeline Progress */}
      {isPipelineRunning && (
        <Card className="animate-slide-up overflow-hidden">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-5 h-5 text-accent-500 animate-spin" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Procesando con R Engine... {progress}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table(s) */}
      {showDiff ? (
        /* ── DIFF VIEW: Before | After ── */
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Before */}
          <Card className="overflow-hidden border-red-200 dark:border-red-900/50">
            <CardHeader className="py-3 bg-red-50/50 dark:bg-red-950/20">
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Antes (Datos Crudos)
              </h4>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800">
                    {COLUMNS.map((col) => (
                      <th key={col.key} className="text-left px-3 py-2 font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500 whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RAW_DATA.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 dark:border-zinc-800/50">
                      {COLUMNS.map((col) => (
                        <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                          {renderCell(row, col.key, true)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Arrow */}
          <div className="hidden xl:flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
          </div>

          {/* After */}
          <Card className="overflow-hidden border-emerald-200 dark:border-emerald-900/50">
            <CardHeader className="py-3 bg-emerald-50/50 dark:bg-emerald-950/20">
              <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Después (Pipeline R)
              </h4>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800">
                    {COLUMNS.map((col) => (
                      <th key={col.key} className="text-left px-3 py-2 font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500 whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLEANED_DATA.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 dark:border-zinc-800/50">
                      {COLUMNS.map((col) => (
                        <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                          {renderCell(row, col.key, false, row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        /* ── RAW DATA TABLE ── */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RAW_DATA.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                        {renderCell(row, col.key, true)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
