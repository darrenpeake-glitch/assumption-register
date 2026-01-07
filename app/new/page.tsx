export const dynamic = "force-dynamic";

import { createAssumption } from "../actions";

const areas = ["CUSTOMER","PROBLEM","SOLUTION","CHANNEL","PRICING","OPS","OTHER"] as const;

export default async function NewAssumptionPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp?.error;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 8 }}>New assumption</h1>
      <p style={{ marginTop: 0, color: "#555" }}>One claim you can test.</p>

      {error ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #f5c2c7", borderRadius: 8 }}>
          <strong style={{ display: "block", marginBottom: 4 }}>Couldn’t save</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <form action={createAssumption} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Statement
          <textarea name="statement" rows={3} required />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Area
          <select name="area" defaultValue="PROBLEM">
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, flex: 1 }}>
            Risk (1–5)
            <input name="risk" type="number" min={1} max={5} defaultValue={4} required />
          </label>

          <label style={{ display: "grid", gap: 6, flex: 1 }}>
            Confidence (1–5)
            <input name="confidence" type="number" min={1} max={5} defaultValue={2} required />
          </label>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          Test plan (optional)
          <textarea name="testPlan" rows={3} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Due date (optional)
          <input name="dueDate" type="date" />
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit">Create</button>
          <a href="/">Cancel</a>
        </div>
      </form>
    </main>
  );
}
