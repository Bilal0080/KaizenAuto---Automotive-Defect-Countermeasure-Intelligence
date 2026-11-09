import React, { useState } from 'react';
import { Defect, ComplianceAuditReport, ComplianceAuditItem, IatfClauseCategory } from '../types/index.ts';
import { complianceAuditService } from '../services/complianceAuditService.ts';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  AlertCircle, 
  UserCheck, 
  Filter,
  FileText,
  BookmarkCheck
} from 'lucide-react';

interface ComplianceAuditProps {
  defect: Defect;
  onAuditUpdated?: (report: ComplianceAuditReport) => void;
}

export const ComplianceAudit: React.FC<ComplianceAuditProps> = ({ defect, onAuditUpdated }) => {
  const [report, setReport] = useState<ComplianceAuditReport>(() =>
    complianceAuditService.generateAuditReport(defect, 'Dr. Michael Chen (QM-0012)')
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [auditorName, setAuditorName] = useState<string>(report.auditorName);
  const [isSignedOff, setIsSignedOff] = useState<boolean>(false);
  const [signOffDate, setSignOffDate] = useState<string>('');

  const handleToggleStatus = (itemId: string, newStatus: ComplianceAuditItem['status']) => {
    const updatedItems = report.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: newStatus,
          verifiedBy: newStatus === 'compliant' ? auditorName : undefined,
        };
      }
      return item;
    });

    const compliantCount = updatedItems.filter((i) => i.status === 'compliant').length;
    const pendingCount = updatedItems.filter((i) => i.status === 'pending').length;
    const score = Math.round((compliantCount / updatedItems.length) * 100);
    const criticalItems = updatedItems.filter((i) => i.mandatoryForSeverity === 'critical_only');
    const criticalPassed = criticalItems.every((i) => i.status === 'compliant');

    const updatedReport: ComplianceAuditReport = {
      ...report,
      items: updatedItems,
      compliantCount,
      pendingCount,
      complianceScorePercent: score,
      criticalItemsPassed: criticalPassed,
    };

    setReport(updatedReport);
    if (onAuditUpdated) {
      onAuditUpdated(updatedReport);
    }
  };

  const handleEvidenceChange = (itemId: string, text: string) => {
    const updatedItems = report.items.map((item) =>
      item.id === itemId ? { ...item, evidenceNote: text } : item
    );
    const updatedReport = { ...report, items: updatedItems };
    setReport(updatedReport);
    if (onAuditUpdated) {
      onAuditUpdated(updatedReport);
    }
  };

  const handleSignOff = () => {
    setIsSignedOff(true);
    setSignOffDate(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const filteredItems = report.items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const categories: IatfClauseCategory[] = [
    'Containment & Suspect Product (8.7)',
    'Problem Solving & Root Cause (10.2.3)',
    'Error-Proofing Poka-Yoke (10.2.4)',
    'Control Plan & Standard Work (8.5.1)',
    'PFMEA & Risk Analysis (8.3.5 / 9.1)',
    'Measurement & Calibration (7.1.5)',
    'Customer & Management Escalation (8.7.1.7)',
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner: Standard Header & Audit Scorecard */}
      <div className="bg-zinc-950 text-white p-5 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                IATF 16949:2016 Quality Compliance Audit
              </span>
            </div>
            <h2 className="text-base font-bold text-zinc-100 mt-1">
              Automotive Regulatory & Customer Specific Requirements (CSR) Checklist
            </h2>
            <p className="text-xs text-zinc-400">
              Dynamically derived for <span className="font-bold text-white">{defect.category}</span> with <span className={`font-bold uppercase ${defect.severity === 'critical' ? 'text-rose-400' : defect.severity === 'major' ? 'text-amber-400' : 'text-blue-400'}`}>{defect.severity} Severity</span>.
            </p>
          </div>

          <div className="text-right font-mono text-xs space-y-1">
            <div className="text-zinc-400">AUDIT ID: <span className="text-zinc-200">{report.auditId}</span></div>
            <div className="text-zinc-400">STANDARD: <span className="text-zinc-200">IATF 16949 / AIAG Core Tools</span></div>
          </div>
        </div>

        {/* Audit Scorecard Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-400">Compliance Index</span>
            <div className="text-xl font-bold font-mono text-zinc-100 mt-0.5">
              {report.complianceScorePercent}%
            </div>
            <div className={`text-[10px] font-mono mt-0.5 ${report.complianceScorePercent >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {report.complianceScorePercent >= 85 ? 'IATF READY' : 'REMEDIATION NEEDED'}
            </div>
          </div>

          <div className="p-3 bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-400">Audit Items</span>
            <div className="text-xl font-bold font-mono text-zinc-100 mt-0.5">
              {report.compliantCount} / {report.totalItems}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
              {report.pendingCount} Pending Verification
            </div>
          </div>

          <div className="p-3 bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-400">Critical Clauses</span>
            <div className={`text-xl font-bold font-mono mt-0.5 ${report.criticalItemsPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {report.criticalItemsPassed ? 'PASSED' : 'HOLD'}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
              {defect.severity === 'critical' ? '100% Zero Defect Release' : 'Standard Gate'}
            </div>
          </div>

          <div className="p-3 bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-400">Auditor Status</span>
            <div className="text-sm font-bold font-mono text-zinc-100 mt-1 truncate">
              {isSignedOff ? 'CERTIFIED' : 'IN AUDIT'}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-0.5 truncate">
              {isSignedOff ? signOffDate : 'Pending Lead Sign-off'}
            </div>
          </div>
        </div>

        {/* Critical Safety Notice if Severity is Critical */}
        {defect.severity === 'critical' && (
          <div className="p-2.5 bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold uppercase font-mono">IATF Clause 8.7.1.7 Active:</span> Mandatory OEM customer notification required within 24 hours. Pre-release clean-point sign-off enforced.
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Pills (Zero-Pill Industrial Style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-zinc-200 dark:border-zinc-800 font-mono">
        <div className="flex items-center gap-1 text-zinc-400 text-[11px] shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>CLAUSE:</span>
        </div>

        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap transition-colors border ${
            selectedCategory === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-bold'
              : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
          }`}
        >
          All Clauses ({report.totalItems})
        </button>

        {categories.map((cat) => {
          const count = report.items.filter((i) => i.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-bold'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
              }`}
            >
              {cat.split('(')[0].trim()} ({count})
            </button>
          );
        })}
      </div>

      {/* Checklist Table / Cards */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isCompliant = item.status === 'compliant';
          const isPending = item.status === 'pending';

          return (
            <div
              key={item.id}
              className={`p-4 border transition-colors ${
                isCompliant
                  ? 'bg-white dark:bg-zinc-900 border-emerald-300 dark:border-emerald-800/60'
                  : isPending
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                  : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                
                {/* Left: Clause Code, Title, Requirement */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                      IATF {item.clause}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 uppercase">
                      {item.category}
                    </span>
                    {item.mandatoryForSeverity === 'critical_only' && (
                      <span className="font-mono text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 border border-rose-300 dark:border-rose-800">
                        CRITICAL SAFETY MANDATE
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> SLA: &lt; {item.targetTimelineHours}h
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                    {item.requirement}
                  </p>

                  {/* Auditor Evidence Input Field */}
                  <div className="pt-2">
                    <label className="block text-[10px] font-mono uppercase font-bold text-zinc-500 mb-0.5">
                      Auditor Objective Evidence & Verification Record:
                    </label>
                    <input
                      type="text"
                      value={item.evidenceNote}
                      onChange={(e) => handleEvidenceChange(item.id, e.target.value)}
                      placeholder="Enter specific document, torque record, or inspection ticket #..."
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Right: Compliance Status Toggle Buttons */}
                <div className="flex flex-row sm:flex-col items-end gap-1.5 shrink-0 self-start">
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id, 'compliant')}
                      className={`px-3 py-1 font-semibold text-[11px] flex items-center gap-1 transition-colors border ${
                        isCompliant
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Compliant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id, 'pending')}
                      className={`px-3 py-1 font-semibold text-[11px] flex items-center gap-1 transition-colors border ${
                        isPending
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-amber-50'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Pending</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id, 'not_applicable')}
                      className={`px-2.5 py-1 font-semibold text-[11px] transition-colors border ${
                        item.status === 'not_applicable'
                          ? 'bg-zinc-800 text-white border-zinc-800'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      N/A
                    </button>
                  </div>

                  {item.verifiedBy && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      ✓ Verified: {item.verifiedBy}
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Auditor Certification & Sign-off Box */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              Lead Quality Auditor Formal Certification
            </h4>
            <p className="text-xs text-zinc-500 mt-0.5">
              Certifies that this defect response adheres to IATF 16949 / ISO 9001 and OEM requirements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="Auditor Name & Credentials"
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100"
            />
            <button
              onClick={handleSignOff}
              disabled={isSignedOff}
              className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                isSignedOff
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-emerald-600 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isSignedOff ? 'Certified & Locked' : 'Sign & Certify Audit'}</span>
            </button>
          </div>
        </div>

        {isSignedOff && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>OFFICIAL STAMP: IATF 16949 AUDIT APPROVED BY {auditorName.toUpperCase()}</span>
            <span>CERTIFIED: {signOffDate}</span>
          </div>
        )}
      </div>

    </div>
  );
};
