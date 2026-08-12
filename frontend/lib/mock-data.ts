export type RequestStatus =

  | "Intake"

  | "Agent Run"

  | "Approval Gate"

  | "Delivered";



export type MockRequest = {

  id: string;

  title: string;

  client: string;

  status: RequestStatus;

  updatedAt: string;

  createdAt: string;

  description: string;

  submittedBy: string;

  agentRun?: string;

  currentGate?: 1 | 2;

};



export type RequestEvent = {

  id: string;

  requestId: string;

  message: string;

  timestamp: string;

  kind: "agent" | "gate" | "system";

};



export type AgentStepStatus = "completed" | "corrected" | "warning";



export type AgentStep = {

  id: string;

  label: string;

  detail: string;

  status: AgentStepStatus;

};



export type EvidenceCategory = "dataSource" | "kpi" | "openQuestion";



export type EvidenceItem = {

  id: string;

  category: EvidenceCategory;

  title: string;

  detail: string;

};



export type CorrectionDiff = {

  id: string;

  field: string;

  before: string;

  after: string;

  reason: string;

  businessImpact?: string;

};



export type DecisionVerdict =

  | "approve"

  | "approve_with_warning"

  | "reject"

  | "needs_changes";



export type DecisionSummary = {

  verdict: DecisionVerdict;

  verdictLabel: string;

  correctionCount: number;

  warningCount: number;

  blockerCount: number;

  summaryText: string;

};



export type ValidationChecklistStatus = "pass" | "pass_with_warning" | "fail";



export type ValidationChecklistItem = {

  id: string;

  label: string;

  status: ValidationChecklistStatus;

  detail?: string;

};



export type ActivityTimelineItem = {

  id: string;

  time: string;

  actor: string;

  event: string;

  detail?: string;

};



export type PipelineStepStatus = "done" | "current" | "pending";



export type PipelineStep = {

  label: string;

  status: PipelineStepStatus;

};



export type ApprovalWarning = {

  id: string;

  severity: "info" | "warning";

  message: string;

};



export type MockPreviewBlock = {

  type: "kpi" | "bar" | "table";

  label: string;

  value?: string;

  bars?: Array<{ label: string; width: number }>;

  rows?: string[];

};



export type MockPreview = {

  title: string;

  subtitle: string;

  blocks: MockPreviewBlock[];

};



export type ApprovalGateDetail = {

  requestId: string;

  gateNumber: 1 | 2;

  gateLabel: string;

  agentSummary: string;

  /** @deprecated Use activityTimeline + corrections instead */

  agentSteps?: AgentStep[];

  evidence: EvidenceItem[];

  warnings: ApprovalWarning[];

  corrections: CorrectionDiff[];

  preview: MockPreview;

  previousGateNote?: string;

  decisionSummary: DecisionSummary;

  validationChecklist: ValidationChecklistItem[];

  activityTimeline: ActivityTimelineItem[];

  pipelineSteps: PipelineStep[];

};




function mockEvent(
  id: string,
  requestId: string,
  message: string,
  timestamp: string,
  kind: RequestEvent["kind"]
): RequestEvent {
  return { id, requestId, message, timestamp, kind };
}


function evidence(
  id: string,
  category: EvidenceCategory,
  title: string,
  detail: string
): EvidenceItem {
  return { id, category, title, detail };
}

function checklist(
  id: string,
  label: string,
  status: ValidationChecklistStatus,
  detail?: string
): ValidationChecklistItem {
  return detail ? { id, label, status, detail } : { id, label, status };
}

function timeline(
  id: string,
  time: string,
  actor: string,
  event: string,
  detail?: string
): ActivityTimelineItem {
  return detail ? { id, time, actor, event, detail } : { id, time, actor, event };
}

function approveWithWarning(
  summaryText: string,
  counts: { correctionCount?: number; warningCount?: number } = {}
): DecisionSummary {
  return {
    verdict: "approve_with_warning",
    verdictLabel: "Apstiprināt ar brīdinājumu",
    correctionCount: counts.correctionCount ?? 0,
    warningCount: counts.warningCount ?? 0,
    blockerCount: 0,
    summaryText,
  };
}

function salesInvoiceEvidence(id: string, detail: string): EvidenceItem {
  return evidence(id, "dataSource", "Sales Invoice Header / Line", detail);
}

