"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";

import { isN8nConfigured } from "@/lib/env";
import { activateWorkflow, deactivateWorkflow } from "@/lib/n8n";
import { resendInvoiceEmail } from "@/lib/repairshopr";


const allowedWorkflowStates = new Set(["activate", "deactivate"]);

function withFlash(returnTo: string, flash: string) {
  const url = new URL(returnTo || "/", "http://localhost");
  url.searchParams.set("flash", flash);
  return `${url.pathname}${url.search}`;
}



export async function resendInvoiceEmailAction(formData: FormData) {
  await requireUser();

  const invoiceId = Number(formData.get("invoiceId"));
  const returnTo = String(formData.get("returnTo") || "/invoices");

  try {
    await resendInvoiceEmail(invoiceId);
    revalidatePath("/");
    revalidatePath("/invoices");
    revalidatePath("/recovery");
    redirect(withFlash(returnTo, "invoice-resent"));
  } catch {
    redirect(withFlash(returnTo, "invoice-resend-failed"));
  }
}



export async function setWorkflowActiveAction(formData: FormData) {
  await requireUser();

  const workflowId = String(formData.get("workflowId") || "").trim();
  const nextState = String(formData.get("nextState") || "").trim();
  const returnTo = String(formData.get("returnTo") || "/workflows");

  if (!workflowId || !allowedWorkflowStates.has(nextState)) {
    redirect(withFlash(returnTo, "workflow-action-failed"));
  }

  if (!isN8nConfigured()) {
    redirect(withFlash(returnTo, "n8n-config-missing"));
  }

  try {
    if (nextState === "activate") {
      await activateWorkflow(workflowId);
      revalidatePath("/workflows");
      redirect(withFlash(returnTo, "workflow-activated"));
    }

    await deactivateWorkflow(workflowId);
    revalidatePath("/workflows");
    redirect(withFlash(returnTo, "workflow-deactivated"));
  } catch {
    redirect(withFlash(returnTo, "workflow-action-failed"));
  }
}
