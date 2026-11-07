import React, { useState } from 'react';
import { 
  Defect, 
  Countermeasure, 
  FiveWhyAnalysis, 
  FishboneFactors, 
  UserProfile, 
  DefectStatus, 
  DefectSeverity 
} from '../types';
import { apiService, AIAnalysisResult } from '../services/api';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Send, 
  Wrench, 
  Plus, 
  Check, 
  Printer, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface DefectDetailModalProps {
  defect: Defect;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDefect: (updated: Defect) => void;
  currentUser: UserProfile;
  isOffline: boolean;
  onOpenReport: (defect: Defect) => void;
}

export const DefectDetailModal: React.FC<DefectDetailModalProps> = ({
  defect,
  isOpen,
  onClose,
  onUpdateDefect,
  currentUser,
  isOffline,
  onOpenReport,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fiveWhy' | 'fishbone' | 'countermeasures' | 'discussion'>('countermeasures');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [commentText, setCommentText] = useState('');

  // 5-Why state
  const [fiveWhy, setFiveWhy] = useState<FiveWhyAnalysis>(
    defect.fiveWhy || {
      why1: defect.title || '',
      why2: '',
      why3: '',
      why4: '',
      why5: '',
      rootCause: '',
      completed: false,
    }
  );

  // Fishbone state
  const [fishbone, setFishbone] = useState<FishboneFactors>(
    defect.fishbone || {
      man: ['Operator takt-time speed variance'],
      machine: ['Torque gun clutch wear', 'Fixture play'],
      method: ['Work instruction step skipped'],
      material: ['Supplier coating variance'],
      measurement: ['Calibration interval exceeded'],
      milieu: ['Temperature swing in booth'],
    }
  );
  const [newFactorCategory, setNewFactorCategory] = useState<keyof FishboneFactors>('man');
  const [newFactorText, setNewFactorText] = useState('');

  // New countermeasure form
  const [newCmType, setNewCmType] = useState<'containment' | 'corrective' | 'preventive'>('corrective');
  const [newCmTitle, setNewCmTitle] = useState('');
  const [newCmDesc, setNewCmDesc] = useState('');
  const [newCmAssignee, setNewCmAssignee] = useState(currentUser.name);

  if (!isOpen) return null;

  const handleRunAiKaizen = async () => {
    setIsAiLoading(true);
    try {
      const result: AIAnalysisResult = await apiService.analyzeDefect(defect, isOffline);

      // Populate 5-Why if available
      if (result.fiveWhys && result.fiveWhys.length >= 5) {
        const updated5Why: FiveWhyAnalysis = {
          why1: result.fiveWhys[0] || fiveWhy.why1,
          why2: result.fiveWhys[1] || fiveWhy.why2,
          why3: result.fiveWhys[2] || fiveWhy.why3,
          why4: result.fiveWhys[3] || fiveWhy.why4,
          why5: result.fiveWhys[4] || fiveWhy.why5,
          rootCause: result.rootCauseHypothesis || result.fiveWhys[4],
          completed: true,
        };
        setFiveWhy(updated5Why);
      }

      // Add suggested countermeasures if not already present
      const newCountermeasures: Countermeasure[] = [...defect.countermeasures];
      if (result.containmentAction && !newCountermeasures.some((c) => c.type === 'containment')) {
        newCountermeasures.push({
          id: `cm-${Date.now()}-1`,
          type: 'containment',
          title: 'Immediate Containment (ICA)',
          description: result.containmentAction,
          assignedTo: currentUser.name,
          targetDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          status: 'in_progress',
          effectivenessPercent: 90,
          updatedAt: new Date().toISOString(),
        });
      }
      if (result.correctiveAction && !newCountermeasures.some((c) => c.type === 'corrective')) {
        newCountermeasures.push({
          id: `cm-${Date.now()}-2`,
          type: 'corrective',
          title: 'Permanent Corrective Action (PCA)',
          description: result.correctiveAction,
          assignedTo: 'Process Engineering Lead',
          targetDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          status: 'pending',
          effectivenessPercent: 95,
          updatedAt: new Date().toISOString(),
        });
      }
      if (result.preventiveAction && !newCountermeasures.some((c) => c.type === 'preventive')) {
        newCountermeasures.push({
          id: `cm-${Date.now()}-3`,
          type: 'preventive',
          title: 'Preventive Poka-Yoke & SWI Update',
          description: result.preventiveAction,
          assignedTo: 'Quality Assurance Lead',
          targetDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          status: 'pending',
          effectivenessPercent: 100,
          updatedAt: new Date().toISOString(),
        });
      }

      const updated: Defect = {
        ...defect,
        aiAnalysis: {
          summary: result.summary,
          rootCauseHypothesis: result.rootCauseHypothesis,
          containmentAction: result.containmentAction,
          correctiveAction: result.correctiveAction,
          preventiveAction: result.preventiveAction,
          verificationMethod: result.verificationMethod,
          recommendedTimelineHours: result.recommendedTimelineHours,
          source: result.source,
        },
        countermeasures: newCountermeasures,
        fiveWhy: {
          ...fiveWhy,
          rootCause: result.rootCauseHypothesis,
          completed: true,
        },
        status: defect.status === 'open' ? 'investigating' : defect.status,
        updatedAt: new Date().toISOString(),
      };

      onUpdateDefect(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveFiveWhy = () => {
    const updated: Defect = {
      ...defect,
      fiveWhy: { ...fiveWhy, completed: true },
      status: defect.status === 'open' ? 'investigating' : defect.status,
      updatedAt: new Date().toISOString(),
    };
    onUpdateDefect(updated);
  };

  const handleAddFishboneFactor = () => {
    if (!newFactorText.trim()) return;
    const updatedFishbone = {
      ...fishbone,
      [newFactorCategory]: [...fishbone[newFactorCategory], newFactorText.trim()],
    };
    setFishbone(updatedFishbone);
    setNewFactorText('');

    const updated: Defect = {
      ...defect,
      fishbone: updatedFishbone,
      updatedAt: new Date().toISOString(),
    };
    onUpdateDefect(updated);
  };

  const handleAddCountermeasure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmTitle.trim()) return;

    const newCm: Countermeasure = {
      id: `cm-${Date.now()}`,
      type: newCmType,
      title: newCmTitle,
      description: newCmDesc || newCmTitle,
      assignedTo: newCmAssignee,
      targetDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'in_progress',
      effectivenessPercent: 80,
      updatedAt: new Date().toISOString(),
    };

    const updated: Defect = {
      ...defect,
      countermeasures: [newCm, ...defect.countermeasures],
      status: defect.status === 'open' || defect.status === 'investigating' ? 'countermeasure_proposed' : defect.status,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDefect(updated);
    setNewCmTitle('');
    setNewCmDesc('');
  };

  const handleUpdateCountermeasureStatus = (
    cmId: string, 
    newStatus: Countermeasure['status'], 
    newEff?: number
  ) => {
    const updatedCms = defect.countermeasures.map((c) =>
      c.id === cmId
        ? {
            ...c,
            status: newStatus,
            effectivenessPercent: newEff !== undefined ? newEff : c.effectivenessPercent,
            approvedBy: newStatus === 'verified' ? currentUser.name : c.approvedBy,
            updatedAt: new Date().toISOString(),
          }
        : c
    );

    // If all verified, auto-upgrade defect status
    const allVerified = updatedCms.length > 0 && updatedCms.every((c) => c.status === 'verified');

    const updated: Defect = {
      ...defect,
      countermeasures: updatedCms,
      status: allVerified ? 'verified' : defect.status,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDefect(updated);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
      isSupervisorNote: currentUser.role === 'supervisor' || currentUser.role === 'manager',
    };

    const updated: Defect = {
      ...defect,
      comments: [...defect.comments, newComment],
      updatedAt: new Date().toISOString(),
    };

    onUpdateDefect(updated);
    setCommentText('');
  };

  const handleChangeStatus = (status: DefectStatus) => {
    const updated: Defect = {
      ...defect,
      status,
      updatedAt: new Date().toISOString(),
    };
    onUpdateDefect(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                defect.severity === 'critical'
                  ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                  : defect.severity === 'major'
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                  : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/80'
              }`}
            >
              {defect.severity}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-400 font-semibold">{defect.defectCode}</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">{defect.station}</span>
              </div>
              <h2 className="text-base font-bold text-white line-clamp-1">{defect.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Selector */}
            <select
              value={defect.status}
              onChange={(e) => handleChangeStatus(e.target.value as DefectStatus)}
              className="bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="countermeasure_proposed">Countermeasure Proposed</option>
              <option value="verified">Verified & Tested</option>
              <option value="closed">Closed & Standardized</option>
            </select>

            <button
              onClick={() => onOpenReport(defect)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Print 8D Quality Report"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (8D Stages) */}
        <div className="px-6 bg-slate-950/50 border-b border-slate-800 flex items-center gap-6 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('countermeasures')}
            className={`py-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'countermeasures'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Countermeasures ({defect.countermeasures.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fiveWhy')}
            className={`py-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'fiveWhy'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>5-Why Root Cause</span>
          </button>

          <button
            onClick={() => setActiveTab('fishbone')}
            className={`py-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'fishbone'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Ishikawa Fishbone</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Defect Details & Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('discussion')}
            className={`py-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'discussion'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Team Discussion ({defect.comments.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* AI Kaizen Quick Recommendation Banner */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-300">
                  Automotive Kaizen 8D Intelligence
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  {defect.aiAnalysis?.summary ||
                    'Run AI root-cause analysis to calculate 5-Why progression, immediate interim containment (ICA), and permanent corrective actions (PCA).'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAiKaizen}
              disabled={isAiLoading}
              className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0 transition-all shadow"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>{isAiLoading ? 'Analyzing...' : 'Generate Kaizen Plan'}</span>
            </button>
          </div>

          {/* TAB 1: COUNTERMEASURES */}
          {activeTab === 'countermeasures' && (
            <div className="space-y-6">
              {/* Add New Countermeasure Form */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Propose New Countermeasure / Action Item</span>
                </h4>
                <form onSubmit={handleAddCountermeasure} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                      <select
                        value={newCmType}
                        onChange={(e: any) => setNewCmType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="containment">Immediate Containment (ICA)</option>
                        <option value="corrective">Permanent Corrective (PCA)</option>
                        <option value="preventive">Preventive Kaizen (Poka-Yoke)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1">Action Title *</label>
                      <input
                        type="text"
                        required
                        value={newCmTitle}
                        onChange={(e) => setNewCmTitle(e.target.value)}
                        placeholder="e.g. Add thread protective silicone plug during weld"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Execution Steps & Verification Protocol</label>
                    <textarea
                      rows={2}
                      value={newCmDesc}
                      onChange={(e) => setNewCmDesc(e.target.value)}
                      placeholder="Detail who executes, torque/measurement criteria, sample verification size..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Owner:</span>
                      <input
                        type="text"
                        value={newCmAssignee}
                        onChange={(e) => setNewCmAssignee(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                    >
                      Add Action Item
                    </button>
                  </div>
                </form>
              </div>

              {/* Countermeasure List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Countermeasures & Effectiveness
                </h4>

                {defect.countermeasures.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                    No countermeasures logged yet. Click &quot;Generate Kaizen Plan&quot; above or propose an action manually.
                  </div>
                ) : (
                  defect.countermeasures.map((cm) => {
                    const typeBadge = {
                      containment: 'bg-red-950/60 text-red-400 border border-red-800/60',
                      corrective: 'bg-amber-950/60 text-amber-400 border border-amber-800/60',
                      preventive: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60',
                    }[cm.type];

                    return (
                      <div
                        key={cm.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${typeBadge}`}>
                              {cm.type}
                            </span>
                            <h5 className="text-sm font-bold text-white">{cm.title}</h5>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Status:</span>
                            <select
                              value={cm.status}
                              onChange={(e) => handleUpdateCountermeasureStatus(cm.id, e.target.value as any)}
                              className="bg-slate-900 text-xs border border-slate-700 rounded px-2 py-1 text-slate-200"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="implemented">Implemented</option>
                              <option value="verified">Verified (Closed)</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300">{cm.description}</p>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                          <div>
                            <span>Owner: </span>
                            <span className="text-slate-200 font-medium">{cm.assignedTo}</span>
                            <span className="mx-2">·</span>
                            <span>Target: </span>
                            <span className="text-slate-200 font-mono">{cm.targetDate}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span>Effectiveness:</span>
                              <span className="font-mono font-bold text-amber-400">
                                {cm.effectivenessPercent || 85}%
                              </span>
                            </div>

                            {cm.status !== 'verified' && (
                              <button
                                onClick={() => handleUpdateCountermeasureStatus(cm.id, 'verified', 100)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                <span>Verify & Sign-off</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 5-WHY ROOT CAUSE ANALYSIS */}
          {activeTab === 'fiveWhy' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    5-Why Problem Solving Ladder (IATF 16949 / Lean Kaizen)
                  </h4>
                  <button
                    onClick={handleRunAiKaizen}
                    disabled={isAiLoading}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Populate 5-Why</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Why 1 (Direct Phenomenon)', field: 'why1' },
                    { label: 'Why 2 (Technical Mechanism)', field: 'why2' },
                    { label: 'Why 3 (Process / Tool Variance)', field: 'why3' },
                    { label: 'Why 4 (Execution / Detection Lapse)', field: 'why4' },
                    { label: 'Why 5 (Systemic / Root Cause)', field: 'why5' },
                  ].map((step, idx) => (
                    <div key={step.field} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-mono text-xs flex items-center justify-center shrink-0 mt-1">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">
                          {step.label}
                        </label>
                        <input
                          type="text"
                          value={(fiveWhy as any)[step.field] || ''}
                          onChange={(e) => setFiveWhy({ ...fiveWhy, [step.field]: e.target.value })}
                          placeholder={`Enter response for step ${idx + 1}...`}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-bold text-amber-400 mb-1">
                      Final Verified Root Cause:
                    </label>
                    <textarea
                      rows={2}
                      value={fiveWhy.rootCause || ''}
                      onChange={(e) => setFiveWhy({ ...fiveWhy, rootCause: e.target.value })}
                      placeholder="Summarize fundamental systemic breakdown..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveFiveWhy}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save 5-Why Analysis</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ISHIKAWA FISHBONE */}
          {activeTab === 'fishbone' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Ishikawa Fishbone Diagram (6M Analysis)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Map potential contributing causes across Man, Machine, Method, Material, Measurement, and Milieu.
                  </p>
                </div>
              </div>

              {/* Add factor */}
              <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <select
                  value={newFactorCategory}
                  onChange={(e) => setNewFactorCategory(e.target.value as keyof FishboneFactors)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5"
                >
                  <option value="man">Man (Personnel)</option>
                  <option value="machine">Machine (Tooling)</option>
                  <option value="method">Method (Process)</option>
                  <option value="material">Material (Parts)</option>
                  <option value="measurement">Measurement (Gauge)</option>
                  <option value="milieu">Milieu (Environment)</option>
                </select>
                <input
                  type="text"
                  value={newFactorText}
                  onChange={(e) => setNewFactorText(e.target.value)}
                  placeholder="Add specific cause factor..."
                  className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded px-3 py-1.5"
                />
                <button
                  onClick={handleAddFishboneFactor}
                  className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded"
                >
                  Add
                </button>
              </div>

              {/* 6M Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'man', label: 'Man (Operator / Shift)' },
                  { key: 'machine', label: 'Machine (Spindle / Robot)' },
                  { key: 'method', label: 'Method (Standard Work)' },
                  { key: 'material', label: 'Material (Supplier / Coating)' },
                  { key: 'measurement', label: 'Measurement (Gauge / Sensor)' },
                  { key: 'milieu', label: 'Milieu (Humidity / Temp)' },
                ].map((cat) => (
                  <div key={cat.key} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] font-bold text-amber-400 uppercase">{cat.label}</span>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                      {(fishbone as any)[cat.key]?.map((factor: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-600">›</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DEFECT DETAILS & PHOTO */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Specification & Metadata
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">Assembly Line:</span>
                        <p className="font-semibold text-white">{defect.line}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Station:</span>
                        <p className="font-semibold text-white">{defect.station}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">VIN / Chassis:</span>
                        <p className="font-mono text-amber-400">{defect.vinOrUnitId}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Part Number:</span>
                        <p className="font-mono text-slate-200">{defect.partNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Reported By:</span>
                        <p className="text-slate-200">{defect.reportedBy}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Logged At:</span>
                        <p className="text-slate-200 font-mono text-[11px]">
                          {new Date(defect.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                      Defect Observation
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{defect.description}</p>
                  </div>
                </div>

                {/* Evidence Photo */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 w-full text-left">
                    Inspection Evidence Photo
                  </h4>
                  <div className="relative rounded-lg overflow-hidden border border-slate-700 w-full aspect-video bg-black">
                    <img
                      src={defect.imageUrl || '/src/assets/images/automotive_assembly_plant_1794069669601.jpg'}
                      alt="Defect visual"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-[10px] font-mono text-white">
                      ZONE: {defect.vehicleZone.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DISCUSSION & COMMENTS */}
          {activeTab === 'discussion' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {defect.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border text-xs ${
                      c.isSupervisorNote
                        ? 'bg-amber-950/30 border-amber-800/60'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{c.author}</span>
                        <span className="text-slate-500">·</span>
                        <span className="font-mono text-slate-400 uppercase text-[10px]">{c.role}</span>
                        {c.isSupervisorNote && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded">
                            Supervisor Note
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300">{c.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add note, verification comment, or shift handoff detail..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