function gate2CloseTimeline(
  tl3Time: string,
  buildDetail: string,
  tl4Time: string
): ActivityTimelineItem[] {
  return [
    timeline("tl3", tl3Time, "Build agent", "Mock Solution ģenerēts", buildDetail),
    timeline("tl4", tl4Time, "Orchestrator", "Gate 2 atvērts", "Gaida Reviewer apstiprinājumu pirms piegādes"),
  ];
}

const REQ1042_GATE1_EVIDENCE: EvidenceItem[] = [
  salesInvoiceEvidence("e1", "Galvenais faktu avots — Amount, Quantity, Posting Date"),
  evidence("e2", "dataSource", "Customer + Dimension Set Entry", "Reģiona dimensija caur Global Dimension 1 Code"),
  evidence("e3", "kpi", "Neto pārdošanas apjoms (EUR)", "SUM(Amount) WHERE Type = Item, filtrs pēc Posting Date"),
  evidence("e4", "kpi", "Pārdošanas apjoms pa reģioniem", "Grupēšana pēc reģiona dimensijas, salīdzinājums ar plānu"),
  evidence("e5", "openQuestion", "Intercompany pārdošana", "Vai izslēgt IC darījumus no KPI? Nav atbildes Gate 1 brīdī."),
  evidence("e6", "openQuestion", "Valūtas konvertācija", "Posting date vai invoice date kurss? Noklusējums: posting."),
];

const REQ1042_GATE2_EVIDENCE: EvidenceItem[] = [
  salesInvoiceEvidence("e1", "Faktu tabula ar Amount, Quantity, Posting Date — relācija uz Customer"),
  evidence("e2", "dataSource", "Dimension Set Entry", "Global Dimension 1 Code → reģions (Rīga, Kurzeme, Latgale, Vidzeme)"),
  evidence("e3", "dataSource", "Salesperson/Purchaser", "Pārdevēja dimensija un reģiona fallback 3 legacy klientiem"),
  evidence("e4", "kpi", "Neto pārdošana (EUR)", "€ 2.41M YTD — salīdzinājums ar plānu +8.2%"),
  evidence("e5", "kpi", "YoY izaugsme", "+12.4% pret iepriekšējo gadu (tā pati perioda filtrs)"),
  evidence("e6", "kpi", "Top reģions", "Rīga — 41% no kopējā apjoma"),
  evidence("e7", "openQuestion", "Intercompany filtrs", "Klienta atbilde nav saņemta — Solution izmanto noklusējumu (iekļaut IC)"),
];

const PIPELINE_GATE1_CURRENT: PipelineStep[] = [
  { label: "Gate 1", status: "current" },
  { label: "Build", status: "pending" },
  { label: "Validate", status: "pending" },
  { label: "Gate 2", status: "pending" },
];

const PIPELINE_GATE1_DONE: PipelineStep[] = [
  { label: "Gate 1", status: "done" },
  { label: "Build", status: "pending" },
  { label: "Validate", status: "pending" },
  { label: "Gate 2", status: "pending" },
];

const PIPELINE_GATE2_CURRENT: PipelineStep[] = [
  { label: "Gate 1", status: "done" },
  { label: "Build", status: "done" },
  { label: "Validate", status: "done" },
  { label: "Gate 2", status: "current" },
];


export const dashboardStats = {

  activeRequests: 12,

  pendingApprovals: 3,

  agentRunsToday: 8,

  avgGateMinutes: 4,

} as const;



