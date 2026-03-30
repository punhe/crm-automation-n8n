import "server-only";

import nodemailer from "nodemailer";

import { getAppConfig, isMailConfigured } from "@/lib/env";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendMail(payload: MailPayload) {
  if (!isMailConfigured()) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM.");
  }

  const config = getAppConfig();

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  await transporter.sendMail({
    from: config.smtpFrom,
    ...payload,
  });
}
