import React, { useState } from 'react';
import { 
  Defect, 
  Countermeasure, 
  FiveWhyAnalysis, 
  FishboneFactors, 
  DefectComment, 
  UserRole,
  DefectStatus
} from '../types/index.ts';
import { analyzeDefectWithAI, suggestCountermeasures } from '../services/api.ts';
import { 
  X, 
  Wrench, 
  Sparkles, 
  Activity, 
  CheckCircle, 
  Clock, 
  Plus, 
  FileText, 
  Send, 
  ShieldAlert, 
  AlertTriangle,
  Lightbulb,
  Check,
  RotateCcw
} from 'lucide-react';

interface DefectDetailModalProps {
  defect: Defect;
  currentUserRole: UserRole;
  currentUserName: string;
  onClose: () => void;
  onUpdateDefect: (updated: Defect) => void;
  onOpen8DReport: (defect: Defect) => void;
}

export const DefectDetailModal: React.FC<DefectDetailModalProps> = ({
  defect,
  currentUserRole,
  currentUserName,
  onClose,
  onUpdateDefect,
  onOpen8DReport,
}) => {
  const [activeTab, setActiveTab] = useState<'containment' | 'five_why' | 'fishbone' | 'countermeasures' | 'comments'>('containment');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Five Why State
  const [fiveWhy, setFiveWhy] = useState<FiveWhyAnalysis>(
    defect.fiveWhy || {
      why1: '',
      why2: '',
      why3: '',
      why4: '',
      why5: '',
      rootCause: '',
      completed: false,
    }
  );

  // Fishbone State
  const [fishbone, setFishbone] = useState<FishboneFactors>(
    defect.fishbone || {
      man: [],
      machine: [],
      method: [],
      material: [],
      measurement: [],
      milieu: [],
    }
  );
  const [newFishboneInput, setNewFishboneInput] = useState<{ category: keyof FishboneFactors; text: string }>({
    category: 'man',
    text: '',
  });

  // New Countermeasure State
  const [showAddCm, setShowAddCm] = useState(false);
  const [cmForm, setCmForm] = useState<{
    type: 'containment' | 'corrective' | 'preventive';
    title: string;
    description: string;
    assignedTo: string;
    targetDate: string;
  }>({
    type: 'containment',
    title: '',
    description: '',
    assignedTo: currentUserName,
    targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  });

  // Comment State
  const [commentText, setCommentText] = useState('');

  // AI Analysis Execution
  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await analyzeDefectWithAI(defect);
      const res = response.result;
      
      const updatedDefect: Defect = {
        ...defect,
        aiAnalysis: {
          summary: res.summary,
          rootCauseHypothesis: res.rootCauseHypothesis,
          containmentAction: res.containmentAction,
          correctiveAction: res.correctiveAction,
          preventiveAction: res.preventiveAction,
          verificationMethod: res.verificationMethod,
          recommendedTimelineHours: res.recommendedTimelineHours || 24,
          source: res.source || 'AI Expert',
        },
        updatedAt: new Date().toISOString(),
      };

      // Automatically fill empty 5-Why steps from AI if not filled
      if (res.fiveWhys && res.fiveWhys.length >= 5 && !fiveWhy.completed) {
        const aiFiveWhy: FiveWhyAnalysis = {
          why1: res.fiveWhys[0] || '',
          why2: res.fiveWhys[1] || '',
          why3: res.fiveWhys[2] || '',
          why4: res.fiveWhys[3] || '',
          why5: res.fiveWhys[4] || '',
          rootCause: res.rootCauseHypothesis || '',
          completed: true,
        };
        updatedDefect.fiveWhy = aiFiveWhy;
        setFiveWhy(aiFiveWhy);
      }

      onUpdateDefect(updatedDefect);
    } catch (err: any) {
      setAiError(err.message || 'AI analysis failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveFiveWhy = () => {
    const isComplete = Boolean(fiveWhy.why1 && fiveWhy.why2 && fiveWhy.rootCause);
    const updated: Defect = {
      ...defect,
      fiveWhy: {
        ...fiveWhy,
        completed: isComplete,
      },
      status: defect.status === 'open' ? 'investigating' : defect.status,
      updatedAt: new Date().toISOString(),
    };
    onUpdateDefect(updated);
  };

  const handleAddFishboneItem = () => {
    if (!newFishboneInput.text.trim()) return;
    const updated = {
      ...fishbone,
      [newFishboneInput.category]: [...fishbone[newFishboneInput.category], newFishboneInput.text.trim()],
    };
    setFishbone(updated);
    setNewFishboneInput({ ...newFishboneInput, text: '' });
    onUpdateDefect({
      ...defect,
      fishbone: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddCountermeasure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmForm.title.trim() || !cmForm.description.trim()) return;

    const newCm: Countermeasure = {
      id: 'cm_' + Date.now(),
      type: cmForm.type,
      title: cmForm.title.trim(),
      description: cmForm.description.trim(),
      assignedTo: cmForm.assignedTo,
      targetDate: cmForm.targetDate,
      status: 'in_progress',
      effectivenessPercent: 85,
      updatedAt: new Date().toISOString(),
    };

    const updatedDefect: Defect = {
      ...defect,
      countermeasures: [...defect.countermeasures, newCm],
      status: defect.status === 'open' || defect.status === 'investigating' ? 'countermeasure_proposed' : defect.status,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDefect(updatedDefect);
    setShowAddCm(false);
    setCmForm({
      type: 'containment',
      title: '',
      description: '',
      assignedTo: currentUserName,
      targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    });
  };

  const handleUpdateCmStatus = (cmId: string, status: Countermeasure['status']) => {
    const updatedCms = defect.countermeasures.map((c) =>
      c.id === cmId ? { ...c, status, updatedAt: new Date().toISOString() } : c
    );
    const allVerified = updatedCms.length > 0 && updatedCms.every((c) => c.status === 'verified');

    onUpdateDefect({
      ...defect,
      countermeasures: updatedCms,
      status: allVerified ? 'verified' : defect.status,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: DefectComment = {
      id: 'cmt_' + Date.now(),
      author: currentUserName,
      role: currentUserRole,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
      isSupervisorNote: currentUserRole === 'supervisor' || currentUserRole === 'manager',
    };

    onUpdateDefect({
      ...defect,
      comments: [...defect.comments, newComment],
      updatedAt: new Date().toISOString(),
    });
    setCommentText('');
  };

  const handleStatusChange = (newStatus: DefectStatus) => {
    onUpdateDefect({
      ...defect,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleAndon = () => {
    onUpdateDefect({
      ...defect,
      andonTriggered: !defect.andonTriggered,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto shadow-2xl">
        
        {/* Header */}
        <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {defect.defectCode}
              </span>
              <span className="text-xs uppercase font-mono text-zinc-400">
                VIN: {defect.vinOrUnitId}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Station: {defect.station}
              </span>
            </div>
            <h2 className="text-base font-bold text-zinc-100">{defect.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpen8DReport(defect)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 border border-zinc-700"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full 8D Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status & Andon Action Bar */}
        <div className="p-3 bg-zinc-100 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-zinc-500 dark:text-zinc-400 uppercase text-[11px]">Workflow Status:</span>
            <select
              value={defect.status}
              onChange={(e) => handleStatusChange(e.target.value as DefectStatus)}
              className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-semibold"
            >
              <option value="open">1. Open</option>
              <option value="investigating">2. Investigating (5-Why)</option>
              <option value="countermeasure_proposed">3. Countermeasure Proposed</option>
              <option value="verified">4. Verified Quality</option>
              <option value="closed">5. Closed & Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAndon}
              className={`px-3 py-1 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
                defect.andonTriggered
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{defect.andonTriggered ? 'ANDON STOP ACTIVE (Click to Clear)' : 'Trigger Andon Alert'}</span>
            </button>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAiLoading}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiLoading ? 'Analyzing...' : 'AI Kaizen Advisor'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('containment')}
            className={`px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'containment'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            D3 Containment & AI
          </button>
          <button
            onClick={() => setActiveTab('five_why')}
            className={`px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'five_why'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            D4 5-Why Ladder ({fiveWhy.completed ? 'Complete' : 'Pending'})
          </button>
          <button
            onClick={() => setActiveTab('fishbone')}
            className={`px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'fishbone'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Ishikawa 6M Diagram
          </button>
          <button
            onClick={() => setActiveTab('countermeasures')}
            className={`px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'countermeasures'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            D5/D6 Countermeasures ({defect.countermeasures.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'comments'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Shift Log ({defect.comments.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          
          {/* TAB 1: Containment & AI Advice */}
          {activeTab === 'containment' && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-mono text-xs text-zinc-500 uppercase font-semibold">
                  Primary Defect Description & In-Station Finding
                </span>
                <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {defect.description}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Part No: {defect.partNumber || 'N/A'}</span>
                  <span>•</span>
                  <span>Zone: {defect.vehicleZone}</span>
                  <span>•</span>
                  <span>Reported by: {defect.reportedBy}</span>
                </div>
              </div>

              {/* AI Quality Advisor Output Box */}
              {defect.aiAnalysis ? (
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-mono text-xs font-bold uppercase">
                      <Sparkles className="w-4 h-4" />
                      <span>{defect.aiAnalysis.source}</span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                      Target SLA: {defect.aiAnalysis.recommendedTimelineHours}h
                    </span>
                  </div>

                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                    {defect.aiAnalysis.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                      <span className="font-mono text-rose-700 dark:text-rose-400 uppercase font-bold text-[10px]">
                        Immediate Containment (ICA)
                      </span>
                      <p className="text-zinc-700 dark:text-zinc-300">{defect.aiAnalysis.containmentAction}</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                      <span className="font-mono text-purple-700 dark:text-purple-400 uppercase font-bold text-[10px]">
                        Permanent Corrective (PCA)
                      </span>
                      <p className="text-zinc-700 dark:text-zinc-300">{defect.aiAnalysis.correctiveAction}</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                      <span className="font-mono text-blue-700 dark:text-blue-400 uppercase font-bold text-[10px]">
                        Preventive Poka-Yoke Kaizen
                      </span>
                      <p className="text-zinc-700 dark:text-zinc-300">{defect.aiAnalysis.preventiveAction}</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                      <span className="font-mono text-amber-700 dark:text-amber-400 uppercase font-bold text-[10px]">
                        Quality Verification Protocol
                      </span>
                      <p className="text-zinc-700 dark:text-zinc-300">{defect.aiAnalysis.verificationMethod}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                  <Lightbulb className="w-8 h-8 mx-auto text-amber-500" />
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Generate Automotive Kaizen Analysis
                  </p>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    Click "AI Kaizen Advisor" in the top bar to synthesize instant containment steps, 5-Why hypothesis, and IATF 16949 countermeasures.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Five Why Ladder */}
          {activeTab === 'five_why' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                  Toyota Production System (TPS) 5-Why Root Cause Drill-down
                </span>
                <button
                  onClick={handleSaveFiveWhy}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold transition-colors"
                >
                  Save 5-Why Analysis
                </button>
              </div>

              {[1, 2, 3, 4, 5].map((lvl) => {
                const key = `why${lvl}` as keyof FiveWhyAnalysis;
                return (
                  <div key={lvl} className="flex items-start gap-3">
                    <span className="w-8 h-8 flex items-center justify-center font-mono text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shrink-0">
                      W{lvl}
                    </span>
                    <div className="flex-1">
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                        Why did this happen? (Level {lvl})
                      </label>
                      <input
                        type="text"
                        value={(fiveWhy[key] as string) || ''}
                        onChange={(e) => setFiveWhy({ ...fiveWhy, [key]: e.target.value })}
                        placeholder={`Enter why response ${lvl}...`}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs font-sans text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <label className="block text-xs font-mono font-bold text-rose-600 dark:text-rose-400 mb-1 uppercase">
                  Identified True Root Cause (Actionable Kaizen Target):
                </label>
                <textarea
                  rows={2}
                  value={fiveWhy.rootCause || ''}
                  onChange={(e) => setFiveWhy({ ...fiveWhy, rootCause: e.target.value })}
                  placeholder="Summarize the core systemic failure (e.g., absence of automated torque interlock on station 4)..."
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-rose-300 dark:border-rose-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Fishbone Ishikawa 6M Diagram */}
          {activeTab === 'fishbone' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                  Ishikawa 6M Cause-and-Effect Factor Matrix
                </span>
                
                {/* Add factor input */}
                <div className="flex items-center gap-2">
                  <select
                    value={newFishboneInput.category}
                    onChange={(e) => setNewFishboneInput({ ...newFishboneInput, category: e.target.value as keyof FishboneFactors })}
                    className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                  >
                    <option value="man">Man (Personnel)</option>
                    <option value="machine">Machine (Tooling)</option>
                    <option value="method">Method (SOP)</option>
                    <option value="material">Material (Parts)</option>
                    <option value="measurement">Measurement (Gages)</option>
                    <option value="milieu">Milieu (Environment)</option>
                  </select>
                  <input
                    type="text"
                    value={newFishboneInput.text}
                    onChange={(e) => setNewFishboneInput({ ...newFishboneInput, text: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFishboneItem()}
                    placeholder="Contributory factor..."
                    className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                  />
                  <button
                    onClick={handleAddFishboneItem}
                    className="px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-mono font-semibold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* 6M Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'man', label: '1. Man (Operator / Training)', color: 'border-l-blue-500' },
                  { key: 'machine', label: '2. Machine (Tooling / Calibration)', color: 'border-l-emerald-500' },
                  { key: 'method', label: '3. Method (SWI / Work Cycle)', color: 'border-l-purple-500' },
                  { key: 'material', label: '4. Material (Component Specs)', color: 'border-l-amber-500' },
                  { key: 'measurement', label: '5. Measurement (Calibration / Sensor)', color: 'border-l-cyan-500' },
                  { key: 'milieu', label: '6. Milieu (Shop Floor / Temperature)', color: 'border-l-rose-500' },
                ].map(({ key, label, color }) => {
                  const items = fishbone[key as keyof FishboneFactors] || [];
                  return (
                    <div
                      key={key}
                      className={`p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 border-l-4 ${color} space-y-2`}
                    >
                      <h4 className="text-[11px] font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200">
                        {label}
                      </h4>
                      {items.length === 0 ? (
                        <p className="text-[11px] text-zinc-400 italic">No factors recorded yet.</p>
                      ) : (
                        <ul className="space-y-1">
                          {items.map((item, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5"
                            >
                              <span className="text-zinc-400 font-mono">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Countermeasures Tracker */}
          {activeTab === 'countermeasures' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                  D5/D6 Action Tracker (ICA, PCA & Error-Proofing Poka-Yoke)
                </span>
                <button
                  onClick={() => setShowAddCm(!showAddCm)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddCm ? 'Cancel' : '+ New Countermeasure'}</span>
                </button>
              </div>

              {/* Add form */}
              {showAddCm && (
                <form
                  onSubmit={handleAddCountermeasure}
                  className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1">Action Type</label>
                      <select
                        value={cmForm.type}
                        onChange={(e) => setCmForm({ ...cmForm, type: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                      >
                        <option value="containment">ICA (Containment)</option>
                        <option value="corrective">PCA (Corrective)</option>
                        <option value="preventive">Poka-Yoke (Preventive)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1">Assignee</label>
                      <input
                        type="text"
                        value={cmForm.assignedTo}
                        onChange={(e) => setCmForm({ ...cmForm, assignedTo: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-sans"
                        placeholder="e.g. Line Lead / Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1">Target Date</label>
                      <input
                        type="date"
                        value={cmForm.targetDate}
                        onChange={(e) => setCmForm({ ...cmForm, targetDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1">Action Title</label>
                    <input
                      type="text"
                      value={cmForm.title}
                      onChange={(e) => setCmForm({ ...cmForm, title: e.target.value })}
                      placeholder="e.g. Install optical sensor to prevent unseated harness CPA"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1">Action Protocol</label>
                    <textarea
                      rows={2}
                      value={cmForm.description}
                      onChange={(e) => setCmForm({ ...cmForm, description: e.target.value })}
                      placeholder="Step-by-step engineering implementation details..."
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-mono font-semibold"
                  >
                    Save Countermeasure
                  </button>
                </form>
              )}

              {/* List of existing countermeasures */}
              <div className="space-y-3">
                {defect.countermeasures.length === 0 ? (
                  <p className="p-8 text-center text-xs text-zinc-400 font-mono">
                    No countermeasures logged yet. Use "+ New Countermeasure" or run "AI Kaizen Advisor".
                  </p>
                ) : (
                  defect.countermeasures.map((cm) => (
                    <div
                      key={cm.id}
                      className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[10px] uppercase px-2 py-0.5 font-bold ${
                              cm.type === 'containment'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : cm.type === 'corrective'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {cm.type}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{cm.title}</h4>
                        </div>

                        {/* Status selector */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-zinc-500">Status:</span>
                          <select
                            value={cm.status}
                            onChange={(e) => handleUpdateCmStatus(cm.id, e.target.value as any)}
                            className="px-2 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-[11px] font-mono"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In-Progress</option>
                            <option value="implemented">Implemented</option>
                            <option value="verified">Verified (Pass)</option>
                          </select>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-700 dark:text-zinc-300">{cm.description}</p>

                      <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                        <span>Assigned: {cm.assignedTo}</span>
                        <span>Target: {cm.targetDate}</span>
                        {cm.effectivenessPercent && (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Effectiveness: {cm.effectivenessPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Shift Log & Operator/Supervisor Comments */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                  Real-time Shift Collaboration & Engineering Notes
                </span>
              </div>

              {/* Comments Feed */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {defect.comments.length === 0 ? (
                  <p className="text-xs text-zinc-400 font-mono py-6 text-center">
                    No shift comments yet. Leave a hand-off note or escalation log below.
                  </p>
                ) : (
                  defect.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 border text-xs space-y-1 ${
                        comment.isSupervisorNote
                          ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {comment.author} ({comment.role.toUpperCase()})
                        </span>
                        <span className="text-zinc-400">
                          {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Type engineering note, shift hand-off observation..."
                  className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs font-sans"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-mono font-semibold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