export const allRequests: MockRequest[] = [

  {

    id: "REQ-1042",

    title: "BC pārdošanas KPI pa reģioniem",

    client: "UPB",

    status: "Approval Gate",

    updatedAt: "2m ago",

    createdAt: "2026-08-11",

    description:

      "Power BI pārskats Business Central pārdošanas datiem pa reģioniem un pārdevējiem. Nepieciešams salīdzināt faktisko apjomu ar plānu un rādīt YoY dinamiku.",

    submittedBy: "M. Ozoliņš",

    agentRun: "RUN-8821",

    currentGate: 2,

  },

  {

    id: "REQ-1041",

    title: "Noliktavas apgrieziens (Business Central)",

    client: "Schwenk",

    status: "Agent Run",

    updatedAt: "18m ago",

    createdAt: "2026-08-11",

    description:

      "Noliktavas apgrieziena un atlikumu kustības vizualizācija no BC Item Ledger Entry.",

    submittedBy: "A. Kalniņa",

    agentRun: "RUN-8819",

  },

  {

    id: "REQ-1040",

    title: "Debitoru/noslēgumu kopsavilkums",

    client: "Latvijas Gāze",

    status: "Agent Run",

    updatedAt: "42m ago",

    createdAt: "2026-08-10",

    description:

      "Debitoru atlikumu un maksājumu termiņu kopsavilkums ar aging slāņiem.",

    submittedBy: "J. Liepa",

    agentRun: "RUN-8817",

  },

  {

    id: "REQ-1039",

    title: "CRM pipeline veselība un konversija",

    client: "Stenders",

    status: "Delivered",

    updatedAt: "1h ago",

    createdAt: "2026-08-09",

    description: "CRM piltuves veselības metrikas un konversijas analīze.",

    submittedBy: "E. Bērziņa",

    agentRun: "RUN-8812",

  },

  {

    id: "REQ-1038",

    title: "PVN atskaites dimensijas (EDS konteksts)",

    client: "Ražošanas klients",

    status: "Intake",

    updatedAt: "3h ago",

    createdAt: "2026-08-12",

    description:

      "PVN atskaišu dimensiju kartēšana EDS kontekstā — gaida intake analīzi.",

    submittedBy: "R. Vītols",

  },

  {

    id: "REQ-1037",

    title: "Projektu rentabilitāte pa nodaļām",

    client: "Baltic Logistic",

    status: "Delivered",

    updatedAt: "4h ago",

    createdAt: "2026-08-08",

    description: "Projektu P&L un rentabilitātes salīdzinājums pa nodaļām.",

    submittedBy: "I. Krūmiņa",

    agentRun: "RUN-8808",

  },

  {

    id: "REQ-1036",

    title: "Piegādātāju sniegums — Power BI modelis",

    client: "B2B loģistika",

    status: "Approval Gate",

    updatedAt: "5h ago",

    createdAt: "2026-08-10",

    description:

      "Piegādātāju piegādes precizitātes un kavējumu KPI no BC pirkumu datiem.",

    submittedBy: "G. Ozols",

    agentRun: "RUN-8804",

    currentGate: 1,

  },

  {

    id: "REQ-1035",

    title: "Klientu segmentācija un LTV",

    client: "Stenders",

    status: "Delivered",

    updatedAt: "6h ago",

    createdAt: "2026-08-07",

    description: "Klientu segmentācija un dzīves laika vērtības aprēķins.",

    submittedBy: "E. Bērziņa",

    agentRun: "RUN-8801",

  },

  {

    id: "REQ-1034",

    title: "Ražošanas OEE un dīkstāves laiks",

    client: "UPB",

    status: "Intake",

    updatedAt: "8h ago",

    createdAt: "2026-08-12",

    description: "OEE un dīkstāves laika metrikas ražošanas līnijām.",

    submittedBy: "M. Ozoliņš",

  },

  {

    id: "REQ-1033",

    title: "Finanšu plāns vs. fakts (P&L)",

    client: "Schwenk",

    status: "Approval Gate",

    updatedAt: "10h ago",

    createdAt: "2026-08-09",

    description:

      "P&L plāna un faktisko rādītāju salīdzinājums ar variances pa kontiem.",

    submittedBy: "A. Kalniņa",

    agentRun: "RUN-8796",

    currentGate: 2,

  },

  {

    id: "REQ-1032",

    title: "E-komercijas pārdošanas piltuve",

    client: "Stenders",

    status: "Agent Run",

    updatedAt: "12h ago",

    createdAt: "2026-08-09",

    description: "E-komercijas piltuves konversijas un cart abandonment KPI.",

    submittedBy: "E. Bērziņa",

    agentRun: "RUN-8792",

  },

  {

    id: "REQ-1031",

    title: "Noliktavas atlikumu novecošana",

    client: "B2B loģistika",

    status: "Delivered",

    updatedAt: "1d ago",

    createdAt: "2026-08-06",

    description: "Atlikumu novecošanas analīze pa kategorijām un noliktavām.",

    submittedBy: "G. Ozols",

    agentRun: "RUN-8788",

  },

];



