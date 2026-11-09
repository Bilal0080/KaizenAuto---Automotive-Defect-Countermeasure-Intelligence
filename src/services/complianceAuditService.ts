import { Defect, ComplianceAuditItem, ComplianceAuditReport, DefectSeverity, DefectCategory } from '../types/index.ts';

export const complianceAuditService = {
  generateAuditReport(defect: Defect, auditorName = 'Lead Quality Auditor'): ComplianceAuditReport {
    const items: ComplianceAuditItem[] = [];
    const severity = defect.severity;
    const category = defect.category;

    // Has 5-Why completed?
    const hasFiveWhy = Boolean(defect.fiveWhy && defect.fiveWhy.completed);
    // Has Containment Action?
    const hasContainment = defect.countermeasures.some(c => c.type === 'containment') || Boolean(defect.aiAnalysis?.containmentAction);
    // Has Corrective Action?
    const hasCorrective = defect.countermeasures.some(c => c.type === 'corrective') || Boolean(defect.aiAnalysis?.correctiveAction);
    // Has Preventive / Poka-Yoke?
    const hasPokaYoke = defect.countermeasures.some(c => c.type === 'preventive') || Boolean(defect.aiAnalysis?.preventiveAction);
    // Has Verification Protocol?
    const hasVerification = defect.countermeasures.some(c => c.status === 'verified') || Boolean(defect.aiAnalysis?.verificationMethod);

    // 1. Core Clause 10.2.3: Problem Solving & Root Cause
    items.push({
      id: 'iatf_10_2_3_method',
      clause: '10.2.3(a)',
      title: 'Defined 8D Problem Solving Discipline',
      requirement: 'The organization shall define and execute a disciplined problem-solving process (8D format) to address root cause.',
      category: 'Problem Solving & Root Cause (10.2.3)',
      mandatoryForSeverity: 'all',
      status: 'compliant',
      severityLevel: severity,
      evidenceNote: `D1-D8 format active for defect code ${defect.defectCode}. Initial triage established.`,
      targetTimelineHours: 24,
    });

    items.push({
      id: 'iatf_10_2_3_root_cause',
      clause: '10.2.3(c)',
      title: 'Root Cause Determination & Escape Point Verification',
      requirement: 'Appropriate root cause analysis (5-Why, Ishikawa diagram) shall be conducted to identify why the defect occurred and why it escaped.',
      category: 'Problem Solving & Root Cause (10.2.3)',
      mandatoryForSeverity: 'all',
      status: hasFiveWhy ? 'compliant' : 'pending',
      severityLevel: severity,
      evidenceNote: hasFiveWhy
        ? `5-Why completed. Verified root cause: "${defect.fiveWhy?.rootCause || 'Root cause confirmed'}"`
        : '5-Why root-cause ladder in progress. Level 5 drill-down required before sign-off.',
      targetTimelineHours: severity === 'critical' ? 12 : 24,
    });

    // 2. Core Clause 8.7: Containment & Control of Suspect Product
    items.push({
      id: 'iatf_8_7_1_3_clean_point',
      clause: '8.7.1.3',
      title: 'Control of Suspect Product & Clean Point Identification',
      requirement: 'Suspect products shall be contained and quarantined across all assembly queues between last known good verification and defect detection.',
      category: 'Containment & Suspect Product (8.7)',
      mandatoryForSeverity: 'all',
      status: hasContainment ? 'compliant' : 'pending',
      severityLevel: severity,
      evidenceNote: hasContainment
        ? `Clean point established for VIN ${defect.vinOrUnitId}. Interim containment (ICA) initiated.`
        : 'Immediate 100% lot containment protocol must be issued for station buffer.',
      targetTimelineHours: severity === 'critical' ? 2 : 8,
    });

    // 3. Core Clause 10.2.4: Error-Proofing (Poka-Yoke)
    items.push({
      id: 'iatf_10_2_4_pokayoke',
      clause: '10.2.4',
      title: 'Error-Proofing (Poka-Yoke) Device Implementation',
      requirement: 'The organization shall utilize error-proofing methodologies in corrective actions. Frequency of verification shall be documented in the Control Plan.',
      category: 'Error-Proofing Poka-Yoke (10.2.4)',
      mandatoryForSeverity: severity === 'critical' ? 'critical_only' : 'major_and_critical',
      status: hasPokaYoke ? 'compliant' : 'pending',
      severityLevel: severity,
      evidenceNote: hasPokaYoke
        ? 'Poka-Yoke corrective action proposed to physically prevent reverse or defective assembly.'
        : 'Poka-Yoke fixture or PLC interlock must be designed and verified to satisfy Clause 10.2.4.',
      targetTimelineHours: 48,
    });

    // 4. Core Clause 8.5.1: Control Plan & Standardized Work Instructions
    items.push({
      id: 'iatf_8_5_1_1_control_plan',
      clause: '8.5.1.1',
      title: 'Control Plan Synchronization & Revision',
      requirement: 'Control plans shall be reviewed and updated when any change occurs that impacts the product, process, or corrective action.',
      category: 'Control Plan & Standard Work (8.5.1)',
      mandatoryForSeverity: 'major_and_critical',
      status: hasCorrective ? 'compliant' : 'pending',
      severityLevel: severity,
      evidenceNote: hasCorrective
        ? 'Control Plan CP-2026 update drafted reflecting station tooling revisions.'
        : 'Control Plan update pending engineering sign-off upon countermeasure release.',
      targetTimelineHours: 72,
    });

    items.push({
      id: 'iatf_8_5_1_2_swi',
      clause: '8.5.1.2',
      title: 'Standard Work Instructions (SWI) & Operator Training',
      requirement: 'Standard work instructions shall be updated and communicated to line personnel with verifiable training sign-off.',
      category: 'Control Plan & Standard Work (8.5.1)',
      mandatoryForSeverity: 'all',
      status: 'pending',
      severityLevel: severity,
      evidenceNote: 'Operator Standard Work (SWI) revision and tactile training briefing pending at shift hand-off.',
      targetTimelineHours: 24,
    });

    // 5. Core Clause 8.3.5.2 & 9.1: PFMEA Risk Recalculation
    items.push({
      id: 'iatf_8_3_5_2_pfmea',
      clause: '8.3.5.2',
      title: 'Process FMEA (PFMEA) Action Priority (AP) Update',
      requirement: 'Process FMEA must be reviewed to recalculate Occurrence and Detection rankings and lower Action Priority (AP) risk.',
      category: 'PFMEA & Risk Analysis (8.3.5 / 9.1)',
      mandatoryForSeverity: severity === 'critical' ? 'critical_only' : 'major_and_critical',
      status: hasPokaYoke ? 'compliant' : 'pending',
      severityLevel: severity,
      evidenceNote: hasPokaYoke
        ? 'PFMEA RPN review scheduled with tooling engineer; Detection score improved via interlock.'
        : 'PFMEA Occurrence/Detection risk ranking must be updated in accordance with AIAG-VDA standard.',
      targetTimelineHours: 48,
    });

    // 6. SEVERITY-SPECIFIC REQUIREMENTS
    if (severity === 'critical') {
      items.push({
        id: 'iatf_8_7_1_7_customer_notice',
        clause: '8.7.1.7',
        title: 'Customer & Regulatory Escalation (24h Mandatory Notice)',
        requirement: 'The organization shall immediately notify the customer(s) if nonconforming product has been shipped or if safety/regulatory risk exists.',
        category: 'Customer & Management Escalation (8.7.1.7)',
        mandatoryForSeverity: 'critical_only',
        status: defect.andonTriggered ? 'compliant' : 'pending',
        severityLevel: 'critical',
        evidenceNote: defect.andonTriggered
          ? 'Andon line stop active. Plant Quality Director and OEM escalation protocol initiated within SLA.'
          : 'CRITICAL ESCALATION REQUIRED: Plant director and customer quality desk notification pending.',
        targetTimelineHours: 24,
      });

      items.push({
        id: 'iatf_8_5_1_3_andon_release',
        clause: '8.5.1.3',
        title: 'Verification After Line Shutdown & Andon Release Protocol',
        requirement: 'Verification of job set-up and product characteristics shall be performed before releasing line after stoppage.',
        category: 'Containment & Suspect Product (8.7)',
        mandatoryForSeverity: 'critical_only',
        status: !defect.andonTriggered ? 'compliant' : 'pending',
        severityLevel: 'critical',
        evidenceNote: !defect.andonTriggered
          ? 'Line stop resolved and verified by shift supervisor with physical clean-point check.'
          : 'Andon line stop is currently ACTIVE. Pre-release verification checklist must be executed.',
        targetTimelineHours: 4,
      });

      items.push({
        id: 'iatf_7_1_5_1_special_char',
        clause: '7.1.5.1.1',
        title: 'Special Characteristic (CC/SC ∇) 100% Traceability Audit',
        requirement: 'Special characteristics affecting safety or regulation compliance shall have 100% documented traceability records.',
        category: 'Measurement & Calibration (7.1.5)',
        mandatoryForSeverity: 'critical_only',
        status: 'compliant',
        severityLevel: 'critical',
        evidenceNote: `VIN ${defect.vinOrUnitId} and part serial recorded in digital MES trace database.`,
        targetTimelineHours: 8,
      });
    } else if (severity === 'major') {
      items.push({
        id: 'iatf_8_7_1_4_rework',
        clause: '8.7.1.4',
        title: 'Control of Reworked Product Authorization',
        requirement: 'Rework instructions and risk assessment shall be authorized by designated personnel before commencing repair.',
        category: 'Containment & Suspect Product (8.7)',
        mandatoryForSeverity: 'major_and_critical',
        status: hasCorrective ? 'compliant' : 'pending',
        severityLevel: 'major',
        evidenceNote: 'Rework procedure verified for off-line finesse bay with designated inspector sign-off.',
        targetTimelineHours: 24,
      });

      items.push({
        id: 'iatf_9_2_2_3_lpa',
        clause: '9.2.2.3',
        title: 'Layered Process Audit (LPA) 5-Shift Follow-up',
        requirement: 'Manufacturing process audits shall verify compliance across multiple operating shifts.',
        category: 'Problem Solving & Root Cause (10.2.3)',
        mandatoryForSeverity: 'major_and_critical',
        status: 'pending',
        severityLevel: 'major',
        evidenceNote: 'Layered Process Audit scheduled for Shift A, B, and C over next 48 hours.',
        targetTimelineHours: 48,
      });
    } else {
      // Minor Severity
      items.push({
        id: 'iatf_8_5_1_2_opl',
        clause: '8.5.1.2',
        title: 'In-Station Kaizen One-Point Lesson (OPL)',
        requirement: 'Visual standard and one-point lesson shall be posted at workstation to prevent recurrence.',
        category: 'Control Plan & Standard Work (8.5.1)',
        mandatoryForSeverity: 'all',
        status: 'compliant',
        severityLevel: 'minor',
        evidenceNote: `Visual quality boundary sample and One-Point Lesson posted at ${defect.station}.`,
        targetTimelineHours: 48,
      });
    }

    // 7. CATEGORY-SPECIFIC IATF 16949 AUDIT CLAUSES
    switch (category) {
      case 'Torque & Fastener':
        items.push({
          id: 'cat_torque_msa',
          clause: '7.1.5.1.1',
          title: 'DC Spindle Calibration & Dynamic Torque MSA (Gauge R&R)',
          requirement: 'Measurement systems for critical fasteners shall undergo statistical Gauge R&R and dynamic rundown verification.',
          category: 'Measurement & Calibration (7.1.5)',
          mandatoryForSeverity: 'all',
          status: 'compliant',
          severityLevel: severity,
          evidenceNote: 'DC electric torque gun calibrated with digital rotary transducer; program angle locked.',
          targetTimelineHours: 24,
        });
        break;

      case 'Electrical & Harness':
        items.push({
          id: 'cat_electrical_cpa',
          clause: '8.5.1.1',
          title: 'Harness CPA Secondary Lock Optical & Tactile Verification',
          requirement: 'High-voltage/critical wire connectors shall have positive physical secondary lock interlock verification.',
          category: 'Control Plan & Standard Work (8.5.1)',
          mandatoryForSeverity: 'all',
          status: hasPokaYoke ? 'compliant' : 'pending',
          severityLevel: severity,
          evidenceNote: 'Optical vision camera inspection integrated into harness routing fixture to inspect CPA.',
          targetTimelineHours: 24,
        });
        break;

      case 'Paint & Surface':
        items.push({
          id: 'cat_paint_tpm',
          clause: '8.5.1.5',
          title: 'Paint Booth Cleanroom Environmental Control (TPM)',
          requirement: 'Maintenance of spray booth plenum air filtration and electrostatic applicator nozzles shall be verified.',
          category: 'Control Plan & Standard Work (8.5.1)',
          mandatoryForSeverity: 'all',
          status: 'compliant',
          severityLevel: severity,
          evidenceNote: 'Filter differential pressure logged within specification (< 150 Pa); air ionization operational.',
          targetTimelineHours: 24,
        });
        break;

      case 'Body & Welding':
        items.push({
          id: 'cat_weld_ndt',
          clause: '8.5.1.2',
          title: 'Ultrasonic Spot Weld NDT & Electrode Cap Dressing Logs',
          requirement: 'Resistance spot welds shall be inspected via non-destructive testing with electrode dressing cycle limits enforced.',
          category: 'Control Plan & Standard Work (8.5.1)',
          mandatoryForSeverity: 'all',
          status: 'compliant',
          severityLevel: severity,
          evidenceNote: 'Ultrasonic inspection completed on previous 10 joints; automated tip dresser reset to 150 weld cycles.',
          targetTimelineHours: 12,
        });
        break;

      case 'Fluid & Leaks':
        items.push({
          id: 'cat_fluid_leak',
          clause: '8.5.1.1',
          title: '100% Pressure Decay & Vacuum Helium Leak Verification',
          requirement: 'Fluid circuits shall undergo automated decay leak verification with traceable test threshold data.',
          category: 'Control Plan & Standard Work (8.5.1)',
          mandatoryForSeverity: 'all',
          status: hasVerification ? 'compliant' : 'pending',
          severityLevel: severity,
          evidenceNote: 'Vacuum decay test at 0.5 bar decay threshold completed on repair unit with zero pressure drop.',
          targetTimelineHours: 12,
        });
        break;

      case 'Powertrain & Mechanical':
        items.push({
          id: 'cat_powertrain_spc',
          clause: '9.1.1.2',
          title: 'Statistical Process Control (SPC) Capability (Cpk >= 1.67)',
          requirement: 'Key powertrain mating tolerances shall achieve ongoing statistical process capability Cpk >= 1.67.',
          category: 'PFMEA & Risk Analysis (8.3.5 / 9.1)',
          mandatoryForSeverity: 'major_and_critical',
          status: 'pending',
          severityLevel: severity,
          evidenceNote: '30-part consecutive capability study initiated to confirm process centering and variance limits.',
          targetTimelineHours: 48,
        });
        break;

      case 'Trim & Gap Flush':
        items.push({
          id: 'cat_gap_gauge',
          clause: '7.1.5.1.1',
          title: 'Optical Flush & Gap Profilometer Gauge Calibration',
          requirement: 'Laser optical flush gauges shall be calibrated using certified step blocks before inspection.',
          category: 'Measurement & Calibration (7.1.5)',
          mandatoryForSeverity: 'all',
          status: 'compliant',
          severityLevel: severity,
          evidenceNote: 'Laser sensor calibrated with 3.5mm master shim block. Gauge repeatability verified.',
          targetTimelineHours: 24,
        });
        break;

      case 'Electronics & ADAS':
        items.push({
          id: 'cat_adas_diag',
          clause: '8.5.1.1',
          title: 'End-of-Line Diagnostic Scan & Zero DTC Clearance',
          requirement: 'Electronic controllers and radar/camera sensors shall have zero active or pending diagnostic codes upon line release.',
          category: 'Control Plan & Standard Work (8.5.1)',
          mandatoryForSeverity: 'all',
          status: 'compliant',
          severityLevel: severity,
          evidenceNote: 'CAN bus EOL scanner registered zero active DTCs on all gateway controllers.',
          targetTimelineHours: 8,
        });
        break;
    }

    // Calculate score
    const compliantCount = items.filter(i => i.status === 'compliant').length;
    const pendingCount = items.filter(i => i.status === 'pending').length;
    const totalCount = items.length;
    const complianceScorePercent = Math.round((compliantCount / totalCount) * 100);

    const criticalItems = items.filter(i => i.mandatoryForSeverity === 'critical_only');
    const criticalItemsPassed = criticalItems.every(i => i.status === 'compliant');

    return {
      auditId: `AUD-IATF-${defect.defectCode.replace(/[^0-9]/g, '') || Date.now()}`,
      defectId: defect.id,
      defectCode: defect.defectCode,
      auditDate: new Date().toISOString(),
      auditorName,
      standard: 'IATF 16949:2016',
      severity,
      category,
      complianceScorePercent,
      criticalItemsPassed,
      totalItems: totalCount,
      compliantCount,
      pendingCount,
      items,
    };
  },
};
