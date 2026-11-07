import { Defect, NotificationAlert, UserProfile } from '../types';

const DEFECTS_KEY = 'kaizenauto_defects_v1';
const ALERTS_KEY = 'kaizenauto_alerts_v1';
const OFFLINE_QUEUE_KEY = 'kaizenauto_offline_queue_v1';
const CURRENT_USER_KEY = 'kaizenauto_user_v1';
const BACKUP_META_KEY = 'kaizenauto_backup_meta_v1';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Bilal Khan (Worker)',
    badgeId: 'OP-4829',
    role: 'worker',
    station: 'Station 14: Chassis Bolting',
    department: 'Final Assembly Line 1',
  },
  {
    id: 'usr-2',
    name: 'Elena Rostova (Inspector)',
    badgeId: 'QC-1104',
    role: 'inspector',
    station: 'Quality Inspection Gate 3',
    department: 'Quality Assurance',
  },
  {
    id: 'usr-3',
    name: 'Tariq Mehmood (Supervisor)',
    badgeId: 'SV-9921',
    role: 'supervisor',
    station: 'Shift A Assembly Command',
    department: 'Operations & Production',
  },
  {
    id: 'usr-4',
    name: 'Dr. Michael Chen (Manager)',
    badgeId: 'QM-0012',
    role: 'manager',
    station: 'Quality Directorate',
    department: 'Plant Quality Management',
  },
];