/** Dashboard preview — most recently updated subset */

export const recentRequests = allRequests.slice(0, 5);



export const requestEvents: RequestEvent[] = [
  // REQ-1042
  mockEvent("EVT-4410", "REQ-1042", "Validation sub-agent passed Solution checks", "2m ago", "agent"),
  mockEvent("EVT-4409", "REQ-1042", "Approval Gate 2 opened — awaiting Reviewer (pre-delivery)", "4m ago", "gate"),
  mockEvent("EVT-4408", "REQ-1042", "Code-review sub-agent completed PBIP structure review", "8m ago", "agent"),
  mockEvent("EVT-4407a", "REQ-1042", "Build sub-agent generated mock Solution layout (3 pages)", "15m ago", "agent"),
  mockEvent("EVT-4407b", "REQ-1042", "Approval Gate 1 approved by Reviewer — build phase started", "22m ago", "gate"),
  mockEvent("EVT-4407c", "REQ-1042", "Approval Gate 1 opened — requirements evidence pack ready", "28m ago", "gate"),
  mockEvent("EVT-4407d", "REQ-1042", "Requirements sub-agent mapped BC entities: Sales Invoice Header, Customer, Dimension Set Entry", "32m ago", "agent"),
  mockEvent("EVT-4407e", "REQ-1042", "Agent Run RUN-8821 started (Mock Pipeline)", "38m ago", "system"),
  mockEvent("EVT-4407f", "REQ-1042", "Request created — Intake phase started", "45m ago", "system"),

  // REQ-1041
  mockEvent("EVT-4406", "REQ-1041", "Requirements sub-agent completed intake analysis", "12m ago", "agent"),
  mockEvent("EVT-4405", "REQ-1041", "Agent Run RUN-8819 started (Mock Pipeline)", "18m ago", "system"),
  mockEvent("EVT-4405a", "REQ-1041", "Request created — Intake phase started", "25m ago", "system"),

  // REQ-1040
  mockEvent("EVT-4404", "REQ-1040", "Requirements sub-agent mapped BC warehouse entities", "35m ago", "agent"),
  mockEvent("EVT-4403", "REQ-1040", "Agent Run RUN-8817 started (Mock Pipeline)", "42m ago", "system"),

  // REQ-1039
  mockEvent("EVT-4402", "REQ-1039", "Solution approved and marked Delivered", "1h ago", "gate"),
  mockEvent("EVT-4401", "REQ-1039", "Validation sub-agent passed Solution checks", "1h ago", "agent"),
  mockEvent("EVT-4400", "REQ-1039", "Approval Gate 2 approved by Reviewer", "1h ago", "gate"),

  // REQ-1038
  mockEvent("EVT-4399", "REQ-1038", "Request created — Intake phase started", "3h ago", "system"),

  // REQ-1037
  mockEvent("EVT-4398", "REQ-1037", "Solution approved and marked Delivered", "4h ago", "gate"),

  // REQ-1036
  mockEvent("EVT-4397", "REQ-1036", "Approval Gate 1 opened — requirements evidence pack ready", "5h ago", "gate"),
  mockEvent("EVT-4396", "REQ-1036", "Requirements sub-agent identified Purchase Header/Line and Vendor tables", "5h ago", "agent"),
  mockEvent("EVT-4396a", "REQ-1036", "Agent Run RUN-8804 started (Mock Pipeline)", "5h ago", "system"),

  // REQ-1035
  mockEvent("EVT-4395", "REQ-1035", "Solution approved and marked Delivered", "6h ago", "gate"),

  // REQ-1034
  mockEvent("EVT-4394", "REQ-1034", "Request created — Intake phase started", "8h ago", "system"),

  // REQ-1033
  mockEvent("EVT-4393", "REQ-1033", "Approval Gate 2 opened — awaiting Reviewer (pre-delivery)", "10h ago", "gate"),
  mockEvent("EVT-4392", "REQ-1033", "Code-review sub-agent completed PBIP structure review", "10h ago", "agent"),
  mockEvent("EVT-4392a", "REQ-1033", "Validation sub-agent passed Solution checks", "10h ago", "agent"),
  mockEvent("EVT-4392b", "REQ-1033", "Approval Gate 1 approved by Reviewer — build phase started", "11h ago", "gate"),

  // REQ-1032
  mockEvent("EVT-4391", "REQ-1032", "Agent Run RUN-8792 started (Mock Pipeline)", "12h ago", "system"),

  // REQ-1031
  mockEvent("EVT-4390", "REQ-1031", "Solution approved and marked Delivered", "1d ago", "gate"),
];



