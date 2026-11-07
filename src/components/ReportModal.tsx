import React from 'react';
import { Defect } from '../types';
import { X, Printer, Download, FileSpreadsheet, CheckCircle, ShieldCheck } from 'lucide-react';

interface ReportModalProps {
  defect: Defect | null;
  isOpen: boolean;
  onClose: () => void;
  allDefects: Defect[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  defect,
  isOpen,
  onClose,
  allDefects,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'DefectCode',
      'Title',
      'Category',
      'Severity',
      'Status',
      'Line',
      'Station',
      'VIN',
      'PartNumber',
      'ReportedBy',
      'CreatedAt',
      'RootCause',
      'CountermeasuresCount',
    ];

    const rows = allDefects.map((d) => [
      `"${d.defectCode}"`,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.category}"`,
      `"${d.severity}"`,
      `"${d.status}"`,
      `"${d.line}"`,
      `"${d.station}"`,
      `"${d.vinOrUnitId}"`,
      `"${d.partNumber || ''}"`,
      `"${d.reportedBy}"`,
      `"${d.createdAt}"`,
      `"${(d.fiveWhy?.rootCause || '').replace(/"/g, '""')}"`,
      d.countermeasures.length,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kaizenauto_quality_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const targetDefect = defect || allDefects[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
        {/* Top Action Bar */}
        <div className="no-print px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              IATF 16949 / VDA 8D Quality Incident Report
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV (All Defects)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 8D Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-950 font-sans print:p-0">
          {targetDefect ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                    Automotive 8D Problem Solving Report
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Plant Quality Directorate · IATF 16949 Compliant Root Cause Resolution
                  </p>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="font-bold text-slate-900">INCIDENT ID: {targetDefect.defectCode}</div>
                  <div className="text-slate-600">DATE: {new Date(targetDefect.createdAt).toLocaleDateString()}</div>
                  <div className="text-slate-600">SEVERITY: {targetDefect.severity.toUpperCase()}</div>
                </div>
              </div>

              {/* D1: Team */}
              <div className="border border-slate-300 p-3 rounded">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 -m-3 mb-2 rounded-t">
                  D1 · Cross-Functional Problem Solving Team
                </h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Lead / Reporter:</span>
                    <p className="font-semibold">{targetDefect.reportedBy}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Quality Assurance:</span>
                    <p className="font-semibold">Elena Rostova (QC-1104)</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Shift Supervisor:</span>
                    <p className="font-semibold">Tariq Mehmood (SV-9921)</p>
                  </div>
                </div>
              </div>

              {/* D2: Problem Statement */}
              <div className="border border-slate-300 p-3 rounded">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 -m-3 mb-2 rounded-t">
                  D2 · Problem Description & Specifications
                </h3>
                <div className="text-xs space-y-2">
                  <p className="font-bold text-slate-900">{targetDefect.title}</p>
                  <p className="text-slate-700">{targetDefect.description}</p>
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500">Line:</span> {targetDefect.line}
                    </div>
                    <div>
                      <span className="text-slate-500">Station:</span> {targetDefect.station}
                    </div>
                    <div>
                      <span className="text-slate-500">VIN:</span> {targetDefect.vinOrUnitId}
                    </div>
                    <div>
                      <span className="text-slate-500">Part #:</span> {targetDefect.partNumber || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* D3: Containment (ICA) */}
              <div className="border border-slate-300 p-3 rounded">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 -m-3 mb-2 rounded-t">
                  D3 · Interim Containment Actions (ICA)
                </h3>
                <div className="text-xs space-y-1.5">
                  {targetDefect.countermeasures.filter((c) => c.type === 'containment').length > 0 ? (
                    targetDefect.countermeasures
                      .filter((c) => c.type === 'containment')
                      .map((cm) => (
                        <div key={cm.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="font-bold">{cm.title}</span>: {cm.description} (Owner: {cm.assignedTo}, Status: {cm.status.toUpperCase()})
                        </div>
                      ))
                  ) : (
                    <p className="text-slate-600">Immediate 100% manual quarantine on current batch initiated.</p>
                  )}
                </div>
              </div>

              {/* D4: Root Cause (5-Why) */}
              <div className="border border-slate-300 p-3 rounded">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 -m-3 mb-2 rounded-t">
                  D4 · Root Cause Analysis (5-Why & Ishikawa)
                </h3>
                <div className="text-xs space-y-2">
                  <p className="font-semibold text-slate-800">
                    Verified Root Cause: {targetDefect.fiveWhy?.rootCause || 'Under investigation.'}
                  </p>
                  {targetDefect.fiveWhy && (
                    <ul className="list-decimal pl-5 space-y-1 text-slate-700 font-mono text-[11px]">
                      {targetDefect.fiveWhy.why1 && <li>{targetDefect.fiveWhy.why1}</li>}
                      {targetDefect.fiveWhy.why2 && <li>{targetDefect.fiveWhy.why2}</li>}
                      {targetDefect.fiveWhy.why3 && <li>{targetDefect.fiveWhy.why3}</li>}
                      {targetDefect.fiveWhy.why4 && <li>{targetDefect.fiveWhy.why4}</li>}
                      {targetDefect.fiveWhy.why5 && <li>{targetDefect.fiveWhy.why5}</li>}
                    </ul>
                  )}
                </div>
              </div>

              {/* D5 & D6: Permanent Corrective Action & Validation */}
              <div className="border border-slate-300 p-3 rounded">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 -m-3 mb-2 rounded-t">
                  D5 & D6 · Permanent Corrective Actions (PCA) & Validation
                </h3>
                <div className="text-xs space-y-2">
                  {targetDefect.countermeasures.filter((c) => c.type === 'corrective').map((cm) => (
                    <div key={cm.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold">{cm.title}</span> — {cm.description}
                      <div className="text-[11px] text-slate-500 mt-1">
                        Assigned To: {cm.assignedTo} · Target: {cm.targetDate} · Effectiveness: {cm.effectivenessPercent}%
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-600">
                    Validation: 100% verification audit on 50 consecutive units with Zero Defect criteria.
                  </p>
                </div>
              </div>

              {/* D7 & D8: Preventive Action & Sign-off */}
              <div className="border border-slate-300 p-3 rounded">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-1 -m-3 mb-2 rounded-t">
                  D7 & D8 · Systemic Prevention (Kaizen / Poka-Yoke) & Final Approval
                </h3>
                <div className="text-xs space-y-2">
                  <p className="text-slate-700">
                    Standard Work Instruction (SWI) revised. Design FMEA and Process FMEA RPN score updated.
                  </p>
                  <div className="pt-4 grid grid-cols-2 gap-8 text-xs font-mono">
                    <div className="border-t border-slate-400 pt-1">
                      <span>Quality Manager Signature:</span>
                      <p className="font-bold text-slate-900 mt-1">Dr. Michael Chen</p>
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <span>Plant Director Approval:</span>
                      <p className="font-bold text-slate-900 mt-1">APPROVED (IATF 16949 COMPLIANT)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-10">No defect selected for report generation.</p>
          )}
        </div>
      </div>
    </div>
  );
};