const INITIAL_DEFECTS: Defect[] = [
  {
    id: 'def-101',
    defectCode: 'DEF-2026-081',
    title: 'Front Subframe M14 Bolt Under-Torqued (82 Nm vs 115 Nm)',
    description: 'During torque verification gate, front left subframe bolt registered 82 Nm. Standard requirement is 115 Nm ± 5 Nm.',
    category: 'Torque & Fastener',
    severity: 'critical',
    status: 'investigating',
    line: 'Chassis Line 2',
    station: 'Station 14: Subframe Mount',
    vehicleZone: 'underbody_battery',
    vinOrUnitId: 'VIN-WAUZZZ-89104',
    partNumber: 'N-911-470-01',
    reportedBy: 'Bilal Khan (OP-4829)',
    reportedByBadge: 'OP-4829',
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800',
    andonTriggered: true,
    fiveWhy: {
      why1: 'Subframe bolt reached only 82 Nm instead of 115 Nm.',
      why2: 'DC electric torque spindle cut off prematurely during run-down.',
      why3: 'Angle-control transducer detected artificial cross-thread peak resistance.',
      why4: 'Weld spatter in tapped weld-nut on chassis cross-member prevented free spin.',
      why5: 'Electrode tip dressing interval at Body Weld Station 06 was exceeded by 180 cycles, ejecting weld expulsion into thread cavity.',
      rootCause: 'Weld splatter contamination from worn electrode caps entering unprotected weld nuts before chassis painting.',
      completed: true,
    },
    fishbone: {
      man: ['Operator noticed torque gun green light did not illuminate'],
      machine: ['DC Torque Spindle #4 calibration drift', 'Weld robot #12 cap wear'],
      method: ['Thread protection plugs omitted during body welding'],
      material: ['M14 Zinc-flake coated high tensile flange bolt'],
      measurement: ['Digital torque wrench audit at Gate 3'],
      milieu: ['High humidity in weld shop causing minor oxidation'],
    },
    countermeasures: [
      {
        id: 'cm-1',
        type: 'containment',
        title: '100% Manual Torque Check on Shift A Chassis',
        description: 'Quarantine 18 vehicles produced on Shift A and re-torque with calibrated manual click wrench.',
        assignedTo: 'Elena Rostova (QC-1104)',
        targetDate: '2026-11-07',
        status: 'verified',
        effectivenessPercent: 100,
        approvedBy: 'Tariq Mehmood',
        updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      },
      {
        id: 'cm-2',
        type: 'corrective',
        title: 'Install Heat-Resistant Silicone Thread Masks in Weld Shop',
        description: 'Add reusable silicone caps over weld-nuts during robot welding cycle to prevent spatter ingress.',
        assignedTo: 'Manufacturing Engineering (Tooling)',
        targetDate: '2026-11-09',
        status: 'in_progress',
        effectivenessPercent: 85,
        updatedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
      },
    ],
    comments: [
      {
        id: 'c-1',
        author: 'Bilal Khan (Worker)',
        role: 'worker',
        text: 'Andon cord pulled. Torque spindle gave error code E-14 (premature torque cutoff).',
        timestamp: new Date(Date.now() - 3600000 * 2.4).toISOString(),
      },
      {
        id: 'c-2',
        author: 'Tariq Mehmood (Supervisor)',
        role: 'supervisor',
        text: 'Supervisor acknowledged. Station 14 line paused for 4 minutes to verify adjacent VINs.',
        timestamp: new Date(Date.now() - 3600000 * 2.2).toISOString(),
        isSupervisorNote: true,
      },
    ],
    aiAnalysis: {
      summary: 'Critical under-torque caused by weld spatter in chassis weld-nut triggering false torque shutoff.',
      rootCauseHypothesis: 'Expulsion splatter from Body Weld Cell #6 contaminating M14 female thread pitch.',
      containmentAction: '100% offline torque sweep with certified click wrench on last 25 units; inspect thread cavity.',
      correctiveAction: 'Reprogram DC torque angle threshold to abort on high run-down friction and flag thread defect.',
      preventiveAction: 'Incorporate magnetic silicone thread plug into weld fixture standard operating procedure.',
      verificationMethod: 'Residual torque audit on 50 consecutive units + zero defect audit on shift handoff.',
      recommendedTimelineHours: 24,
      source: 'Kaizen 8D Automotive Quality Engine',
    },
  },
  {
    id: 'def-102',
    defectCode: 'DEF-2026-082',
    title: 'HV Battery Pack High-Voltage Connector CPA Lock Not Engaged',
    description: 'Connector Position Assurance (CPA) secondary red lock was left in released state on main inverter busbar feed.',
    category: 'Electrical & Harness',
    severity: 'critical',
    status: 'countermeasure_proposed',
    line: 'Powertrain Line 1',
    station: 'Station 22: High Voltage Harness',
    vehicleZone: 'underbody_battery',
    vinOrUnitId: 'VIN-WAUZZZ-89112',
    partNumber: 'HV-800V-CONN-A',
    reportedBy: 'Elena Rostova (QC-1104)',
    reportedByBadge: 'QC-1104',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    andonTriggered: true,
    countermeasures: [
      {
        id: 'cm-3',
        type: 'containment',
        title: 'Tactile Click Verification at End-of-Line Tester',
        description: 'Inspector checks red CPA slide on every vehicle with mirror and physical push-pull test.',
        assignedTo: 'Elena Rostova',
        targetDate: '2026-11-07',
        status: 'implemented',
        effectivenessPercent: 95,
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'cm-4',
        type: 'preventive',
        title: 'Cognex Vision AI Camera for CPA Lock Presence',
        description: 'Mount industrial optical sensor on Station 22 to verify red tab position before conveyor index.',
        assignedTo: 'Automation Team',
        targetDate: '2026-11-12',
        status: 'pending',
        updatedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      },
    ],
    comments: [
      {
        id: 'c-3',
        author: 'Elena Rostova',
        role: 'inspector',
        text: 'Detected during EOL electrical continuity stage. Critical safety concern for 800V architecture.',
        timestamp: new Date(Date.now() - 3600000 * 4.9).toISOString(),
      },
    ],
  },
  {
    id: 'def-103',
    defectCode: 'DEF-2026-083',
    title: 'Driver Door Outer Panel Paint Fisheye & Dust Inclusion',
    description: '3mm diameter clearcoat cratering and dust particle inclusion detected on front left door upper crease line.',
    category: 'Paint & Surface',
    severity: 'major',
    status: 'open',
    line: 'Paint Shop Line B',
    station: 'Station 08: Clearcoat Inspection Booth',
    vehicleZone: 'doors_left',
    vinOrUnitId: 'VIN-WAUZZZ-89129',
    partNumber: 'DR-LH-PNL-04',
    reportedBy: 'Bilal Khan (OP-4829)',
    reportedByBadge: 'OP-4829',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    andonTriggered: false,
    countermeasures: [
      {
        id: 'cm-5',
        type: 'containment',
        title: 'Wet Sanding & Precision Polish in Finesse Deck',
        description: 'Polish with 3000 grit micro-abrasive and high gloss compound without repainting.',
        assignedTo: 'Paint Finesse Lead',
        targetDate: '2026-11-07',
        status: 'in_progress',
        updatedAt: new Date(Date.now() - 3600000 * 0.9).toISOString(),
      },
    ],
    comments: [],
  },
  {
    id: 'def-104',
    defectCode: 'DEF-2026-084',
    title: 'Hood-to-Fender Flush Gap Exceeds 4.8mm (Spec: 3.5mm ± 0.5mm)',
    description: 'Right hand hood gap measured 4.8mm at A-pillar intersection. Uneven visual margin observed.',
    category: 'Trim & Gap Flush',
    severity: 'minor',
    status: 'verified',
    line: 'Final Assembly Line 1',
    station: 'Station 31: Exterior Gap & Flush',
    vehicleZone: 'hood_engine',
    vinOrUnitId: 'VIN-WAUZZZ-89088',
    partNumber: 'HD-FR-ASM-01',
    reportedBy: 'Elena Rostova (QC-1104)',
    reportedByBadge: 'QC-1104',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    andonTriggered: false,
    countermeasures: [
      {
        id: 'cm-6',
        type: 'corrective',
        title: 'Adjust Hood Hinge Shim Gauge from 1.5mm to 1.0mm',
        description: 'Replaced spacer shim on right hood hinge bracket. Gap restored to 3.4mm nominal.',
        assignedTo: 'Station 31 Assembly Team',
        targetDate: '2026-11-07',
        status: 'verified',
        effectivenessPercent: 100,
        approvedBy: 'Tariq Mehmood',
        updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ],
    comments: [
      {
        id: 'c-4',
        author: 'Tariq Mehmood',
        role: 'supervisor',
        text: 'Laser gap gauge calibrated. Batch verified, all subsequent 12 vehicles within 3.3-3.6mm specification.',
        timestamp: new Date(Date.now() - 3600000 * 3.1).toISOString(),
      },
    ],
  },
  {
    id: 'def-105',
    defectCode: 'DEF-2026-085',
    title: 'Brake Caliper Bleeder Valve Micro Seepage During 120 Bar Pressure Test',
    description: 'Rear right brake caliper bleeder valve showed moisture bead at 120 bar hydraulic line verification.',
    category: 'Fluid & Leaks',
    severity: 'critical',
    status: 'closed',
    line: 'Chassis Line 2',
    station: 'Station 18: Brake Fluid Fill & Bleed',
    vehicleZone: 'rear_suspension',
    vinOrUnitId: 'VIN-WAUZZZ-89045',
    partNumber: 'BRK-RR-CAL-RH',
    reportedBy: 'Bilal Khan (OP-4829)',
    reportedByBadge: 'OP-4829',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    andonTriggered: true,
    countermeasures: [
      {
        id: 'cm-7',
        type: 'containment',
        title: 'Replace Caliper & Re-purge Brake Hydraulic Circuit',
        description: 'Defective valve replaced, secondary helium vacuum leak test passed.',
        assignedTo: 'Chassis Maintenance',
        targetDate: '2026-11-06',
        status: 'verified',
        effectivenessPercent: 100,
        approvedBy: 'Dr. Michael Chen',
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
    comments: [],
  },
];

const INITIAL_ALERTS: NotificationAlert[] = [
  {
    id: 'alt-1',
    title: 'Andon Cord Pulled: Station 14',
    message: 'Critical torque anomaly on Front Subframe M14 Bolt. Supervisor dispatch requested.',
    severity: 'critical',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    station: 'Station 14: Subframe Mount',
    defectId: 'def-101',
    read: false,
  },
  {
    id: 'alt-2',
    title: 'Safety Interlock Alert: HV Battery Line',
    message: 'High-voltage CPA lock release reported at Station 22. Line inspection required.',
    severity: 'critical',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    station: 'Station 22: High Voltage Harness',
    defectId: 'def-102',
    read: true,
    acknowledgedBy: 'Tariq Mehmood',
  },
  {
    id: 'alt-3',
    title: 'Shift A Quality Audit Reminder',
    message: 'Scheduled torque verification for batch VIN-89100 through VIN-89150 due in 30 minutes.',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    station: 'Gate 3 Quality Audit',
    read: false,
  },
];

export const storage = {
  getDefects(): Defect[] {
    try {
      const data = localStorage.getItem(DEFECTS_KEY);
      if (!data) {
        localStorage.setItem(DEFECTS_KEY, JSON.stringify(INITIAL_DEFECTS));
        return INITIAL_DEFECTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_DEFECTS;
    }
  },

  saveDefects(defects: Defect[]): void {
    try {
      localStorage.setItem(DEFECTS_KEY, JSON.stringify(defects));
    } catch (e) {
      console.error('Failed to save defects to local storage', e);
    }
  },

  addDefect(defect: Defect, isOffline = false): Defect[] {
    const list = this.getDefects();
    const updated = [defect, ...list];
    this.saveDefects(updated);

    if (isOffline) {
      this.addToOfflineQueue({ type: 'ADD_DEFECT', payload: defect, timestamp: new Date().toISOString() });
    }

    if (defect.severity === 'critical' || defect.andonTriggered) {
      this.addAlert({
        id: `alt-${Date.now()}`,
        title: `Andon Alert: ${defect.title}`,
        message: `Reported at ${defect.station}. Severity: ${defect.severity.toUpperCase()}. Immediate containment required.`,
        severity: 'critical',
        timestamp: new Date().toISOString(),
        station: defect.station,
        defectId: defect.id,
        read: false,
      });
    }

    return updated;
  },

  updateDefect(defect: Defect, isOffline = false): Defect[] {
    const list = this.getDefects();
    const updated = list.map((item) => (item.id === defect.id ? defect : item));
    this.saveDefects(updated);

    if (isOffline) {
      this.addToOfflineQueue({ type: 'UPDATE_DEFECT', payload: defect, timestamp: new Date().toISOString() });
    }

    return updated;
  },

  deleteDefect(id: string): Defect[] {
    const list = this.getDefects();
    const updated = list.filter((item) => item.id !== id);
    this.saveDefects(updated);
    return updated;
  },

  getAlerts(): NotificationAlert[] {
    try {
      const data = localStorage.getItem(ALERTS_KEY);
      if (!data) {
        localStorage.setItem(ALERTS_KEY, JSON.stringify(INITIAL_ALERTS));
        return INITIAL_ALERTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ALERTS;
    }
  },

  saveAlerts(alerts: NotificationAlert[]): void {
    try {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.error('Failed to save alerts', e);
    }
  },

  addAlert(alert: NotificationAlert): NotificationAlert[] {
    const list = this.getAlerts();
    const updated = [alert, ...list];
    this.saveAlerts(updated);
    return updated;
  },

  markAlertAsRead(id: string, acknowledgedBy?: string): NotificationAlert[] {
    const list = this.getAlerts();
    const updated = list.map((a) => (a.id === id ? { ...a, read: true, acknowledgedBy: acknowledgedBy || a.acknowledgedBy } : a));
    this.saveAlerts(updated);
    return updated;
  },

  getOfflineQueue(): any[] {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToOfflineQueue(item: any): void {
    const queue = this.getOfflineQueue();
    queue.push(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  },

  clearOfflineQueue(): void {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  getCurrentUser(): UserProfile {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return DEFAULT_USERS[0];
  },

  setCurrentUser(user: UserProfile): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  getBackupMeta(): { lastBackup: string; cloudSyncStatus: 'synced' | 'pending' } {
    try {
      const data = localStorage.getItem(BACKUP_META_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return {
      lastBackup: new Date(Date.now() - 3600000 * 3).toISOString(),
      cloudSyncStatus: 'synced',
    };
  },

  triggerCloudBackup(): { timestamp: string; totalRecords: number } {
    const defects = this.getDefects();
    const meta = {
      lastBackup: new Date().toISOString(),
      cloudSyncStatus: 'synced' as const,
      totalRecords: defects.length,
    };
    localStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta));
    this.clearOfflineQueue();
    return { timestamp: meta.lastBackup, totalRecords: defects.length };
  },

  exportBackupJson(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      defects: this.getDefects(),
      alerts: this.getAlerts(),
      users: DEFAULT_USERS,
      system: 'KaizenAuto Production IQ',
    };
    return JSON.stringify(data, null, 2);
  },

  restoreBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.defects && Array.isArray(parsed.defects)) {
        this.saveDefects(parsed.defects);
      }
      if (parsed.alerts && Array.isArray(parsed.alerts)) {
        this.saveAlerts(parsed.alerts);
      }
      return true;
    } catch {
      return false;
    }
  },

  resetDemoData(): Defect[] {
    localStorage.setItem(DEFECTS_KEY, JSON.stringify(INITIAL_DEFECTS));
    localStorage.setItem(ALERTS_KEY, JSON.stringify(INITIAL_ALERTS));
    this.clearOfflineQueue();
    return INITIAL_DEFECTS;
  },

  getNotifications(): NotificationAlert[] {
    return this.getAlerts();
  },

  saveNotification(alert: NotificationAlert): NotificationAlert[] {
    return this.addAlert(alert);
  },

  clearNotifications(): NotificationAlert[] {
    this.saveAlerts([]);
    return [];
  },

  saveDefect(defectData: Partial<Defect>, isOffline = false): Defect {
    const fullDefect: Defect = {
      id: defectData.id || `def-${Date.now()}`,
      defectCode: defectData.defectCode || `DEF-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: defectData.title || 'Untitled Defect',
      description: defectData.description || '',
      category: defectData.category || 'Torque & Fastener',
      severity: defectData.severity || 'major',
      status: defectData.status || 'open',
      line: defectData.line || 'Chassis Line 2',
      station: defectData.station || 'Station 14',
      vehicleZone: defectData.vehicleZone || 'underbody_battery',
      vinOrUnitId: defectData.vinOrUnitId || `VIN-WAUZZZ-${Math.floor(10000 + Math.random() * 90000)}`,
      partNumber: defectData.partNumber,
      reportedBy: defectData.reportedBy || 'Line Operator',
      reportedByBadge: defectData.reportedByBadge || 'OP-0000',
      createdAt: defectData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: defectData.imageUrl,
      andonTriggered: Boolean(defectData.andonTriggered),
      countermeasures: defectData.countermeasures || [],
      comments: defectData.comments || [],
      fiveWhy: defectData.fiveWhy,
      fishbone: defectData.fishbone,
      aiAnalysis: defectData.aiAnalysis,
    };

    this.addDefect(fullDefect, isOffline);
    return fullDefect;
  },

  getAvailableProfiles(): UserProfile[] {
    return DEFAULT_USERS;
  },

  syncOfflineQueue(): Defect[] {
    this.clearOfflineQueue();
    return this.getDefects();
  },
};

export const storageService = storage;

