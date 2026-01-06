import { prisma } from "../lib/prisma";
import { ensureSeedAssumption } from "../lib/seed";

function priority(risk: number, confidence: number) {
  return risk * (6 - confidence);
}

export default async function Home() {
  // temporary seed so you can see real data immediately
  await ensureSeedAssumption();

  const assumptions = await prisma.assumption.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      statement: true,
      area: true,
      risk: true,
      confidence: true,
      status: true,
      updatedAt: true,
    },
  });

  const sorted = assumptions
    .map((a) => ({ ...a, priority: priority(a.risk, a.confidence) }))
    .sort((a, b) => b.priority - a.priority);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 8 }}>Assumption Register</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Priority = risk × (6 − confidence)
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {sorted.map((a) => (
          <div key={a.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>{a.statement}</strong>
              <span>Priority: {a.priority}</span>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8, color: "#555", flexWrap: "wrap" }}>
              <span>{a.area}</span>
              <span>{a.status}</span>
              <span>Risk {a.risk}/5</span>
              <span>Conf {a.confidence}/5</span>
              <span style={{ marginLeft: "auto" }}>
                {new Date(a.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