/** Gate 1 evidence snapshot for REQ-1042 (shown on request detail after Gate 1 passed) */

export const req1042Gate1Evidence: ApprovalGateDetail = {

  requestId: "REQ-1042",

  gateNumber: 1,

  gateLabel: "Prasību pārskats pirms būvniecības",

  agentSummary:

    "Requirements sub-agent izanalizēja UPB pieprasījumu un identificēja Business Central pārdošanas entītijas. Ieteikti KPI pa reģioniem un pārdevējiem, ar plāna vs. fakta salīdzinājumu. Gate 1 tika apstiprināts — build fāze sākta.",

  agentSteps: [

    {

      id: "s1",

      label: "Intake analīze",

      detail: "Parsēts pieprasījuma apraksts un klienta atsauce (UPB BC tenant)",

      status: "completed",

    },

    {

      id: "s2",

      label: "Datu avotu kartēšana",

      detail:

        "Identificētas tabulas: Sales Invoice Header/Line, Customer, Salesperson/Purchaser",

      status: "completed",

    },

    {

      id: "s3",

      label: "KPI definīcijas",

      detail: "Neto pārdošana, daudzums, YoY %, reģionu sadalījums",

      status: "completed",

    },

    {

      id: "s4",

      label: "Atvērtie jautājumi",

      detail: "2 jautājumi nosūtīti klientam par intercompany un valūtu",

      status: "warning",

    },

  ],

  evidence: REQ1042_GATE1_EVIDENCE,

  warnings: [

    {

      id: "w1",

      severity: "info",

      message:

        "Reģiona dimensija nav aizpildīta visiem klientiem — plānots fallback uz Salesperson reģionu.",

    },

  ],

  corrections: [],

  preview: {

    title: "Prasību kopsavilkums — Gate 1",

    subtitle: "Plānotā Solution struktūra (3 lappuses)",

    blocks: [

      { type: "kpi", label: "Plānotie KPI", value: "4" },

      { type: "kpi", label: "Datu tabulas", value: "5" },

      { type: "table", label: "Lappuses", rows: ["Pārskats", "Reģioni", "Pārdevēji"] },

    ],

  },

  decisionSummary: approveWithWarning("Prasības ir pietiekami skaidras BC pārdošanas KPI izveidei. Identificēti 4 KPI un 5 datu tabulas. Divi atvērtie jautājumi par intercompany un valūtu nebloķē Gate 1 — ieteicams apstiprināt ar brīdinājumu par reģiona dimensijas fallback.", { warningCount: 1 }),

  validationChecklist: [

    checklist("vc1", "Pieprasījuma apraksts parsēts", "pass"),

    checklist("vc2", "BC entītijas identificētas", "pass", "Sales Invoice Header/Line, Customer, Dimension Set Entry"),

    checklist("vc3", "KPI definīcijas", "pass", "4 KPI ar skaidriem aprēķiniem"),

    checklist("vc4", "Atvērtie jautājumi", "pass_with_warning", "2 jautājumi bez klienta atbildes"),

    checklist("vc5", "Datu avotu pieejamība", "pass_with_warning", "Reģiona dimensija nav aizpildīta visiem klientiem"),

  ],

  activityTimeline: [

    timeline("tl1", "08:12", "Requirements agent", "Intake analīze pabeigta", "Parsēts UPB pieprasījums par reģionu KPI"),

    timeline("tl2", "08:18", "Requirements agent", "Datu avotu kartēšana", "Identificētas 5 BC tabulas"),

    timeline("tl3", "08:24", "Requirements agent", "KPI definīcijas sagatavotas", "Neto pārdošana, YoY, reģioni, plāns vs fakts"),

    timeline("tl4", "08:28", "Orchestrator", "Gate 1 evidence pack gatavs", "Gaida Reviewer apstiprinājumu"),

  ],

  pipelineSteps: PIPELINE_GATE1_DONE,

};



