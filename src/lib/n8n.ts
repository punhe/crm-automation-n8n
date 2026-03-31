import "server-only";

import { requireUser } from "@/lib/auth";
import { getAppConfig, isN8nConfigured } from "@/lib/env";

export type N8nTag = {
  id: string;
  name: string;
};

export type N8nSharedWorkflow = {
  role?: string;
  workflowId?: string;
  projectId?: string;
  project?: {
    id?: string;
    name?: string;
    type?: string;
  };
};

export type N8nWorkflow = {
  id: string;
  name: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  isArchived?: boolean;
  versionId?: string;
  triggerCount?: number;
  tags?: N8nTag[];
  shared?: N8nSharedWorkflow[];
};

export type N8nExecutionStatus =
  | "canceled"
  | "crashed"
  | "error"
  | "new"
  | "running"
  | "success"
  | "unknown"
  | "waiting";

export type N8nExecution = {
  id: number;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt: string | null;
  workflowId: number | string;
  status: N8nExecutionStatus;
};

type CursorResponse<T> = {
  data?: T[];
  nextCursor?: string | null;
};

type ExecutionLookup = Record<string, N8nExecution | undefined>;

export type N8nWorkflowConsoleData =
  | {
      status: "ready";
      consoleUrl: string | null;
      workflows: N8nWorkflow[];
      latestExecutionByWorkflow: ExecutionLookup;
      runningWorkflowIds: string[];
      executionSignalsAvailable: boolean;
    }
  | {
      status: "unconfigured";
      consoleUrl: string | null;
      workflows: N8nWorkflow[];
      latestExecutionByWorkflow: ExecutionLookup;
      runningWorkflowIds: string[];
      executionSignalsAvailable: false;
    }
  | {
      status: "error";
      consoleUrl: string | null;
      workflows: N8nWorkflow[];
      latestExecutionByWorkflow: ExecutionLookup;
      runningWorkflowIds: string[];
      executionSignalsAvailable: false;
      errorMessage: string;
    };

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeConsoleUrl(baseUrl: string) {
  return trimTrailingSlash(baseUrl).replace(/\/api\/v1$/i, "");
}

function normalizeApiBaseUrl(baseUrl: string) {
  const consoleUrl = normalizeConsoleUrl(baseUrl);
  return `${consoleUrl}/api/v1`;
}

function getN8nConsoleUrl() {
  const { n8nBaseUrl } = getAppConfig();
  return n8nBaseUrl ? normalizeConsoleUrl(n8nBaseUrl) : null;
}

