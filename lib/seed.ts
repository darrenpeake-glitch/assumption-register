import { prisma } from "./prisma";

export async function seedOnce() {
  const count = await prisma.assumption.count();
  if (count > 0) return;

  await prisma.assumption.create({
    data: {
      statement: "Customers will pay for a lightweight assumption register.",
      area: "PROBLEM",
      risk: 4,
      confidence: 2,
      status: "UNTESTED",
      testPlan: "Interview 5 founders and attempt a pre-sell landing page.",
    },
  });
}

