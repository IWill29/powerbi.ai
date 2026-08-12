"""Mock evidence packs for Approval Gate review UI."""

from __future__ import annotations

from app.models import Request
from app.schemas.approval import (
    ActivityTimelineItem,
    ApprovalGateDetail,
    ApprovalWarning,
    CorrectionDiff,
    DecisionSummary,
    EvidenceItem,
    MockPreview,
    MockPreviewBlock,
    PipelineStep,
    ValidationChecklistItem,
)


def _gate_label(gate_number: int) -> str:
    if gate_number == 1:
        return "Prasību pārskats pirms būvniecības"
    return "Pirms piegādes validācija"


def build_gate_detail(request: Request, gate_number: int) -> ApprovalGateDetail:
    """Build review payload from Request metadata and gate number."""
    client = request.client_reference
    is_gate1 = gate_number == 1

    evidence = [
        EvidenceItem(
            id="e1",
            category="dataSource",
            title="Sales Invoice Header / Line" if "pārdoš" in request.title.lower() else "G/L Entry",
            detail="Galvenais faktu avots no Business Central",
        ),
        EvidenceItem(
            id="e2",
            category="dataSource",
            title="Customer + Dimension Set Entry",
            detail="Dimensiju kartējums klienta tenantam",
        ),
        EvidenceItem(
            id="e3",
            category="kpi",
            title="Neto pārdošanas apjoms (EUR)" if is_gate1 else "Variance (Plan vs Actual)",
            detail="SUM(Amount) ar Posting Date filtru" if is_gate1 else "Absolūtais un % novirze pa kontu grupām",
        ),
        EvidenceItem(
            id="e4",
            category="openQuestion",
            title="Intercompany filtrs",
            detail="Klienta atbilde nav saņemta — izmantots noklusējums",
        ),
    ]

    warnings: list[ApprovalWarning] = []
    if not is_gate1:
        warnings.append(
            ApprovalWarning(
                id="w1",
                severity="warning",
                message="3 legacy klientiem nav aizpildīta reģiona dimensija — izmantots Salesperson fallback.",
            )
        )

    corrections: list[CorrectionDiff] = []
    if not is_gate1:
        corrections = [
            CorrectionDiff(
                id="c1",
                field="Faktu tabula",
                before="Sales Header",
                after="Sales Invoice Header",
                reason="BC pārdošanas faktu tabula ir Invoice, nevis Order Header",
                business_impact="Ietekme: KPI nemainās — pareizs BC nosaukums",
            ),
        ]

    preview_blocks: list[MockPreviewBlock]
    if is_gate1:
        preview_blocks = [
            MockPreviewBlock(type="kpi", label="Plānotie KPI", value="4"),
            MockPreviewBlock(type="kpi", label="Datu tabulas", value="5"),
            MockPreviewBlock(type="table", label="Lappuses", rows=["Pārskats", "Reģioni", "Detaļas"]),
        ]
    else:
        preview_blocks = [
            MockPreviewBlock(type="kpi", label="Neto pārdošana YTD", value="€ 2.41M"),
            MockPreviewBlock(type="kpi", label="Plāna izpilde", value="108%"),
            MockPreviewBlock(
                type="bar",
                label="Apjoms pa reģioniem",
                bars=[
                    {"label": "Rīga", "width": 82},
                    {"label": "Kurzeme", "width": 54},
                    {"label": "Latgale", "width": 38},
                ],
            ),
        ]

    pipeline_steps = [
        PipelineStep(label="Gate 1", status="done" if not is_gate1 else "current"),
        PipelineStep(
            label="Build",
            status="done" if not is_gate1 else "pending",
        ),
        PipelineStep(
            label="Validate",
            status="done" if not is_gate1 else "pending",
        ),
        PipelineStep(label="Gate 2", status="current" if not is_gate1 else "pending"),
    ]

    activity = [
        ActivityTimelineItem(
            id="tl1",
            time="08:12",
            actor="Requirements agent" if is_gate1 else "Validation agent",
            event="Intake analīze pabeigta" if is_gate1 else "Solution pārbaudes pabeigtas",
            detail=f"Parsēts {client} pieprasījums",
        ),
        ActivityTimelineItem(
            id="tl2",
            time="08:18",
            actor="Orchestrator",
            event=f"Gate {gate_number} evidence pack gatavs",
            detail="Gaida Reviewer apstiprinājumu",
        ),
    ]

    pending_approval = next(
        (a for a in request.approvals if a.gate_number == gate_number),
        None,
    )

    return ApprovalGateDetail(
        request_id=request.id,
        gate_number=gate_number,
        gate_label=_gate_label(gate_number),
        agent_summary=(
            f"Requirements sub-agent izanalizēja {client} pieprasījumu. "
            f"Ieteikti KPI un datu avoti Business Central kontekstā. "
            f"Gate {gate_number} gaida Reviewer lēmumu."
            if is_gate1
            else f"Validation un code-review sub-agenti pabeidza mock Solution pārbaudi "
            f"{client} pieprasījumam. Gate 2 gaida Reviewer apstiprinājumu pirms piegādes."
        ),
        evidence=evidence,
        warnings=warnings,
        corrections=corrections,
        preview=MockPreview(
            title=f"Prasību kopsavilkums — Gate {gate_number}"
            if is_gate1
            else f"{request.title} — priekšskatījums",
            subtitle=f"Mock Solution · {client}",
            blocks=preview_blocks,
        ),
        previous_gate_note=(
            None
            if is_gate1
            else "Gate 1 apstiprināts — prasības un KPI definīcijas saskaņotas. Build fāze pabeigta."
        ),
        decision_summary=DecisionSummary(
            verdict="approve_with_warning",
            verdict_label="Apstiprināt ar brīdinājumu",
            correction_count=len(corrections),
            warning_count=len([w for w in warnings if w.severity == "warning"]),
            blocker_count=0,
            summary_text=(
                f"Prasības par {request.title} ir skaidras un realizējamas no BC datiem. "
                f"Ieteicams apstiprināt Gate {gate_number}."
            ),
        ),
        validation_checklist=[
            ValidationChecklistItem(id="vc1", label="Pieprasījuma apraksts parsēts", status="pass"),
            ValidationChecklistItem(
                id="vc2",
                label="BC entītijas identificētas",
                status="pass",
                detail="Sales Invoice Header/Line, Customer",
            ),
            ValidationChecklistItem(
                id="vc3",
                label="KPI definīcijas" if is_gate1 else "PBIP struktūra",
                status="pass_with_warning" if warnings else "pass",
            ),
        ],
        activity_timeline=activity,
        pipeline_steps=pipeline_steps,
        approval_status=pending_approval.status if pending_approval else "pending",
        decided_at=pending_approval.decided_at if pending_approval else None,
    )
