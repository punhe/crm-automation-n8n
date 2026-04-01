import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusPill } from "@/components/status-pill";
import { toRelativeTime } from "@/lib/format";
import type { N8nExecutionStatus, N8nNodeExecution } from "@/lib/n8n";
import { getExecutionById } from "@/lib/n8n";

type ExecutionDetailPageProps = {
  params: Promise<{ id: string }>;
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

function getNodeStatusTone(status?: string) {
  if (!status) return "slate" as const;
  switch (status) {
    case "success":
      return "teal" as const;
    case "error":
      return "rose" as const;
    case "running":
      return "amber" as const;
    default:
      return "slate" as const;
  }
}

function formatNodeDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

function getNodeTypeName(type: string) {
  return type
    .replace(/^n8n-nodes-base\./, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

function truncateJson(obj: unknown, maxLength = 2000): string {
  const str = JSON.stringify(obj, null, 2);
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}\n... (truncated)`;
}

function NodeCard({
  nodeName,
  nodeType,
  runs,
}: {
  nodeName: string;
  nodeType?: string;
  runs: N8nNodeExecution[];
}) {
  const lastRun = runs[runs.length - 1];
  const outputItems =
    lastRun?.data?.main?.reduce(
      (count, arr) => count + (arr?.length ?? 0),
      0,
    ) ?? 0;

  return (
    <article className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] p-4">
        <div>
          <p className="text-base font-semibold text-[var(--foreground)]">
            {nodeName}
          </p>
          {nodeType ? (
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {getNodeTypeName(nodeType)}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <StatusPill
            label={lastRun?.executionStatus ?? "unknown"}
            tone={getNodeStatusTone(lastRun?.executionStatus)}
          />
          <span className="rounded-md bg-[var(--panel-soft)] px-2 py-1 font-mono text-xs text-[var(--muted)]">
            {formatNodeDuration(lastRun?.executionTime ?? 0)}
          </span>
        </div>
      </div>

      {/* Output data preview */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">
            Output — {outputItems} item{outputItems !== 1 ? "s" : ""}
          </p>
        </div>

        {lastRun?.data?.main && lastRun.data.main.length > 0 ? (
          <div className="mt-3 max-h-[300px] overflow-auto rounded-lg bg-[#1C1D21] p-4">
            <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-5 text-[#a8f0c6]">
              {truncateJson(
                lastRun.data.main.flatMap((arr) =>
                  (arr ?? []).map((item) => item.json),
                ),
              )}
            </pre>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No output data captured for this node.
          </p>
        )}
      </div>
    </article>
  );
}

export default async function ExecutionDetailPage({
  params,
}: ExecutionDetailPageProps) {
  const { id } = await params;
  const execution = await getExecutionById(id);

  if (!execution) {
    notFound();
  }

  const workflowName =
    execution.workflowData?.name || `Workflow #${execution.workflowId}`;
  const runData = execution.data?.resultData?.runData ?? {};
  const nodeEntries = Object.entries(runData);

  const nodeTypeMap = new Map(
    (execution.workflowData?.nodes ?? []).map((n) => [n.name, n.type]),
  );

  const startTime = execution.startedAt
    ? new Date(execution.startedAt)
    : null;
  const endTime = execution.stoppedAt
    ? new Date(execution.stoppedAt)
    : null;

  let durationLabel = "—";
  if (startTime && endTime) {
    const diffMs = endTime.getTime() - startTime.getTime();
    if (diffMs < 1000) durationLabel = `${diffMs}ms`;
    else if (diffMs < 60_000) durationLabel = `${(diffMs / 1000).toFixed(1)}s`;
    else
      durationLabel = `${Math.floor(diffMs / 60_000)}m ${Math.round((diffMs % 60_000) / 1000)}s`;
  }

  return (
    <>
      {/* Header */}
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Execution #{execution.id}</p>
            <h2 className="section-title mt-3">{workflowName}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Inspect output data from each node for this execution run.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/workflows/executions?workflowId=${execution.workflowId}`}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
            >
              ← All Runs
            </Link>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="surface-card p-4">
          <p className="eyebrow">Status</p>
          <div className="mt-2">
            <StatusPill
              label={getStatusLabel(execution.status)}
              tone={getStatusTone(execution.status)}
            />
          </div>
        </article>

        <article className="surface-card p-4">
          <p className="eyebrow">Mode</p>
          <p className="mt-2 text-lg font-bold text-[var(--foreground)]">
            {execution.mode}
          </p>
        </article>

        <article className="surface-card p-4">
          <p className="eyebrow">Started</p>
          <p className="mt-2 text-lg font-bold text-[var(--foreground)]">
            {toRelativeTime(execution.startedAt)}
          </p>
          {startTime ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {startTime.toLocaleString()}
            </p>
          ) : null}
        </article>

        <article className="surface-card p-4">
          <p className="eyebrow">Duration</p>
          <p className="mt-2 font-mono text-lg font-bold text-[var(--foreground)]">
            {durationLabel}
          </p>
        </article>
      </section>

      {/* Node results */}
      <section className="panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Node results</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
              {nodeEntries.length} node{nodeEntries.length !== 1 ? "s" : ""}{" "}
              executed
            </h3>
          </div>
          <StatusPill label={`${nodeEntries.length} nodes`} tone="berry" />
        </div>

        {nodeEntries.length === 0 ? (
          <div className="surface-card mt-5 p-5">
            <p className="text-sm leading-6 text-[var(--muted)]">
              No node data was returned for this execution. This may happen if
              the execution is still in progress or the data was not captured.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {nodeEntries.map(([nodeName, runs]) => (
              <NodeCard
                key={nodeName}
                nodeName={nodeName}
                nodeType={nodeTypeMap.get(nodeName)}
                runs={runs}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
