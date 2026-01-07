"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function asInt(v: FormDataEntryValue | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Redirect works by throwing NEXT_REDIRECT. Never swallow it.
function rethrowRedirect(e: unknown): void {
  if (!e || typeof e !== "object") return;
  if (!("digest" in e)) return;
  const d = (e as any).digest;
  if (typeof d === "string" && d.startsWith("NEXT_REDIRECT")) {
    throw e;
  }
}

function withError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createAssumption(formData: FormData) {
  const back = "/new";

  try {
    const statement = String(formData.get("statement") ?? "").trim();
    const area = String(formData.get("area") ?? "OTHER").trim();
    const risk = asInt(formData.get("risk"), 3);
    const confidence = asInt(formData.get("confidence"), 3);

    const testPlan = String(formData.get("testPlan") ?? "").trim();
    const dueDateStr = String(formData.get("dueDate") ?? "").trim();
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;

    if (statement.length < 5) withError(back, "Statement must be at least 5 characters.");
    if (risk < 1 || risk > 5) withError(back, "Risk must be 1–5.");
    if (confidence < 1 || confidence > 5) withError(back, "Confidence must be 1–5.");

    const allowedAreas = ["CUSTOMER", "PROBLEM", "SOLUTION", "CHANNEL", "PRICING", "OPS", "OTHER"] as const;
    if (!allowedAreas.includes(area as any)) withError(back, "Invalid area.");

    await prisma.assumption.create({
      data: {
        statement,
        area: area as any,
        risk,
        confidence,
        testPlan: testPlan.length ? testPlan : null,
        dueDate,
      },
    });

    revalidatePath("/");
    redirect("/");
  } catch (e: any) {
    rethrowRedirect(e);
    withError(back, e?.message ?? "Failed to create assumption.");
  }
}

export async function addEvidence(formData: FormData) {
  const assumptionId = String(formData.get("assumptionId") ?? "").trim();
  const back = assumptionId ? `/assumptions/${assumptionId}` : "/";

  try {
    const type = String(formData.get("type") ?? "note").trim();
    const content = String(formData.get("content") ?? "").trim();

    if (!assumptionId) withError("/", "Missing assumptionId.");
    if (!content) withError(back, "Evidence content is required.");
    if (type !== "note" && type !== "link") withError(back, "Evidence type must be note or link.");

    await prisma.evidence.create({
      data: { assumptionId, type, content },
    });

    revalidatePath(back);
    redirect(back);
  } catch (e: any) {
    rethrowRedirect(e);
    withError(back, e?.message ?? "Failed to add evidence.");
  }
}

export async function updateAssumptionStatus(formData: FormData) {
  const assumptionId = String(formData.get("assumptionId") ?? "").trim();
  const back = assumptionId ? `/assumptions/${assumptionId}` : "/";

  try {
    const status = String(formData.get("status") ?? "").trim();
    const decisionNote = String(formData.get("decisionNote") ?? "").trim();

    if (!assumptionId) withError("/", "Missing assumptionId.");

    const allowedStatuses = ["UNTESTED", "TESTING", "VALIDATED", "INVALIDATED", "PARKED"] as const;
    if (!allowedStatuses.includes(status as any)) withError(back, "Invalid status.");

    const needsDecision = status === "VALIDATED" || status === "INVALIDATED";
    if (needsDecision && decisionNote.length < 5) {
      withError(back, "Decision note required for VALIDATED / INVALIDATED.");
    }

    // Do not wipe decisionNote automatically. Only set it if provided.
    const data: any = { status: status as any };
    if (decisionNote.length) data.decisionNote = decisionNote;

    await prisma.assumption.update({
      where: { id: assumptionId },
      data,
    });

    revalidatePath(back);
    revalidatePath("/");
    redirect(back);
  } catch (e: any) {
    rethrowRedirect(e);
    withError(back, e?.message ?? "Failed to update status.");
  }
}
