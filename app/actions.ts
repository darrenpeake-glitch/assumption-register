"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

function asInt(v: FormDataEntryValue | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function createAssumption(formData: FormData) {
  const statement = String(formData.get("statement") ?? "").trim();
  const area = String(formData.get("area") ?? "OTHER");
  const risk = asInt(formData.get("risk"), 3);
  const confidence = asInt(formData.get("confidence"), 3);
  const testPlanRaw = formData.get("testPlan");
  const testPlan = testPlanRaw ? String(testPlanRaw).trim() : null;
  const dueDateRaw = formData.get("dueDate");
  const dueDate = dueDateRaw ? new Date(String(dueDateRaw)) : null;

  if (statement.length < 5) throw new Error("Statement must be at least 5 characters.");
  if (risk < 1 || risk > 5) throw new Error("Risk must be 1-5.");
  if (confidence < 1 || confidence > 5) throw new Error("Confidence must be 1-5.");

  await prisma.assumption.create({
    data: {
      statement,
      area: area as any,
      risk,
      confidence,
      testPlan: testPlan && testPlan.length > 0 ? testPlan : null,
      dueDate,
    },
  });

  revalidatePath("/");
}

export async function addEvidence(formData: FormData) {
  const assumptionId = String(formData.get("assumptionId") ?? "").trim();
  const type = String(formData.get("type") ?? "note").trim(); // "note" | "link"
  const content = String(formData.get("content") ?? "").trim();

  if (!assumptionId) throw new Error("Missing assumptionId.");
  if (!content) throw new Error("Evidence content is required.");
  if (type !== "note" && type !== "link") throw new Error("Invalid evidence type.");

  await prisma.evidence.create({
    data: {
      assumptionId,
      type,
      content,
    },
  });

  revalidatePath(`/assumptions/${assumptionId}`);
}

export async function updateAssumptionStatus(formData: FormData) {
  const assumptionId = String(formData.get("assumptionId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const decisionNoteRaw = formData.get("decisionNote");
  const decisionNote = decisionNoteRaw ? String(decisionNoteRaw).trim() : "";

  if (!assumptionId) throw new Error("Missing assumptionId.");

  const allowed = ["UNTESTED", "TESTING", "VALIDATED", "INVALIDATED", "PARKED"] as const;
  if (!allowed.includes(status as any)) throw new Error("Invalid status.");

  const needsDecision = status === "VALIDATED" || status === "INVALIDATED";
  if (needsDecision && decisionNote.length < 5) {
    throw new Error("Decision note required for Validated/Invalidated.");
  }

  await prisma.assumption.update({
    where: { id: assumptionId },
    data: {
      status: status as any,
      decisionNote: needsDecision ? decisionNote : null,
    },
  });

  revalidatePath(`/assumptions/${assumptionId}`);
  revalidatePath(`/`);
}
