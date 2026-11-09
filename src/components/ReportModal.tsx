import React, { useState } from 'react';
import { Defect } from '../types/index.ts';
import { ComplianceAudit } from './ComplianceAudit.tsx';
import { complianceAuditService } from '../services/complianceAuditService.ts';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle, 
  FileText, 
  ShieldCheck, 
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface ReportModalProps {
  defect: Defect;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ defect, onClose }) => {
  const [activeReportTab, setActiveReportTab] = useState<'8d_dossier' | 'compliance_audit'>('8d_dossier');
  const auditReport = complianceAuditService.generateAuditReport(defect);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Generate combined 8D and Compliance CSV
    const rows = [
      ['=== 8D PROBLEM SOLVING DOSSIER ==='],
      ['Defect Code', 'Title', 'VIN', 'Station', 'Category', 'Severity', 'Status', 'Root Cause', 'Reported By', 'Created At'],
      [
        defect.defectCode,
        `"${defect.title.replace(/"/g, '""')}"`,
        defect.vinOrUnitId,
        defect.station,
        defect.category,
        defect.severity,
        defect.status,
        `"${(defect.fiveWhy?.rootCause || defect.aiAnalysis?.rootCauseHypothesis || 'Under Investigation').replace(/"/g, '""')}"`,
        defect.reportedBy,
        defect.createdAt,
      ],
      [],
      ['=== IATF 16949:2016 COMPLIANCE AUDIT CHECKLIST ==='],
      ['Clause', 'Category', 'Requirement Title', 'Mandatory For', 'Compliance Status', 'Auditor Evidence / Verification'],
    ];

    auditReport.items.forEach((item) => {
      rows.push([
        `IATF ${item.clause}`,
        `"${item.category}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        item.mandatoryForSeverity,
        item.status.toUpperCase(),
        `"${(item.evidenceNote || '').replace(/"/g, '""')}"`,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `8D_IATF16949_Report_${defect.defectCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-zinc-900 w-full max-w-5xl max-h-[94vh] flex flex-col my-auto border border-zinc-400 shadow-2xl overflow-hidden font-sans">
        
        {/* Modal Top Control Bar (Hidden during printing) */}
        <div className="p-4 bg-zinc-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <span>IATF 16949 Quality Dossier & Compliance Audit</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {defect.defectCode}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                AIAG Core Tools / VDA 6.3 & ISO 9001:2015 Manufacturing Standard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 border border-zinc-700 transition-colors"
              title="Export complete 8D & Compliance CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
              title="Print official dossier or save to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Switcher Tabs (Hidden during printing) */}
        <div className="flex border-b border-zinc-200 bg-zinc-100 text-xs font-mono print:hidden">
          <button
            onClick={() => setActiveReportTab('8d_dossier')}
            className={`px-5 py-2.5 font-bold flex items-center gap-2 transition-colors border-b-2 ${
              activeReportTab === '8d_dossier'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>1. 8D Problem Solving Dossier (D1-D8)</span>
          </button>

          <button
            onClick={() => setActiveReportTab('compliance_audit')}
            className={`px-5 py-2.5 font-bold flex items-center gap-2 transition-colors border-b-2 ${
              activeReportTab === 'compliance_audit'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            <span>2. IATF 16949 Compliance Audit Checklist ({auditReport.complianceScorePercent}% Pass)</span>
          </button>
        </div>

        {/* Modal Scrollable Container */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 text-zinc-900 bg-white">
          
          {/* TAB 1: 8D DOSSIER VIEW (Also rendered in Print) */}
          <div className={activeReportTab === '8d_dossier' ? 'space-y-6' : 'hidden print:block space-y-6'}>
            
            {/* Document Header */}
            <div className="border-b-2 border-zinc-900 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-700 uppercase tracking-widest">
                    AUTOMOTIVE QUALITY ENGINEERING REPORT
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 mt-1">
                    8D Problem Solving Dossier: {defect.defectCode}
                  </h1>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Standard: IATF 16949 / AIAG Core Tools / VDA 6.3 Compliance
                  </p>
                </div>

                <div className="border border-zinc-300 p-2 text-right font-mono text-[11px] bg-zinc-50 space-y-0.5">
                  <div>DOC NO: 8D-{defect.defectCode}</div>
                  <div>ISSUE DATE: {new Date(defect.createdAt).toLocaleDateString()}</div>
                  <div>STATUS: <span className="font-bold uppercase text-emerald-700">{defect.status}</span></div>
                  <div>IATF AUDIT: <span className="font-bold text-zinc-900">{auditReport.complianceScorePercent}% Verified</span></div>
                </div>
              </div>
            </div>

            {/* D1: Team */}
            <div className="space-y-1.5">
              <h3 className="font-mono text-xs font-bold uppercase bg-zinc-100 p-1.5 border-l-4 border-zinc-900 text-zinc-900">
                D1: Champion & Cross-Functional Team
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-2">
                <div><span className="text-zinc-500 font-mono">Champion:</span> <div className="font-semibold">Quality Director</div></div>
                <div><span className="text-zinc-500 font-mono">Team Leader:</span> <div className="font-semibold">{defect.reportedBy}</div></div>
                <div><span className="text-zinc-500 font-mono">Station:</span> <div className="font-semibold">{defect.station}</div></div>
                <div><span className="text-zinc-500 font-mono">Plant:</span> <div className="font-semibold">Assembly Plant A</div></div>
              </div>
            </div>

            {/* D2: Problem Statement */}
            <div className="space-y-1.5">
              <h3 className="font-mono text-xs font-bold uppercase bg-zinc-100 p-1.5 border-l-4 border-zinc-900 text-zinc-900">
                D2: Detailed Problem Description (5W2H)
              </h3>
              <div className="p-3 border border-zinc-200 text-xs space-y-2 bg-zinc-50/50">
                <div className="font-semibold text-sm">{defect.title}</div>
                <p className="text-zinc-700 leading-relaxed">{defect.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-200 font-mono text-[11px] text-zinc-600">
                  <div>VIN: <span className="font-bold text-zinc-900">{defect.vinOrUnitId}</span></div>
                  <div>Part No: <span className="font-bold text-zinc-900">{defect.partNumber || 'N/A'}</span></div>
                  <div>Zone: <span className="font-bold text-zinc-900">{defect.vehicleZone}</span></div>
                  <div>Severity: <span className="font-bold text-rose-700 uppercase">{defect.severity}</span></div>
                </div>
              </div>
            </div>

            {/* D3: Interim Containment Action (ICA) */}
            <div className="space-y-1.5">
              <h3 className="font-mono text-xs font-bold uppercase bg-zinc-100 p-1.5 border-l-4 border-zinc-900 text-zinc-900">
                D3: Interim Containment Actions (ICA)
              </h3>
              <div className="p-3 border border-zinc-200 text-xs bg-zinc-50/50">
                <p className="text-zinc-800">
                  {defect.aiAnalysis?.containmentAction ||
                    'Immediate 100% quarantine of affected assembly lot. In-station containment audit initiated with Zero defect release threshold.'}
                </p>
              </div>
            </div>

            {/* D4: Root Cause Analysis & 5-Why Ladder */}
            <div className="space-y-1.5">
              <h3 className="font-mono text-xs font-bold uppercase bg-zinc-100 p-1.5 border-l-4 border-zinc-900 text-zinc-900">
                D4: Root Cause & Escape Point Verification (5-Why Drill-down)
              </h3>
              <div className="p-3 border border-zinc-200 text-xs space-y-2 bg-zinc-50/50">
                <div className="font-mono text-[11px] space-y-1">
                  <div><span className="font-bold text-zinc-700">1. Why:</span> {defect.fiveWhy?.why1 || 'Direct physical failure observed in assembly.'}</div>
                  <div><span className="font-bold text-zinc-700">2. Why:</span> {defect.fiveWhy?.why2 || 'Inspection gate did not prevent part transfer.'}</div>
                  <div><span className="font-bold text-zinc-700">3. Why:</span> {defect.fiveWhy?.why3 || 'Variance in tool calibration or component dimension.'}</div>
                  <div><span className="font-bold text-zinc-700">4. Why:</span> {defect.fiveWhy?.why4 || 'Tool maintenance interval or work cycle deviation.'}</div>
                  <div><span className="font-bold text-zinc-700">5. Why:</span> {defect.fiveWhy?.why5 || 'Lack of automated error-proofing Poka-Yoke interlock.'}</div>
                </div>
                <div className="pt-2 border-t border-zinc-200 text-rose-800 font-medium">
                  <span className="font-mono font-bold uppercase">Root Cause Identified:</span>{' '}
                  {defect.fiveWhy?.rootCause || defect.aiAnalysis?.rootCauseHypothesis || 'Process variation without positive error-proofing.'}
                </div>
              </div>
            </div>

            {/* D5 & D6: Permanent Corrective Actions */}
            <div className="space-y-1.5">
              <h3 className="font-mono text-xs font-bold uppercase bg-zinc-100 p-1.5 border-l-4 border-zinc-900 text-zinc-900">
                D5 & D6: Permanent Corrective Actions (PCA) & Validation
              </h3>
              <div className="border border-zinc-200 overflow-hidden">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-zinc-100 font-mono text-zinc-700 text-[11px]">
                    <tr>
                      <th className="p-2">Action Title</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Owner</th>
                      <th className="p-2">Due</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {defect.countermeasures.length > 0 ? (
                      defect.countermeasures.map((cm) => (
                        <tr key={cm.id}>
                          <td className="p-2 font-medium">{cm.title}</td>
                          <td className="p-2 font-mono uppercase text-[10px]">{cm.type}</td>
                          <td className="p-2">{cm.assignedTo}</td>
                          <td className="p-2 font-mono">{cm.targetDate}</td>
                          <td className="p-2 font-mono uppercase font-bold text-emerald-700">{cm.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-3 text-center text-zinc-500 italic">
                          {defect.aiAnalysis?.correctiveAction || 'Permanent corrective tooling interlock in progress.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* D7: Prevent Recurrence & PFMEA Update */}
            <div className="space-y-1.5">
              <h3 className="font-mono text-xs font-bold uppercase bg-zinc-100 p-1.5 border-l-4 border-zinc-900 text-zinc-900">
                D7: Prevent Recurrence & Systemic Kaizen
              </h3>
              <div className="p-3 border border-zinc-200 text-xs bg-zinc-50/50 space-y-1">
                <p className="text-zinc-800">
                  {defect.aiAnalysis?.preventiveAction ||
                    'Update Process FMEA (PFMEA) to reduce Occurrence and Detection ranking. Implement automated physical Poka-Yoke fixture on station.'}
                </p>
                <div className="font-mono text-[11px] text-zinc-600">
                  Verification Protocol: {defect.aiAnalysis?.verificationMethod || '100% audit for 3 consecutive production shifts.'}
                </div>
              </div>
            </div>

            {/* D8: Sign-off & Recognition */}
            <div className="space-y-1.5 pt-4 border-t-2 border-zinc-900">
              <h3 className="font-mono text-xs font-bold uppercase text-zinc-700">
                D8: Team Recognition & Quality Engineering Sign-off
              </h3>
              <div className="grid grid-cols-3 gap-4 pt-4 text-xs font-mono">
                <div className="border-t border-zinc-400 pt-1 text-center">
                  <div className="font-bold">{defect.reportedBy}</div>
                  <div className="text-[10px] text-zinc-500">Quality Inspector</div>
                </div>
                <div className="border-t border-zinc-400 pt-1 text-center">
                  <div className="font-bold">Manufacturing Lead</div>
                  <div className="text-[10px] text-zinc-500">Station Supervisor</div>
                </div>
                <div className="border-t border-zinc-400 pt-1 text-center">
                  <div className="font-bold">Plant Quality Director</div>
                  <div className="text-[10px] text-zinc-500">IATF Management Sign-off</div>
                </div>
              </div>
            </div>

          </div>

          {/* TAB 2: COMPLIANCE AUDIT VIEW (Also rendered in Print) */}
          <div className={activeReportTab === 'compliance_audit' ? 'space-y-6' : 'hidden print:block space-y-6 pt-8 border-t-2 border-zinc-900'}>
            <div className="print:block hidden pb-2">
              <h2 className="text-lg font-bold font-mono uppercase text-zinc-900">
                Attachment: IATF 16949:2016 Compliance Audit Checklist
              </h2>
              <p className="text-xs text-zinc-500 font-mono">
                Mandatory Regulatory & OEM Quality System Audit Checklist
              </p>
            </div>
            
            <ComplianceAudit defect={defect} />
          </div>

        </div>

      </div>
    </div>
  );
};
