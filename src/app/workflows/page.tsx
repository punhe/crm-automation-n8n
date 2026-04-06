import Link from "next/link";
import { setWorkflowActiveAction } from "@/app/actions";
import { ActionButton } from "@/components/action-button";
import { FlashBanner } from "@/components/flash-banner";
import { StatusPill } from "@/components/status-pill";
import type { N8nExecution, N8nExecutionStatus, N8nWorkflow } from "@/lib/n8n";
import { getWorkflowConsoleData } from "@/lib/n8n";
import { toRelativeTime } from "@/lib/format";

type WorkflowsPageProps = {
  searchParams: Promise<{ flash?: string | string[] }>;
};

function SummaryCard({
  eyebrow,
  value,
  caption,
}: {
  eyebrow: string;
  value: string;
  caption: string;
}) {
  return (
    <article className="surface-card p-4">
      <p className="eyebrow">{eyebrow}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">{caption}</p>
    </article>
  );
}

function getWorkflowProjectName(workflow: N8nWorkflow) {
  return workflow.shared?.find((entry) => entry.project?.name)?.project?.name || null;
}

function getExecutionTone(status: N8nExecutionStatus) {
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

function getExecutionLabel(execution: N8nExecution | undefined) {
  if (!execution) {
    return "No runs yet";
  }

  switch (execution.status) {
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

function getExecutionTimeLabel(execution: N8nExecution | undefined) {
  if (!execution) {
    return "No execution signal returned by n8n yet.";
  }

  if (execution.status === "running") {
    return `Started ${toRelativeTime(execution.startedAt)}`;
  }

  return `Last activity ${toRelativeTime(execution.stoppedAt || execution.startedAt)}`;
}

function WorkflowState({
  workflow,
  isRunning,
}: {
  workflow: N8nWorkflow;
  isRunning: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {workflow.isArchived ? (
        <StatusPill label="Archived" tone="slate" />
      ) : workflow.active ? (
        <StatusPill label="Published" tone="teal" />
      ) : (
        <StatusPill label="Draft" tone="slate" />
      )}
      {isRunning ? <StatusPill label="Running" tone="amber" /> : null}
    </div>
  );
}

export default async function WorkflowsPage({
  searchParams,
}: WorkflowsPageProps) {
  const params = await searchParams;
  const workflowConsole = await getWorkflowConsoleData();

  const publishedCount = workflowConsole.workflows.filter(
    (workflow) => workflow.active && !workflow.isArchived,
  ).length;
  const draftCount = workflowConsole.workflows.filter(
    (workflow) => !workflow.active && !workflow.isArchived,
  ).length;
  const runningCount = workflowConsole.runningWorkflowIds.length;

  return (
    <>
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Workflows</p>
            <h2 className="section-title mt-3 max-w-[13ch]">
              Manage n8n flows without leaving the console.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              This view keeps publish state, trigger posture and recent execution
              signals in one place so you can spot which automations are live,
              paused or currently running.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/workflows/executions"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Execution History
            </Link>
            {workflowConsole.consoleUrl ? (
              <a
                href={workflowConsole.consoleUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
              >
                Open n8n
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <FlashBanner flash={params.flash} />

      {workflowConsole.status === "unconfigured" ? (
        <section className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Configuration</p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
                Connect this workspace to n8n first
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Add the environment variables below, then reload this page to
                list and control your workflows from the app.
              </p>
            </div>
            <StatusPill label="Not configured" tone="amber" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {["N8N_BASE_URL", "N8N_API_KEY", "N8N_WEBHOOK_BASE_URL"].map((item) => (
              <div key={item} className="surface-card p-4">
                <p className="eyebrow">Environment variable</p>
                <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {workflowConsole.status === "error" ? (
        <section className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">n8n status</p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
                The workflow API is reachable from this app, but the current request failed
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                {workflowConsole.errorMessage}
              </p>
            </div>
            <StatusPill label="Connection issue" tone="rose" />
          </div>
        </section>
      ) : null}

      {workflowConsole.status === "ready" ? (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              eyebrow="Total flows"
              value={String(workflowConsole.workflows.length)}
              caption="Every workflow returned by the configured n8n project."
            />
            <SummaryCard
              eyebrow="Published"
              value={String(publishedCount)}
              caption="Flows that are currently active and ready to receive triggers."
            />
            <SummaryCard
              eyebrow="Drafts"
              value={String(draftCount)}
              caption="Workflows that exist in n8n but are not active right now."
            />
            <SummaryCard
              eyebrow="Running now"
              value={String(runningCount)}
              caption="Unique workflows with an execution currently in progress."
            />
          </section>

          {!workflowConsole.executionSignalsAvailable ? (
            <section className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <p className="text-base font-semibold text-[var(--foreground)]">
                  Execution history is partially unavailable
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Publish and pause controls still work, but recent run signals from
                  the executions endpoint could not be loaded for this request.
                </p>
              </div>
              <StatusPill label="Partial data" tone="amber" />
            </section>
          ) : null}

          <section className="panel p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Flow roster</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
                  Publish state, triggers and latest run signals
                </h3>
              </div>
              <StatusPill label={`${workflowConsole.workflows.length} workflows`} tone="berry" />
            </div>

            {workflowConsole.workflows.length === 0 ? (
              <div className="surface-card mt-5 p-5">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  No workflows were returned by the current n8n API key.
                </p>
              </div>
            ) : (
              <div className="mt-5 overflow-hidden rounded-lg">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Workflow</th>
                      <th>Status</th>
                      <th>Triggers</th>
                      <th>Latest run</th>
                      <th>Tags</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflowConsole.workflows.map((workflow) => {
                      const isRunning = workflowConsole.runningWorkflowIds.includes(workflow.id);
                      const execution =
                        workflowConsole.latestExecutionByWorkflow[workflow.id];
                      const projectName = getWorkflowProjectName(workflow);

                      return (
                        <tr key={workflow.id}>
                          <td>
                            <p className="font-semibold text-[var(--foreground)]">
                              {workflow.name}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--muted)]">
                              ID {workflow.id}
                              {projectName ? ` - ${projectName}` : ""}
                            </p>
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              Updated {toRelativeTime(workflow.updatedAt || workflow.createdAt)}
                            </p>
                          </td>
                          <td>
                            <WorkflowState workflow={workflow} isRunning={isRunning} />
                          </td>
                          <td>
                            <p className="font-semibold text-[var(--foreground)]">
                              {workflow.triggerCount ?? 0}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--muted)]">
                              Active trigger nodes
                            </p>
                          </td>
                          <td>
                            {execution ? (
                              <div className="space-y-2">
                                <StatusPill
                                  label={getExecutionLabel(execution)}
                                  tone={getExecutionTone(execution.status)}
                                />
                                <p className="text-xs text-[var(--muted)]">
                                  {getExecutionTimeLabel(execution)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-[var(--muted)]">
                                {getExecutionTimeLabel(execution)}
                              </p>
                            )}
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              {workflow.tags && workflow.tags.length > 0 ? (
                                workflow.tags.map((tag) => (
                                  <StatusPill
                                    key={tag.id}
                                    label={tag.name}
                                    tone="slate"
                                  />
                                ))
                              ) : (
                                <span className="text-sm text-[var(--muted)]">No tags</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {workflow.isArchived ? (
                              <span className="text-sm text-[var(--muted)]">
                                Archived
                              </span>
                            ) : (
                              <form action={setWorkflowActiveAction}>
                                <input
                                  type="hidden"
                                  name="workflowId"
                                  value={workflow.id}
                                />
                                <input
                                  type="hidden"
                                  name="nextState"
                                  value={workflow.active ? "deactivate" : "activate"}
                                />
                                <input
                                  type="hidden"
                                  name="returnTo"
                                  value="/workflows"
                                />
                                <ActionButton
                                  label={workflow.active ? "Pause" : "Publish"}
                                  pendingLabel={
                                    workflow.active ? "Pausing..." : "Publishing..."
                                  }
                                  variant={workflow.active ? "secondary" : "primary"}
                                />
                              </form>
                            )}
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
      ) : null}
    </>
  );
}
