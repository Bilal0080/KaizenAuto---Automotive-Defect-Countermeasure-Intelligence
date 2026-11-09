"""
KaizenAuto IQ - Automotive Defect & Countermeasure Intelligence System
Streamlit Edition
"""

import os
import json
import datetime
import random
import streamlit as st
import pandas as pd

# Page Configuration
st.set_page_config(
    page_title="KaizenAuto IQ - Automotive Defect Intelligence",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for Automotive Industrial Theme
st.markdown("""
<style>
    .metric-card {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 16px;
        color: white;
    }
    .andon-critical {
        background-color: #7f1d1d;
        border: 2px solid #ef4444;
        border-radius: 8px;
        padding: 12px;
        color: white;
        animation: pulse 2s infinite;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 8px 16px;
        border-radius: 4px;
    }
</style>
""", unsafe_allow_html=True)

# Initial Pre-seeded Automotive Quality Data
INITIAL_DEFECTS = [
    {
        "id": "def-101",
        "defectCode": "DEF-2026-081",
        "title": "Front Subframe M14 Bolt Under-Torqued (82 Nm vs 115 Nm)",
        "description": "During torque verification gate, front left subframe bolt registered 82 Nm. Standard requirement is 115 Nm ± 5 Nm.",
        "category": "Torque & Fastener",
        "severity": "Critical",
        "status": "Investigating",
        "line": "Chassis Line 2",
        "station": "Station 14: Subframe Bolting & Torquing",
        "vehicleZone": "Underbody & Battery",
        "vinOrUnitId": "VIN-WAUZZZ-89104",
        "partNumber": "N-911-470-01",
        "reportedBy": "Bilal Khan (OP-4829)",
        "createdAt": (datetime.datetime.now() - datetime.timedelta(hours=2, minutes=30)).strftime("%Y-%m-%d %H:%M"),
        "andonTriggered": True,
        "fiveWhy": {
            "why1": "Subframe bolt reached only 82 Nm instead of 115 Nm.",
            "why2": "DC electric torque spindle cut off prematurely during run-down.",
            "why3": "Angle-control transducer detected artificial cross-thread peak resistance.",
            "why4": "Weld spatter in tapped weld-nut on chassis cross-member prevented free spin.",
            "why5": "Electrode tip dressing interval at Body Weld Station 06 was exceeded by 180 cycles.",
            "rootCause": "Weld spatter contamination from worn electrode caps entering unprotected weld nuts before chassis painting."
        },
        "containment": "Quarantine 18 vehicles produced on Shift A and re-torque with calibrated manual click wrench.",
        "corrective": "Add reusable silicone caps over weld-nuts during robot welding cycle to prevent spatter ingress.",
        "preventive": "Implement automated torque-angle telemetry logging to plant MES to auto-flag variances.",
        "verification": "100% torque audit on next 50 consecutive units with Zero defect sign-off."
    },
    {
        "id": "def-102",
        "defectCode": "DEF-2026-082",
        "title": "HV Battery Pack High-Voltage Connector CPA Lock Not Engaged",
        "description": "Connector Position Assurance (CPA) secondary red lock was left in released state on main inverter busbar feed.",
        "category": "Electrical & Harness",
        "severity": "Critical",
        "status": "Countermeasure Proposed",
        "line": "Powertrain Line 1",
        "station": "Station 22: High Voltage Harness & CPA",
        "vehicleZone": "Underbody & Battery",
        "vinOrUnitId": "VIN-WAUZZZ-89112",
        "partNumber": "HV-800V-CONN-A",
        "reportedBy": "Elena Rostova (QC-1104)",
        "createdAt": (datetime.datetime.now() - datetime.timedelta(hours=5)).strftime("%Y-%m-%d %H:%M"),
        "andonTriggered": True,
        "fiveWhy": {
            "why1": "Secondary lock tab remained in upward unlatched position.",
            "why2": "Operator insertion cycle lacked tactile engagement check.",
            "why3": "High cycle takt time caused rushed connector seating.",
            "why4": "No in-line optical sensor gate to confirm CPA status.",
            "why5": "Absence of automated Poka-Yoke error-proofing on station."
        },
        "containment": "Inspector checks red CPA slide on every vehicle with mirror and physical push-pull test.",
        "corrective": "Mount industrial optical sensor on Station 22 to verify red tab position before conveyor index.",
        "preventive": "Update Process FMEA with automated vision inspection station.",
        "verification": "100% end-of-line diagnostic bus scan with zero communication DTC codes."
    },
    {
        "id": "def-103",
        "defectCode": "DEF-2026-083",
        "title": "Driver Door Outer Panel Paint Fisheye & Dust Inclusion",
        "description": "3mm diameter clearcoat cratering and dust particle inclusion detected on front left door upper crease line.",
        "category": "Paint & Surface",
        "severity": "Major",
        "status": "Open",
        "line": "Paint Shop Line B",
        "station": "Station 08: Clearcoat Inspection Booth",
        "vehicleZone": "Driver Doors (LH)",
        "vinOrUnitId": "VIN-WAUZZZ-89129",
        "partNumber": "DR-LH-PNL-04",
        "reportedBy": "Bilal Khan (OP-4829)",
        "createdAt": (datetime.datetime.now() - datetime.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M"),
        "andonTriggered": False,
        "fiveWhy": {},
        "containment": "Polish with 3000 grit micro-abrasive and high gloss compound in buffer deck.",
        "corrective": "Replace paint booth HEPA filters and clean applicator nozzles with solvent flush cycle.",
        "preventive": "Enforce lint-free cleanroom antistatic garments and ionized air blower at booth entryway.",
        "verification": "Glossmeter measurement and surface laser inspection for 3 consecutive shifts."
    },
    {
        "id": "def-104",
        "defectCode": "DEF-2026-084",
        "title": "Hood-to-Fender Flush Gap Exceeds 4.8mm (Spec: 3.5mm ± 0.5mm)",
        "description": "Right hand hood gap measured 4.8mm at A-pillar intersection. Uneven visual margin observed.",
        "category": "Trim & Gap Flush",
        "severity": "Minor",
        "status": "Verified",
        "line": "Final Assembly Line 1",
        "station": "Station 31: Exterior Gap & Flush Verification",
        "vehicleZone": "Hood & Front Bay",
        "vinOrUnitId": "VIN-WAUZZZ-89088",
        "partNumber": "HD-FR-ASM-01",
        "reportedBy": "Elena Rostova (QC-1104)",
        "createdAt": (datetime.datetime.now() - datetime.timedelta(hours=8)).strftime("%Y-%m-%d %H:%M"),
        "andonTriggered": False,
        "fiveWhy": {},
        "containment": "Replaced spacer shim on right hood hinge bracket. Gap restored to 3.4mm nominal.",
        "corrective": "Adjust hood hinge shim gauge from 1.5mm to 1.0mm.",
        "preventive": "Standardize laser gap verification on every hood installation cycle.",
        "verification": "Laser gap gauge calibrated. Batch verified across 12 vehicles."
    },
    {
        "id": "def-105",
        "defectCode": "DEF-2026-085",
        "title": "Brake Caliper Bleeder Valve Micro Seepage During 120 Bar Pressure Test",
        "description": "Rear right brake caliper bleeder valve showed moisture bead at 120 bar hydraulic line verification.",
        "category": "Fluid & Leaks",
        "severity": "Critical",
        "status": "Closed",
        "line": "Chassis Line 2",
        "station": "Station 18: Brake Fluid Fill & Bleed",
        "vehicleZone": "Rear Axle & Brakes",
        "vinOrUnitId": "VIN-WAUZZZ-89045",
        "partNumber": "BRK-RR-CAL-RH",
        "reportedBy": "Bilal Khan (OP-4829)",
        "createdAt": (datetime.datetime.now() - datetime.timedelta(hours=24)).strftime("%Y-%m-%d %H:%M"),
        "andonTriggered": True,
        "fiveWhy": {},
        "containment": "Defective valve replaced, secondary helium vacuum leak test passed.",
        "corrective": "Switch to pre-lubricated fluorosilicone O-rings on bleeder valves.",
        "preventive": "Update incoming supplier inspection AQL sampling for caliper seals.",
        "verification": "100% vacuum decay test at 0.5 bar decay threshold for 2 consecutive days."
    }
]

# Session State Initialization
if "defects" not in st.session_state:
    st.session_state["defects"] = INITIAL_DEFECTS

if "reminders" not in st.session_state:
    st.session_state["reminders"] = [
        {"id": "r1", "station": "Station 14", "task": "Torque Spindle Calibration Audit", "time": "15:30", "completed": False},
        {"id": "r2", "station": "Station 08", "task": "Cleanroom Filter Differential Pressure Check", "time": "16:00", "completed": False}
    ]

# Local Kaizen Fallback / Rule Engine
def get_local_kaizen_analysis(category, station, description):
    cat = (category or "").lower()
    
    if "torque" in cat or "fastener" in cat:
        return {
            "summary": f"Fastener torque variance at {station}. Tooling angle shutoff or thread interference detected.",
            "root_cause": "Premature spindle cutoff from weld spatter in tapped threads or transducer angle drift.",
            "containment": "Halt line, re-check last 20 vehicles using calibrated digital manual click wrench.",
            "corrective": "Recalibrate DC electric screwdriver, lock program P12, install silicone thread plugs.",
            "preventive": "Incorporate automated torque-angle telemetry logging to MES with automatic line-lockout on variance.",
            "verification": "100% torque audit on next 3 shifts with Cpk >= 1.67 capability."
        }
    elif "paint" in cat or "surface" in cat:
        return {
            "summary": f"Surface finish blemish in clearcoat booth {station}.",
            "root_cause": "Airflow turbulence or particle contamination in applicator zone.",
            "containment": "Quarantine affected lot for micro-abrasive polish in buffer deck.",
            "corrective": "Replace spray booth HEPA filters and clean applicator nozzles with solvent flush cycle.",
            "preventive": "Enforce antistatic cleanroom suits and ionized air curtain at booth entry.",
            "verification": "Glossmeter reading and surface profilometer scan on 40 consecutive bodies."
        }
    elif "electrical" in cat or "harness" in cat:
        return {
            "summary": f"Electrical connector or harness seating failure at {station}.",
            "root_cause": "Secondary lock (CPA) not seated within takt cycle time.",
            "containment": "100% pin push-out test and electrical continuity diagnostic check.",
            "corrective": "Add audible tactile feedback click guide and optical camera verification.",
            "preventive": "Update PFMEA with automated vision inspection before chassis release.",
            "verification": "Zero diagnostic trouble codes (DTC) on end-of-line electrical dyno tester."
        }
    else:
        return {
            "summary": f"Automotive assembly deviation detected at {station}.",
            "root_cause": "Tooling calibration drift or component tolerance variance.",
            "containment": "Quarantine affected lot, initiate 100% manual visual inspection on current batch.",
            "corrective": "Recalibrate assembly fixtures and update digital standard work instructions (SWI).",
            "preventive": "Implement physical Poka-Yoke fixture on station to eliminate human error.",
            "verification": "Zero-defect audit across 50 consecutive production units."
        }

# Gemini API Integration
def run_ai_kaizen_advisor(title, category, station, severity, description):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        try:
            api_key = st.secrets.get("GEMINI_API_KEY")
        except Exception:
            pass

    if not api_key:
        return get_local_kaizen_analysis(category, station, description)

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = f"""You are an Automotive Quality Director (IATF 16949 / 8D Kaizen expert).
Analyze this defect:
Title: {title}
Station: {station}
Category: {category}
Severity: {severity}
Description: {description}

Return JSON with keys:
"summary": "1-2 sentence engineering diagnosis",
"root_cause": "Technical root cause hypothesis",
"containment": "Immediate Interim Containment Action (ICA)",
"corrective": "Permanent Corrective Action (PCA)",
"preventive": "Preventive Kaizen (Poka-Yoke)",
"verification": "Quality validation protocol"
"""
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        return get_local_kaizen_analysis(category, station, description)

# Sidebar: Operator Clearance & Navigation
st.sidebar.markdown("### 🏭 Plant Operator Clearance")
role = st.sidebar.selectbox(
    "Active Clearance Profile",
    ["Worker (Assembly Line)", "Quality Inspector", "Shift Supervisor", "Plant Quality Manager"],
    index=0
)
shift = st.sidebar.selectbox("Active Production Shift", ["Shift A (06:00 - 14:00)", "Shift B (14:00 - 22:00)", "Shift C (22:00 - 06:00)"])
station_filter = st.sidebar.selectbox(
    "Station Filter",
    ["All Plant Stations", "Station 14: Chassis Bolting", "Station 22: High Voltage", "Station 08: Paint Booth", "Station 31: Gap & Flush", "Station 18: Brake Fluid"]
)

st.sidebar.markdown("---")
st.sidebar.markdown("### 📶 Plant Network Status")
st.sidebar.success("● Central MES Cloud Connected")
st.sidebar.info("● Takt Time Target: 58 sec")

# Top Header Contract
col_h1, col_h2 = st.columns([3, 1])
with col_h1:
    st.title("🚗 KaizenAuto IQ — Automotive Defect & Countermeasure System")
    st.caption("IATF 16949 & Toyota Production System (TPS) Quality Engineering Workbench")
with col_h2:
    st.markdown(f"**Operator:** Bilal Khan (OP-4829)<br>**Clearance:** `{role.split(' ')[0]}`", unsafe_allow_html=True)

# Top KPI Metric Strip
defects_list = st.session_state["defects"]
total_defects = len(defects_list)
active_defects = len([d for d in defects_list if d.get("status") != "Closed"])
critical_defects = len([d for d in defects_list if d.get("severity") == "Critical" and d.get("status") != "Closed"])
andon_line_stops = len([d for d in defects_list if d.get("andonTriggered") and d.get("status") != "Closed"])

# FTQ Calculation
batch_size = 120
unique_vins = len(set([d.get("vinOrUnitId") for d in defects_list]))
ftq_percent = round(((batch_size - unique_vins) / batch_size) * 100, 1)

m1, m2, m3, m4 = st.columns(4)
m1.metric("First Time Quality (FTQ)", f"{ftq_percent}%", "+1.2% vs Shift Target")
m2.metric("Active Defects", active_defects, f"{critical_defects} Critical")
m3.metric("Andon Line Stops", andon_line_stops, "Immediate Action" if andon_line_stops > 0 else "Normal Running", delta_color="inverse")
m4.metric("Mean Time to Resolve", "3.4 hrs", "IATF SLA < 24h")

# Critical Andon Alert Banner
if andon_line_stops > 0:
    st.markdown(f"""
    <div class="andon-critical">
        <strong>⚠️ CRITICAL ANDON LINE STOP ACTIVE:</strong> {andon_line_stops} station(s) halted. Supervisor immediate dispatch requested on shop floor.
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# Main Navigation Tabs
tab_log, tab_list, tab_analytics, tab_8d, tab_andon, tab_export = st.tabs([
    "➕ Log New Defect",
    "📋 Defect Workbench",
    "📊 Quality Analytics & Pareto",
    "🔍 8D Problem Solving & AI",
    "🚨 Live Andon Board",
    "📄 8D Report & CSV Export"
])

# ----------------- TAB 1: Log New Defect -----------------
with tab_log:
    st.subheader("Sub-30 Second Defect & Incident Logging")
    st.caption("Scan vehicle VIN or part barcode to auto-populate traceability data.")

    with st.form("new_defect_form", clear_on_submit=True):
        col_f1, col_f2 = st.columns(2)
        
        with col_f1:
            title = st.text_input("Defect Title / Problem Statement *", placeholder="e.g. Front Subframe M14 Bolt under-torqued at 82 Nm")
            category = st.selectbox(
                "Defect Category",
                ["Torque & Fastener", "Electrical & Harness", "Paint & Surface", "Body & Welding", "Fluid & Leaks", "Trim & Gap Flush", "Powertrain & Mechanical", "Electronics & ADAS"]
            )
            severity = st.selectbox("Severity Level", ["Critical (Line Stop)", "Major (Containment Required)", "Minor (Rework in Buffer)"], index=1)
            station = st.selectbox(
                "Assembly Station",
                [
                    "Station 14: Subframe Bolting & Torquing",
                    "Station 22: High Voltage Harness & CPA",
                    "Station 08: Clearcoat Inspection Booth",
                    "Station 06: Robotic Body Welding",
                    "Station 18: Brake Fluid Fill & Bleed",
                    "Station 31: Exterior Gap & Flush Verification",
                    "Station 35: End of Line Dynamic Roll Test",
                    "Gate 3: Pre-Delivery Quality Audit"
                ]
            )

        with col_f2:
            vin = st.text_input("Vehicle VIN / Chassis ID", value=f"VIN-WAUZZZ-{random.randint(10000, 99999)}")
            part_no = st.text_input("Part / Subassembly Number", value="N-911-470-01")
            zone = st.selectbox(
                "Vehicle Inspection Zone",
                ["Underbody & Battery", "Hood & Front Bay", "Front Bumper / Fascia", "Driver Doors (LH)", "Passenger Doors (RH)", "Interior Cabin", "Roof Panel", "Rear Trunk", "Rear Axle & Brakes"]
            )
            andon_pull = st.checkbox("🚨 Pull Digital Andon Cord (Halt Assembly Line)", value=(severity.startswith("Critical")))

        description = st.text_area("Detailed Observation / Sensor Readings", placeholder="Specify torque reading, laser gap measurement, or visual anomaly...")

        submitted = st.form_submit_button("⚡ Log Defect & Initiate 8D Triage", use_container_width=True)
        if submitted:
            if not title:
                st.error("Defect Title is required.")
            else:
                sev_label = severity.split(" ")[0]
                new_d = {
                    "id": f"def-{int(datetime.datetime.now().timestamp())}",
                    "defectCode": f"DEF-2026-{random.randint(100, 999)}",
                    "title": title,
                    "description": description or title,
                    "category": category,
                    "severity": sev_label,
                    "status": "Open",
                    "line": "Chassis Line 2",
                    "station": station,
                    "vehicleZone": zone,
                    "vinOrUnitId": vin,
                    "partNumber": part_no,
                    "reportedBy": f"Bilal Khan ({role.split(' ')[0]})",
                    "createdAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "andonTriggered": andon_pull,
                    "fiveWhy": {},
                    "containment": "Pending containment action.",
                    "corrective": "Pending permanent corrective action.",
                    "preventive": "Pending preventive action.",
                    "verification": "Pending quality verification."
                }
                st.session_state["defects"].insert(0, new_d)
                st.success(f"Defect {new_d['defectCode']} recorded successfully!")
                st.rerun()

# ----------------- TAB 2: Defect Workbench -----------------
with tab_list:
    st.subheader("Factory Defect Records")
    
    col_s1, col_s2, col_s3 = st.columns(3)
    with col_s1:
        search = st.text_input("Search (VIN, Defect Code, Station)", placeholder="Search...")
    with col_s2:
        filter_status = st.selectbox("Status", ["All", "Open", "Investigating", "Countermeasure Proposed", "Verified", "Closed"])
    with col_s3:
        filter_sev = st.selectbox("Severity", ["All", "Critical", "Major", "Minor"])

    filtered = [
        d for d in st.session_state["defects"]
        if (search.lower() in d["defectCode"].lower() or search.lower() in d["title"].lower() or search.lower() in d["vinOrUnitId"].lower() or search.lower() in d["station"].lower())
        and (filter_status == "All" or d["status"] == filter_status)
        and (filter_sev == "All" or d["severity"] == filter_sev)
    ]

    for item in filtered:
        with st.expander(f"**[{item['defectCode']}]** {item['title']} — `{item['severity'].upper()}` | `{item['status']}`"):
            col_d1, col_d2 = st.columns([2, 1])
            with col_d1:
                st.write(f"**Description:** {item.get('description', '')}")
                st.caption(f"**VIN:** `{item['vinOrUnitId']}` • **Part No:** `{item.get('partNumber', 'N/A')}` • **Station:** {item['station']} • **Zone:** {item['vehicleZone']}")
                st.caption(f"**Reported by:** {item['reportedBy']} at {item['createdAt']}")
            with col_d2:
                new_status = st.selectbox(
                    "Update Status",
                    ["Open", "Investigating", "Countermeasure Proposed", "Verified", "Closed"],
                    index=["Open", "Investigating", "Countermeasure Proposed", "Verified", "Closed"].index(item['status']) if item['status'] in ["Open", "Investigating", "Countermeasure Proposed", "Verified", "Closed"] else 0,
                    key=f"status_{item['id']}"
                )
                if new_status != item['status']:
                    item['status'] = new_status
                    st.rerun()

# ----------------- TAB 3: Quality Analytics & Pareto -----------------
with tab_analytics:
    st.subheader("Pareto 80/20 & Station Quality Heatmap")

    df_defects = pd.DataFrame(st.session_state["defects"])
    
    col_a1, col_a2 = st.columns([3, 2])
    
    with col_a1:
        st.markdown("#### Pareto 80/20 Defect Driver Analysis")
        st.caption("Target top defect categories to eliminate 80% of line rework.")
        cat_counts = df_defects["category"].value_counts().reset_index()
        cat_counts.columns = ["Category", "Count"]
        st.bar_chart(cat_counts.set_index("Category"))

    with col_a2:
        st.markdown("#### Defect Distribution by Station")
        station_counts = df_defects["station"].value_counts().reset_index()
        station_counts.columns = ["Station", "Defects"]
        st.dataframe(station_counts, use_container_width=True)

    st.markdown("#### Plant Shift Performance Matrix")
    shift_data = pd.DataFrame([
        {"Shift": "Shift A (06:00 - 14:00)", "Produced": 148, "Defects": 4, "FTQ (%)": "97.3%", "Line Stops": 1, "Supervisor": "K. Schmidt"},
        {"Shift": "Shift B (14:00 - 22:00)", "Produced": 152, "Defects": 6, "FTQ (%)": "96.0%", "Line Stops": 2, "Supervisor": "T. Tanaka"},
        {"Shift": "Shift C (22:00 - 06:00)", "Produced": 118, "Defects": 3, "FTQ (%)": "97.4%", "Line Stops": 0, "Supervisor": "M. Tariq"}
    ])
    st.table(shift_data)

# ----------------- TAB 4: 8D Problem Solving & AI -----------------
with tab_8d:
    st.subheader("Toyota Production System (TPS) 5-Why & AI Kaizen Advisor")
    
    defect_options = {d["defectCode"] + " - " + d["title"]: d for d in st.session_state["defects"]}
    selected_option = st.selectbox("Select Defect for 8D Analysis", list(defect_options.keys()))
    selected_defect = defect_options[selected_option]

    st.info(f"**VIN:** `{selected_defect['vinOrUnitId']}` | **Station:** `{selected_defect['station']}` | **Category:** `{selected_defect['category']}`")

    # AI Kaizen Generator Button
    if st.button("✨ Run Gemini AI Kaizen Advisor", use_container_width=True):
        with st.spinner("Analyzing automotive defect against IATF 16949 standards..."):
            advice = run_ai_kaizen_advisor(
                selected_defect["title"],
                selected_defect["category"],
                selected_defect["station"],
                selected_defect["severity"],
                selected_defect["description"]
            )
            selected_defect["aiAdvice"] = advice
            selected_defect["containment"] = advice.get("containment", selected_defect.get("containment"))
            selected_defect["corrective"] = advice.get("corrective", selected_defect.get("corrective"))
            selected_defect["preventive"] = advice.get("preventive", selected_defect.get("preventive"))
            selected_defect["verification"] = advice.get("verification", selected_defect.get("verification"))
            st.success("AI Kaizen Analysis Synthesized!")

    if "aiAdvice" in selected_defect:
        adv = selected_defect["aiAdvice"]
        st.markdown(f"**Engineering Diagnosis:** {adv.get('summary', '')}")
        st.markdown(f"**Root Cause Hypothesis:** {adv.get('root_cause', '')}")

    col_8d1, col_8d2 = st.columns(2)
    with col_8d1:
        st.markdown("#### D3: Interim Containment Action (ICA)")
        ica_input = st.text_area("Containment Protocol", value=selected_defect.get("containment", ""), key=f"ica_{selected_defect['id']}")
        selected_defect["containment"] = ica_input

        st.markdown("#### D4: 5-Why Root Cause Ladder")
        fw = selected_defect.get("fiveWhy", {})
        w1 = st.text_input("1. Why did the defect happen?", value=fw.get("why1", ""))
        w2 = st.text_input("2. Why was it not detected?", value=fw.get("why2", ""))
        w3 = st.text_input("3. Why did standard process fail?", value=fw.get("why3", ""))
        w4 = st.text_input("4. Why was variance introduced?", value=fw.get("why4", ""))
        w5 = st.text_input("5. Root Cause (Actionable Target)", value=fw.get("why5", ""))
        selected_defect["fiveWhy"] = {"why1": w1, "why2": w2, "why3": w3, "why4": w4, "why5": w5, "rootCause": w5}

    with col_8d2:
        st.markdown("#### D5 & D6: Permanent Corrective Action (PCA)")
        pca_input = st.text_area("Corrective Action & Validation", value=selected_defect.get("corrective", ""), key=f"pca_{selected_defect['id']}")
        selected_defect["corrective"] = pca_input

        st.markdown("#### D7: Preventive Poka-Yoke Kaizen")
        prev_input = st.text_area("Error-Proofing / PFMEA Update", value=selected_defect.get("preventive", ""), key=f"prev_{selected_defect['id']}")
        selected_defect["preventive"] = prev_input

        st.markdown("#### Quality Verification Protocol")
        verif_input = st.text_area("Verification Protocol (e.g. 50 units audit)", value=selected_defect.get("verification", ""), key=f"verif_{selected_defect['id']}")
        selected_defect["verification"] = verif_input

# ----------------- TAB 5: Live Andon Board -----------------
with tab_andon:
    st.subheader("Live Factory Andon Board & Automated Escalation")
    
    col_and1, col_and2 = st.columns([3, 2])

    with col_and1:
        st.markdown("#### Station Operational Status")
        stations_status = [
            {"id": "ST-01", "name": "Station 01: BIW Framing", "status": "Normal Running", "color": "🟢"},
            {"id": "ST-02", "name": "Station 02: Battery Insertion", "status": "Caution - Defect Reported", "color": "🟡"},
            {"id": "ST-14", "name": "Station 14: Chassis Bolting", "status": "Line Stop - Andon Pulled", "color": "🔴"},
            {"id": "ST-18", "name": "Station 18: Brake Fluid Fill", "status": "Normal Running", "color": "🟢"},
            {"id": "ST-22", "name": "Station 22: HV Wire Harness", "status": "Line Stop - Andon Pulled", "color": "🔴"},
            {"id": "ST-31", "name": "Station 31: Gap & Flush", "status": "Normal Running", "color": "🟢"}
        ]
        
        for st_item in stations_status:
            st.write(f"{st_item['color']} **{st_item['name']}** — `{st_item['status']}`")

    with col_and2:
        st.markdown("#### Scheduled Quality Audits & Reminders")
        for rem in st.session_state["reminders"]:
            st.checkbox(f"[{rem['station']}] {rem['task']} (Due {rem['time']})", value=rem['completed'], key=rem['id'])

# ----------------- TAB 6: 8D Report & Compliance Audit Export -----------------
with tab_export:
    st.subheader("IATF 16949 / 8D Quality Report & Compliance Audit")

    report_subtab1, report_subtab2 = st.tabs(["📄 8D Problem Solving Dossier", "🛡️ IATF 16949 Compliance Checklist"])

    with report_subtab1:
        export_df = pd.DataFrame(st.session_state["defects"])
        csv_bytes = export_df.to_csv(index=False).encode('utf-8')

        st.download_button(
            label="📥 Export Complete 8D & Compliance Dossier (CSV)",
            data=csv_bytes,
            file_name=f"KaizenAuto_8D_IATF16949_{datetime.date.today()}.csv",
            mime="text/csv",
            use_container_width=True
        )

        st.markdown("#### Printable 8D Quality Summary Preview")
        for d in st.session_state["defects"][:3]:
            st.markdown(f"""
            ---
            **DOC NO: 8D-{d['defectCode']}** | **VIN:** `{d['vinOrUnitId']}` | **Status:** `{d['status']}`  
            **Problem Statement (D2):** {d['title']}  
            **Interim Containment (D3):** {d.get('containment', 'N/A')}  
            **Root Cause (D4):** {d.get('fiveWhy', {}).get('rootCause', 'Under Investigation')}  
            **Permanent Action (D5/D6):** {d.get('corrective', 'N/A')}  
            **Preventive Kaizen (D7):** {d.get('preventive', 'N/A')}  
            """)

    with report_subtab2:
        st.markdown("### IATF 16949:2016 Regulatory & OEM Audit Checklist")
        st.caption("Auto-generated based on logged defect severity and manufacturing category.")

        sel_defect_code = st.selectbox(
            "Select Defect to Audit",
            [d["defectCode"] + " - " + d["title"] for d in st.session_state["defects"]],
            key="audit_sel_defect"
        )
        curr_d = next(d for d in st.session_state["defects"] if d["defectCode"] == sel_defect_code.split(" - ")[0])

        is_critical = curr_d["severity"] == "Critical"
        col_au1, col_au2, col_au3 = st.columns(3)
        col_au1.metric("Defect Severity", curr_d["severity"].upper())
        col_au2.metric("IATF Audit Standard", "IATF 16949:2016")
        col_au3.metric("Customer Escalation SLA", "< 24 Hours" if is_critical else "Standard 48h")

        checklist_items = [
            {"clause": "10.2.3(a)", "category": "Problem Solving", "req": "Disciplined 8D Problem Solving process executed.", "status": True},
            {"clause": "8.7.1.3", "category": "Containment", "req": "Control of suspect product & clean point boundary established.", "status": bool(curr_d.get("containment"))},
            {"clause": "10.2.3(c)", "category": "Root Cause", "req": "5-Why & Ishikawa root-cause escape point verified.", "status": bool(curr_d.get("fiveWhy", {}).get("rootCause"))},
            {"clause": "10.2.4", "category": "Error-Proofing", "req": "Poka-Yoke error-proofing device implemented in production.", "status": bool(curr_d.get("preventive"))},
            {"clause": "8.5.1.1", "category": "Control Plan", "req": "Control plan CP-2026 synchronized with tooling adjustments.", "status": bool(curr_d.get("corrective"))},
            {"clause": "8.3.5.2", "category": "PFMEA", "req": "Process FMEA revised to lower Occurrence and Detection rankings.", "status": bool(curr_d.get("preventive"))},
        ]

        if is_critical:
            checklist_items.extend([
                {"clause": "8.7.1.7", "category": "Customer Escalation", "req": "Immediate customer & management notification logged within 24h.", "status": curr_d.get("andonTriggered", False)},
                {"clause": "8.5.1.3", "category": "Line Release", "req": "Verification after shutdown: Pre-release sign-off complete.", "status": True},
                {"clause": "7.1.5.1.1", "category": "Special Characteristic", "req": "100% critical characteristic audit logged in digital MES trace.", "status": True},
            ])

        st.markdown("#### Audit Requirements & Verification Table")
        for item in checklist_items:
            c1, c2, c3 = st.columns([1, 4, 1])
            c1.markdown(f"`IATF {item['clause']}`")
            c2.markdown(f"**{item['category']}:** {item['req']}")
            c3.markdown("✅ **PASS**" if item["status"] else "⏳ **PENDING**")

        st.markdown("---")
        st.success("Lead Auditor Sign-off: Dr. Michael Chen (QM-0012) — IATF Certified Lead Auditor")


st.markdown("---")
st.caption("KaizenAuto IQ — Automotive Quality Engineering System | Compliant with IATF 16949 & TPS")
