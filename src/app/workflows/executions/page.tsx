import Link from "next/link";

import { StatusPill } from "@/components/status-pill";
import { toRelativeTime } from "@/lib/format";
import type { N8nExecution, N8nExecutionStatus } from "@/lib/n8n";
import { getWorkflowConsoleData, listExecutionsFiltered } from "@/lib/n8n";

type ExecutionsPageProps = {
  searchParams: Promise<{
    workflowId?: string | string[];
    status?: string | string[];
  }>;
};

function getStatusTone(status: N8nExecutionStatus) {
  switch (status) {
    case "success":
      return "teal" as const;
    case "running":
      return "amber" as const;
    case "error":
    case "crashed":
      return "rose" as const;
    case "waiting":
    case "new":
      return "berry" as const;
    case "canceled":
    case "unknown":
      return "slate" as const;
  }
}

function getStatusLabel(status: N8nExecutionStatus) {
  switch (status) {
    case "success":
      return "Succeeded";
    case "running":
      return "Running";
    case "error":
      return "Failed";
    case "crashed":
      return "Crashed";
    case "waiting":
      return "Waiting";
    case "new":
      return "Queued";
    case "canceled":
      return "Canceled";
    case "unknown":
      return "Unknown";
  }
}

function getModeLabel(mode: string) {
  switch (mode) {
    case "trigger":
      return "Trigger";
    case "webhook":
      return "Webhook";
    case "manual":
      return "Manual";
    case "retry":
      return "Retry";
    case "integrated":
      return "Integrated";
    default:
      return mode;
  }
}

function getDuration(execution: N8nExecution) {
  if (!execution.startedAt || !execution.stoppedAt) {
    return "—";
  }

  const start = new Date(execution.startedAt).getTime();
  const end = new Date(execution.stoppedAt).getTime();
  const diffMs = end - start;

  if (diffMs < 1000) return `${diffMs}ms`;
  if (diffMs < 60_000) return `${(diffMs / 1000).toFixed(1)}s`;
  return `${Math.floor(diffMs / 60_000)}m ${Math.round((diffMs % 60_000) / 1000)}s`;
}

const statusOptions: N8nExecutionStatus[] = [
  "success",
  "error",
  "running",
  "waiting",
  "crashed",
  "canceled",
];

export default async function ExecutionsPage({
  searchParams,
}: ExecutionsPageProps) {
  const params = await searchParams;
  const workflowId = Array.isArray(params.workflowId)
    ? params.workflowId[0]
    : params.workflowId;
  const status = Array.isArray(params.status)
    ? params.status[0]
    : params.status;

  const [consoleData, executions] = await Promise.all([
    getWorkflowConsoleData(),
    listExecutionsFiltered({
      workflowId: workflowId || undefined,
      status: (status as N8nExecutionStatus) || undefined,
      limit: 100,
    }),
  ]);

  const workflows =
    consoleData.status === "ready" || consoleData.status === "error"
      ? consoleData.workflows
      : [];

  const workflowMap = new Map(
    workflows.map((w) => [String(w.id), w.name]),
  );

  return (
    <>
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Execution History</p>
            <h2 className="section-title mt-3 max-w-[16ch]">
              Every workflow run, tracked and searchable.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Filter by workflow or status to investigate failures, measure
              timing, and audit automation behaviour across your n8n instance.
            </p>
          </div>

          <Link
            href="/workflows"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
          >
            ← Back to Flows
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="panel p-5">
        <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <select
            name="workflowId"
            defaultValue={workflowId || ""}
            className="form-input"
          >
            <option value="">All workflows</option>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={status || ""}
            className="form-input"
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {getStatusLabel(s)}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Apply filters
          </button>
        </form>
      </section>

      {/* Results */}
      <section className="panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Results</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
              {executions.length} execution{executions.length !== 1 ? "s" : ""}{" "}
              found
            </h3>
          </div>
          <StatusPill
            label={`${executions.length} runs`}
            tone="berry"
          />
        </div>

        {executions.length === 0 ? (
          <div className="surface-card mt-5 p-5">
            <p className="text-sm leading-6 text-[var(--muted)]">
              No executions match the current filters.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Workflow</th>
                  <th>Status</th>
                  <th>Mode</th>
                  <th>Started</th>
                  <th>Duration</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((execution) => {
                  const wfName =
                    execution.workflowName ||
                    workflowMap.get(String(execution.workflowId)) ||
                    `Workflow #${execution.workflowId}`;

                  return (
                    <tr key={execution.id}>
                      <td>
                        <p className="font-mono text-sm font-semibold text-[var(--foreground)]">
                          {execution.id}
                        </p>
                      </td>
                      <td>
                        <p className="font-semibold text-[var(--foreground)]">
                          {wfName}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          ID {execution.workflowId}
                        </p>
                      </td>
                      <td>
                        <StatusPill
                          label={getStatusLabel(execution.status)}
                          tone={getStatusTone(execution.status)}
                        />
                      </td>
                      <td>
                        <span className="text-sm text-[var(--foreground)]">
                          {getModeLabel(execution.mode)}
                        </span>
                      </td>
                      <td>
                        <p className="text-sm text-[var(--foreground)]">
                          {toRelativeTime(execution.startedAt)}
                        </p>
                      </td>
                      <td>
                        <p className="font-mono text-sm text-[var(--foreground)]">
                          {getDuration(execution)}
                        </p>
                      </td>
                      <td>
                        <Link
                          href={`/workflows/executions/${execution.id}`}
                          className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx={12} cy={12} r={3} />
                          </svg>
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