function buildN8nApiUrl(
  pathname: string,
  params?: Record<string, string | number | boolean>,
) {
  const config = getAppConfig();
  if (!config.n8nBaseUrl || !config.n8nApiKey) {
    throw new Error("n8n is not configured.");
  }

  const normalizedPath = pathname.replace(/^\/+/, "");
  const url = new URL(`${normalizeApiBaseUrl(config.n8nBaseUrl)}/${normalizedPath}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function n8nRequest<T>(
  pathname: string,
  init?: RequestInit,
  params?: Record<string, string | number | boolean>,
) {
  const config = getAppConfig();
  if (!config.n8nApiKey) {
    throw new Error("n8n is not configured.");
  }

  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  headers.set("X-N8N-API-KEY", config.n8nApiKey);

  if (typeof init?.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildN8nApiUrl(pathname, params), {
    ...init,
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    const message = (await response.text()).trim();
    throw new Error(
      `n8n request failed (${response.status} ${response.statusText})${message ? `: ${message}` : ""}`,
    );
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The n8n API could not be reached from this workspace.";
}

async function listWorkflows() {
  const workflows: N8nWorkflow[] = [];
  let cursor: string | null | undefined = undefined;

  for (let page = 0; page < 10; page += 1) {
    const payload: CursorResponse<N8nWorkflow> = await n8nRequest(
      "/workflows",
      undefined,
      {
        limit: 100,
        excludePinnedData: true,
        ...(cursor ? { cursor } : {}),
      },
    );

    workflows.push(...(payload.data ?? []));

    if (!payload.nextCursor) {
      break;
    }

    cursor = payload.nextCursor;
  }

  return workflows;
}

async function listExecutions({
  status,
  limit = 100,
}: {
  status?: N8nExecutionStatus;
  limit?: number;
} = {}) {
  const payload: CursorResponse<N8nExecution> = await n8nRequest(
    "/executions",
    undefined,
    {
      includeData: false,
      limit,
      ...(status ? { status } : {}),
    },
  );

  return payload.data ?? [];
}

function sortWorkflows(workflows: N8nWorkflow[]) {
  return workflows.slice().sort((left, right) => {
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
}

function sortExecutions(executions: N8nExecution[]) {
  return executions.slice().sort((left, right) => {
    const leftTime = Date.parse(left.startedAt || left.stoppedAt || "");
    const rightTime = Date.parse(right.startedAt || right.stoppedAt || "");

    return rightTime - leftTime;
  });
}

function buildLatestExecutionMap(
  workflows: N8nWorkflow[],
  executions: N8nExecution[],
): ExecutionLookup {
  const workflowIds = new Set(workflows.map((workflow) => workflow.id));
  const latest: ExecutionLookup = {};

  for (const execution of sortExecutions(executions)) {
    const workflowId = String(execution.workflowId);
    if (!workflowIds.has(workflowId) || latest[workflowId]) {
      continue;
    }

    latest[workflowId] = execution;
  }

  return latest;
}

export async function getWorkflowConsoleData(): Promise<N8nWorkflowConsoleData> {
  await requireUser();

  const consoleUrl = getN8nConsoleUrl();
  if (!isN8nConfigured()) {
    return {
      status: "unconfigured",
      consoleUrl,
      workflows: [],
      latestExecutionByWorkflow: {},
      runningWorkflowIds: [],
      executionSignalsAvailable: false,
    };
  }

  const [workflowsResult, recentExecutionsResult, runningExecutionsResult] =
    await Promise.allSettled([
      listWorkflows(),
      listExecutions({ limit: 100 }),
      listExecutions({ status: "running", limit: 100 }),
    ]);

  if (workflowsResult.status === "rejected") {
    return {
      status: "error",
      consoleUrl,
      workflows: [],
      latestExecutionByWorkflow: {},
      runningWorkflowIds: [],
      executionSignalsAvailable: false,
      errorMessage: getErrorMessage(workflowsResult.reason),
    };
  }

  const workflows = sortWorkflows(workflowsResult.value);
  const recentExecutions =
    recentExecutionsResult.status === "fulfilled"
      ? recentExecutionsResult.value
      : [];
  const runningExecutions =
    runningExecutionsResult.status === "fulfilled"
      ? runningExecutionsResult.value
      : [];

  return {
    status: "ready",
    consoleUrl,
    workflows,
    latestExecutionByWorkflow: buildLatestExecutionMap(workflows, recentExecutions),
    runningWorkflowIds: Array.from(
      new Set(runningExecutions.map((execution) => String(execution.workflowId))),
    ),
    executionSignalsAvailable:
      recentExecutionsResult.status === "fulfilled" &&
      runningExecutionsResult.status === "fulfilled",
  };
}

export async function activateWorkflow(workflowId: string) {
  await requireUser();

  if (!isN8nConfigured()) {
    throw new Error("n8n is not configured.");
  }

  return n8nRequest<N8nWorkflow>(`/workflows/${workflowId}/activate`, {
    method: "POST",
  });
}

export async function deactivateWorkflow(workflowId: string) {
  await requireUser();

  if (!isN8nConfigured()) {
    throw new Error("n8n is not configured.");
  }

  return n8nRequest<N8nWorkflow>(`/workflows/${workflowId}/deactivate`, {
    method: "POST",
  });
}