export const approvalGateDetails: Record<string, ApprovalGateDetail> = {

  "REQ-1042": {

    requestId: "REQ-1042",

    gateNumber: 2,

    gateLabel: "Pirms piegādes validācija",

    agentSummary:

      "Validation sub-agent pārbaudīja mock Solution struktūru un KPI loģiku. Code-review sub-agent laboja tabulas nosaukumu un dimensijas kartējumu. Gate 2 gaida Reviewer apstiprinājumu pirms piegādes UPB.",

    previousGateNote:

      "Gate 1 apstiprināts pirms 22 min — prasības un KPI definīcijas saskaņotas. Build fāze pabeigta.",

    decisionSummary: approveWithWarning("Validation un code-review sub-agenti pabeidza mock Solution pārbaudi. Veikti 3 labojumi BC entītiju kartējumā — KPI loģika nemainās. Vienīgais brīdinājums: 3 legacy klientiem izmantots Salesperson fallback reģionam. Ieteicams apstiprināt piegādei UPB.", { correctionCount: 3, warningCount: 1 }),

    validationChecklist: [

      checklist("vc1", "PBIP struktūra", "pass", "3 lappuses, 12 vizualizācijas, relācijas validētas"),

      checklist("vc2", "KPI loģika", "pass", "DAX mērījumi salīdzināti ar BC lauku definīcijām"),

      checklist("vc3", "Datu avotu kartējums", "pass_with_warning", "3 legacy klienti — reģiona fallback uz Salesperson"),

      checklist("vc4", "Plāna vs. fakta salīdzinājums", "pass"),

      checklist("vc5", "Valūtas konvertācija", "pass_with_warning", "Posting date kurss — nav klienta apstiprinājuma"),

    ],

    activityTimeline: [

      timeline("tl1", "09:48", "Validation agent", "Solution pārbaudes pabeigtas", "Visi KPI mērījumi atbilst Gate 1 definīcijām"),

      timeline("tl2", "09:42", "Code-review agent", "PBIP struktūras review", "2 labojumi tabulu un dimensiju kartējumā"),

      ...gate2CloseTimeline("09:35", "3 lappuses, 12 vizualizācijas", "09:22"),

    ],

    pipelineSteps: PIPELINE_GATE2_CURRENT,

    evidence: REQ1042_GATE2_EVIDENCE,

    warnings: [

      {

        id: "w1",

        severity: "warning",

        message:

          "3 legacy klientiem nav aizpildīta reģiona dimensija — izmantots Salesperson fallback.",

      },

      {

        id: "w2",

        severity: "info",

        message:

          "Valūtas konvertācija: posting date kurss (BC noklusējums) — nav klienta apstiprinājuma.",

      },

    ],

    corrections: [

      {

        id: "c1",

        field: "Faktu tabula",

        before: "Sales Header",

        after: "Sales Invoice Header",

        reason: "BC pārdošanas faktu tabula ir Invoice, nevis Order Header",

        businessImpact: "Ietekme: KPI nemainās — tā pati faktu tabula, pareizs BC nosaukums",

      },

      {

        id: "c2",

        field: "Reģiona dimensija",

        before: "Area",

        after: "Global Dimension 1 Code",

        reason: "UPB tenant izmanto Global Dim 1 reģionam, nevis Area lauku",

        businessImpact: "Ietekme: reģionu sadalījums korekts UPB tenantam",

      },

      {

        id: "c3",

        field: "Datuma filtrs",

        before: "Document Date",

        after: "Posting Date",

        reason: "Saskaņots ar BC pārskatu loģiku un plāna salīdzinājumu",

        businessImpact: "Ietekme: plāna vs. fakta salīdzinājums saskaņots ar BC",

      },

    ],

    preview: {

      title: "BC pārdošanas KPI — priekšskatījums",

      subtitle: "Mock Solution · 3 lappuses · RUN-8821",

      blocks: [

        { type: "kpi", label: "Neto pārdošana YTD", value: "€ 2.41M" },

        { type: "kpi", label: "Plāna izpilde", value: "108%" },

        { type: "kpi", label: "YoY", value: "+12.4%" },

        {

          type: "bar",

          label: "Apjoms pa reģioniem",

          bars: [

            { label: "Rīga", width: 82 },

            { label: "Kurzeme", width: 54 },

            { label: "Latgale", width: 38 },

            { label: "Vidzeme", width: 45 },

          ],

        },

        {

          type: "table",

          label: "Top pārdevēji (YTD)",

          rows: ["A. Bērziņš — € 412K", "J. Ozols — € 389K", "L. Kalniņa — € 356K"],

        },

      ],

    },

  },

  "REQ-1036": {

    requestId: "REQ-1036",

    gateNumber: 1,

    gateLabel: "Prasību pārskats pirms būvniecības",

    agentSummary:

      "Requirements sub-agent identificēja BC pirkumu entītijas piegādātāju snieguma KPI. Ieteikti 4 galvenie rādītāji: piegādes precizitāte, kavējumi, kvalitātes atteikumi un vidējais lead time.",

    decisionSummary: approveWithWarning("Prasības par piegādātāju snieguma KPI ir skaidras un realizējamas no BC pirkumu datiem. Identificēti 4 KPI un 4 datu tabulas. Viens atvērts jautājums par kvalitātes atteikumu avotu nebloķē Gate 1 — ieteicams apstiprināt un sākt build fāzi."),

    validationChecklist: [

      checklist("vc1", "Pieprasījuma apraksts parsēts", "pass"),

      checklist("vc2", "BC entītiju kartēšana", "pass", "Purchase Header/Line, Vendor, Warehouse Receipt"),

      checklist("vc3", "KPI definīcijas", "pass", "OTIF, lead time, rejection rate, spend by vendor"),

      checklist("vc4", "Atvērtie jautājumi", "pass_with_warning", "Kvalitātes atteikumu avots nav precizēts"),

    ],

    activityTimeline: [

      timeline("tl1", "14:05", "Requirements agent", "Intake analīze pabeigta", "Parsēts piegādātāju KPI pieprasījums"),

      timeline("tl2", "14:12", "Requirements agent", "Entītiju kartēšana", "Purchase Header/Line, Vendor, Warehouse Receipt"),

      timeline("tl3", "14:18", "Requirements agent", "KPI ieteikumi sagatavoti", "4 galvenie rādītāji ar aprēķinu loģiku"),

      timeline("tl4", "14:22", "Orchestrator", "Gate 1 evidence pack gatavs", "Gaida Reviewer apstiprinājumu"),

    ],

    pipelineSteps: PIPELINE_GATE1_CURRENT,

    evidence: [

      evidence("e1", "dataSource", "Purchase Header / Line", "Pirkumu pasūtījumi ar Expected Receipt Date"),

      evidence("e2", "dataSource", "Vendor Ledger Entry", "Piegādātāju maksājumu un kavējumu konteksts"),

      evidence("e3", "kpi", "OTIF (On-Time In-Full)", "Laicīgi un pilnīgi piegādātie pasūtījumi / kopā"),

      evidence("e4", "kpi", "Vidējais lead time", "Dienas no pasūtījuma līdz receipt"),

      evidence("e5", "openQuestion", "Kvalitātes atteikumi", "Vai izmantot Return Order vai QC flag no BC?"),

    ],

    warnings: [],

    corrections: [],

    preview: {

      title: "Prasību kopsavilkums — Gate 1",

      subtitle: "Plānotā Solution · piegādātāju panelis",

      blocks: [

        { type: "kpi", label: "Plānotie KPI", value: "4" },

        { type: "kpi", label: "Datu tabulas", value: "4" },

        {

          type: "bar",

          label: "Plānotās vizualizācijas",

          bars: [

            { label: "OTIF trend", width: 70 },

            { label: "Vendor rank", width: 85 },

            { label: "Lead time", width: 60 },

          ],

        },

      ],

    },

  },

  "REQ-1033": {

    requestId: "REQ-1033",

    gateNumber: 2,

    gateLabel: "Pirms piegādes validācija",

    agentSummary:

      "Validation un code-review sub-agenti pabeidza P&L plāna vs. fakta Solution pārbaudi. Vienas GL kontu grupas mapping korekcija veikta pirms Gate 2. Gaida Reviewer apstiprinājumu Schwenk piegādei.",

    previousGateNote:

      "Gate 1 apstiprināts — P&L struktūra un kontu hierarhija saskaņota ar klientu.",

    decisionSummary: approveWithWarning("Validation un code-review sub-agenti pabeidza P&L plāna vs. fakta Solution pārbaudi. Veikts 1 GL kontu mapping labojums — variance aprēķini korekti pēc korekcijas. Q4 plāna dati vēl nav saņemti, bet YTD skats ir derīgs. Ieteicams apstiprināt Schwenk piegādei.", { correctionCount: 1 }),

    validationChecklist: [

      checklist("vc1", "P&L struktūras validācija", "pass", "Kontu hierarhija 3 līmeņos, variance loģika pārbaudīta"),

      checklist("vc2", "Plāna datu avots", "pass", "Excel plāns importēts mock modelī — 12 mēneši"),

      checklist("vc3", "GL kontu mapping", "pass_with_warning", "Konts 6110 pārkartēts no COGS uz Operating Expenses"),

      checklist("vc4", "Variance aprēķini", "pass"),

      checklist("vc5", "Plāna datu pilnīgums", "pass_with_warning", "Q4 plāna dati vēl nav saņemti — rāda YTD līdz Q3"),

    ],

    activityTimeline: [

      timeline("tl1", "11:52", "Validation agent", "Solution pārbaudes pabeigtas", "Variance loģika un kontu hierarhija validēta"),

      timeline("tl2", "11:45", "Code-review agent", "PBIP struktūras review", 'GL konts 6110 pārkartēts uz "Operating Expenses"'),

      ...gate2CloseTimeline("11:30", "P&L variance panelis ar 12 mēnešu plānu", "11:18"),

    ],

    pipelineSteps: PIPELINE_GATE2_CURRENT,

    evidence: [

      evidence("e1", "dataSource", "G/L Entry", "Faktiskie P&L dati no BC finanšu moduļa"),

      evidence("e2", "dataSource", "Budget Excel import", "Klienta plāns — mēneša granulācija, EUR"),

      evidence("e3", "kpi", "Variance (Plan vs Actual)", "Absolūtais un % novirze pa kontu grupām"),

      evidence("e4", "openQuestion", "Eliminācijas ieraksti", "Konsolidācijas eliminācijas nav iekļautas — apzināts MVP scope"),

    ],

    warnings: [

      {

        id: "w1",

        severity: "info",

        message: "Q4 plāna dati vēl nav saņemti — Solution rāda YTD līdz Q3.",

      },

    ],

    corrections: [

      {

        id: "c1",

        field: "GL konts 6110",

        before: "COGS",

        after: "Operating Expenses",

        reason: "Schwenk kontu plāna klasifikācija atšķiras no noklusējuma",

        businessImpact: "Ietekme: OpEx variance korekts, COGS nemainās",

      },

    ],

    preview: {

      title: "P&L plāns vs. fakts — priekšskatījums",

      subtitle: "Mock Solution · variance panelis",

      blocks: [

        { type: "kpi", label: "Revenue variance", value: "-2.1%" },

        { type: "kpi", label: "EBITDA variance", value: "+4.8%" },

        {

          type: "bar",

          label: "Variance pa grupām",

          bars: [

            { label: "Revenue", width: 48 },

            { label: "COGS", width: 62 },

            { label: "OpEx", width: 71 },

          ],

        },

      ],

    },

  },

};



export function getRequestById(id: string): MockRequest | undefined {

  return allRequests.find((request) => request.id === id);

}



export function getEventsForRequest(requestId: string): RequestEvent[] {
  const filtered = requestEvents.filter(
    (event) => event.requestId === requestId
  );
  // Global feed is newest-first; request detail timeline reads oldest-first.
  return [...filtered].reverse();
}



export function getApprovalGateDetail(

  requestId: string

): ApprovalGateDetail | undefined {

  return approvalGateDetails[requestId];

}



export function getPendingApprovals(): MockRequest[] {

  return allRequests.filter((request) => request.status === "Approval Gate");

}



export const statusProgression: RequestStatus[] = [

  "Intake",

  "Agent Run",

  "Approval Gate",

  "Delivered",

];



export function getStatusIndex(status: RequestStatus): number {

  return statusProgression.indexOf(status);

}


