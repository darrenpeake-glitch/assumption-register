export const dynamic = "force-dynamic";

import { prisma } from "../../../lib/prisma";
import { addEvidence, updateAssumptionStatus } from "../../actions";

const statuses = ["UNTESTED", "TESTING", "VALIDATED", "INVALIDATED", "PARKED"] as const;

export default async function AssumptionDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp?.error;

  const a = await prisma.assumption.findUnique({
    where: { id: params.id },
    include: { evidence: { orderBy: { createdAt: "desc" } } },
  });

  if (!a) {
    return (
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
        <h1>Not found</h1>
        <a href="/">← Back</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui", display: "grid", gap: 16 }}>
      <a href="/">← Back</a>

      {error ? (
        <div style={{ padding: 12, border: "1px solid #f5c2c7", borderRadius: 8 }}>
          <strong style={{ display: "block", marginBottom: 4 }}>Couldn’t complete action</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>{a.statement}</h1>

        <div style={{ display: "flex", gap: 12, color: "#555", flexWrap: "wrap" }}>
          <span>Area: {a.area}</span>
          <span>Status: {a.status}</span>
          <span>Risk: {a.risk}/5</span>
          <span>Confidence: {a.confidence}/5</span>
          {a.dueDate ? <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span> : null}
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Test plan:</strong>{" "}
          <span style={{ color: a.testPlan ? "inherit" : "#777" }}>{a.testPlan ?? "—"}</span>
        </div>

        <div style={{ marginTop: 8 }}>
          <strong>Decision note:</strong>{" "}
          <span style={{ color: a.decisionNote ? "inherit" : "#777" }}>{a.decisionNote ?? "—"}</span>
        </div>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Change status</h2>

        <form action={updateAssumptionStatus} style={{ display: "grid", gap: 12, maxWidth: 720 }}>
          <input type="hidden" name="assumptionId" value={a.id} />

          <label style={{ display: "grid", gap: 6 }}>
            New status
            <select name="status" defaultValue={a.status}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            Decision note (required for VALIDATED / INVALIDATED)
            <textarea
              name="decisionNote"
              rows={3}
              placeholder="What did we change / decide because of this result?"
              defaultValue={a.decisionNote ?? ""}
            />
          </label>

          <button type="submit">Update status</button>
        </form>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Evidence</h2>

        <form action={addEvidence} style={{ display: "grid", gap: 12, maxWidth: 720, marginBottom: 16 }}>
          <input type="hidden" name="assumptionId" value={a.id} />

          <label style={{ display: "grid", gap: 6 }}>
            Type
            <select name="type" defaultValue="note">
              <option value="note">note</option>
              <option value="link">link</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            Content
            <textarea name="content" rows={3} required />
          </label>

          <button type="submit">Add evidence</button>
        </form>

        <div style={{ display: "grid", gap: 12 }}>
          {a.evidence.length === 0 ? (
            <div style={{ color: "#777" }}>No evidence yet.</div>
          ) : (
            a.evidence.map((e) => (
              <div key={e.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{e.type}</strong>
                  <span style={{ color: "#777" }}>{new Date(e.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{e.content}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
