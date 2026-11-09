export type UserRole = 'worker' | 'inspector' | 'supervisor' | 'manager';

export interface UserProfile {
  id: string;
  name: string;
  badgeId: string;
  role: UserRole;
  station: string;
  avatar?: string;
  department: string;
}

export type DefectSeverity = 'critical' | 'major' | 'minor';

export type DefectStatus = 
  | 'open' 
  | 'investigating' 
  | 'countermeasure_proposed' 
  | 'verified' 
  | 'closed';

export type DefectCategory =
  | 'Torque & Fastener'
  | 'Paint & Surface'
  | 'Body & Welding'
  | 'Electrical & Harness'
  | 'Powertrain & Mechanical'
  | 'Fluid & Leaks'
  | 'Trim & Gap Flush'
  | 'Electronics & ADAS';

export type VehicleZone =
  | 'front_bumper'
  | 'hood_engine'
  | 'windshield'
  | 'doors_left'
  | 'doors_right'
  | 'roof'
  | 'interior_cabin'
  | 'underbody_battery'
  | 'rear_trunk'
  | 'rear_suspension';

export interface Countermeasure {
  id: string;
  type: 'containment' | 'corrective' | 'preventive';
  title: string;
  description: string;
  assignedTo: string;
  targetDate: string;
  status: 'pending' | 'in_progress' | 'implemented' | 'verified';
  effectivenessPercent?: number;
  approvedBy?: string;
  updatedAt: string;
}

export interface FiveWhyAnalysis {
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  rootCause: string;
  completed: boolean;
}

export interface FishboneFactors {
  man: string[];
  machine: string[];
  method: string[];
  material: string[];
  measurement: string[];
  milieu: string[];
}

export interface DefectComment {
  id: string;
  author: string;
  role: UserRole;
  text: string;
  timestamp: string;
  isSupervisorNote?: boolean;
}

export interface Defect {
  id: string;
  defectCode: string;
  title: string;
  description: string;
  category: DefectCategory;
  severity: DefectSeverity;
  status: DefectStatus;
  line: string;
  station: string;
  vehicleZone: VehicleZone;
  vinOrUnitId: string;
  partNumber?: string;
  reportedBy: string;
  reportedByBadge: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  andonTriggered: boolean;
  fiveWhy?: FiveWhyAnalysis;
  fishbone?: FishboneFactors;
  countermeasures: Countermeasure[];
  comments: DefectComment[];
  resolutionTimeHours?: number;
  aiAnalysis?: {
    summary: string;
    rootCauseHypothesis: string;
    containmentAction: string;
    correctiveAction: string;
    preventiveAction: string;
    verificationMethod: string;
    recommendedTimelineHours: number;
    source: string;
  };
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  station: string;
  defectId?: string;
  read: boolean;
  acknowledgedBy?: string;
}

export type LanguageCode = 'en' | 'ur' | 'ur_roman' | 'de' | 'ja' | 'es';

export type IatfClauseCategory = 
  | 'Containment & Suspect Product (8.7)'
  | 'Problem Solving & Root Cause (10.2.3)'
  | 'Error-Proofing Poka-Yoke (10.2.4)'
  | 'Control Plan & Standard Work (8.5.1)'
  | 'PFMEA & Risk Analysis (8.3.5 / 9.1)'
  | 'Measurement & Calibration (7.1.5)'
  | 'Customer & Management Escalation (8.7.1.7)';

export interface ComplianceAuditItem {
  id: string;
  clause: string;
  title: string;
  requirement: string;
  category: IatfClauseCategory;
  mandatoryForSeverity: 'all' | 'major_and_critical' | 'critical_only';
  status: 'compliant' | 'pending' | 'not_applicable';
  severityLevel: DefectSeverity;
  evidenceNote: string;
  verifiedBy?: string;
  targetTimelineHours: number;
}

export interface ComplianceAuditReport {
  auditId: string;
  defectId: string;
  defectCode: string;
  auditDate: string;
  auditorName: string;
  standard: 'IATF 16949:2016';
  severity: DefectSeverity;
  category: DefectCategory;
  complianceScorePercent: number;
  criticalItemsPassed: boolean;
  totalItems: number;
  compliantCount: number;
  pendingCount: number;
  items: ComplianceAuditItem[];
}
