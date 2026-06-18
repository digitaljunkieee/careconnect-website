type BrevoConfig = {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  apiBaseUrl: string;
};

export const BREVO_TEMPLATES = {
  WELCOME_EMAIL: "WELCOME_EMAIL",
  PASSWORD_RESET: "PASSWORD_RESET",
  VERIFICATION_SUBMITTED: "VERIFICATION_SUBMITTED",
  VERIFICATION_APPROVED: "VERIFICATION_APPROVED",
  VERIFICATION_REJECTED: "VERIFICATION_REJECTED",
  APPLICATION_SUBMITTED: "APPLICATION_SUBMITTED",
  APPLICATION_ACCEPTED: "APPLICATION_ACCEPTED",
  APPLICATION_REJECTED: "APPLICATION_REJECTED"
} as const;

export type BrevoTemplateName =
  (typeof BREVO_TEMPLATES)[keyof typeof BREVO_TEMPLATES];

export type BrevoRecipient = {
  email: string;
  name?: string;
};

export type BrevoTemplateContext = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  dashboardUrl?: string;
  resetUrl?: string;
  workerDashboardUrl?: string;
  applicationUrl?: string;
  shiftUrl?: string;
  shiftTitle?: string;
  facilityName?: string;
  notes?: string;
  expiresInMinutes?: number;
};

export type BrevoSendEmailInput = {
  to: BrevoRecipient | BrevoRecipient[];
  template: BrevoTemplateName;
  context?: BrevoTemplateContext;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  tags?: string[];
  replyTo?: BrevoRecipient;
};

export type BrevoSendEmailResult = {
  messageId: string;
  template: BrevoTemplateName;
  subject: string;
};

function getBrevoConfig(): BrevoConfig {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "CareConnect";
  const apiBaseUrl = process.env.BREVO_API_BASE_URL ?? "https://api.brevo.com/v3";

  if (!apiKey) {
    throw new Error("Missing BREVO_API_KEY environment variable.");
  }

  if (!senderEmail) {
    throw new Error("Missing BREVO_SENDER_EMAIL environment variable.");
  }

  return {
    apiKey,
    senderEmail,
    senderName,
    apiBaseUrl
  };
}

function safeDisplayName(firstName?: string, lastName?: string, fallback = "there") {
  const value = [firstName, lastName].filter(Boolean).join(" ").trim();
  return value || fallback;
}

function renderTemplate(template: BrevoTemplateName, context: BrevoTemplateContext = {}) {
  const recipientName = safeDisplayName(context.firstName, context.lastName, context.fullName);

  switch (template) {
    case "WELCOME_EMAIL":
      return {
        subject: `Welcome to CareConnect, ${recipientName}`,
        textContent: [
          `Hi ${recipientName},`,
          "",
          "Welcome to CareConnect.",
          "Your account is ready and you can sign in whenever you need to manage shifts, applications, and documents.",
          context.dashboardUrl ? `Dashboard: ${context.dashboardUrl}` : ""
        ]
          .filter(Boolean)
          .join("\n"),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h1 style="margin: 0 0 16px;">Welcome to CareConnect</h1>
            <p>Hi ${recipientName},</p>
            <p>Your account is ready and you can sign in whenever you need to manage shifts, applications, and documents.</p>
            ${context.dashboardUrl ? `<p><a href="${context.dashboardUrl}">Open dashboard</a></p>` : ""}
          </div>
        `
      };
    case "PASSWORD_RESET":
      return {
        subject: "Reset your CareConnect password",
        textContent: [
          `Hi ${recipientName},`,
          "",
          "We received a request to reset your password.",
          context.resetUrl ? `Reset link: ${context.resetUrl}` : "",
          context.expiresInMinutes
            ? `This link expires in ${context.expiresInMinutes} minutes.`
            : ""
        ]
          .filter(Boolean)
          .join("\n"),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h1 style="margin: 0 0 16px;">Reset your password</h1>
            <p>Hi ${recipientName},</p>
            <p>We received a request to reset your password.</p>
            ${context.resetUrl ? `<p><a href="${context.resetUrl}">Reset password</a></p>` : ""}
            ${context.expiresInMinutes ? `<p>This link expires in ${context.expiresInMinutes} minutes.</p>` : ""}
          </div>
        `
      };
    case "VERIFICATION_SUBMITTED":
      return {
        subject: "Your verification submission is in review",
        textContent: [
          `Hi ${recipientName},`,
          "",
          "We received your verification documents and started the review process.",
          context.workerDashboardUrl ? `Track progress: ${context.workerDashboardUrl}` : ""
        ]
          .filter(Boolean)
          .join("\n"),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h1 style="margin: 0 0 16px;">Verification submitted</h1>
            <p>Hi ${recipientName},</p>
            <p>We received your verification documents and started the review process.</p>
            ${context.workerDashboardUrl ? `<p><a href="${context.workerDashboardUrl}">View status</a></p>` : ""}
          </div>
        `
      };
    case "VERIFICATION_APPROVED":
      return {
        subject: "Your verification was approved",
        textContent: [
          `Hi ${recipientName},`,
          "",
          "Your verification has been approved and your worker profile is now active.",
          context.workerDashboardUrl ? `Open your dashboard: ${context.workerDashboardUrl}` : ""
        ]
          .filter(Boolean)
          .join("\n"),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h1 style="margin: 0 0 16px;">Verification approved</h1>
            <p>Hi ${recipientName},</p>
            <p>Your verification has been approved and your worker profile is now active.</p>
            ${context.workerDashboardUrl ? `<p><a href="${context.workerDashboardUrl}">Open dashboard</a></p>` : ""}
          </div>
        `
      };
    case "VERIFICATION_REJECTED":
      return {
        subject: "Your verification needs attention",
        textContent: [
          `Hi ${recipientName},`,
          "",
          "Your verification could not be approved yet.",
          context.notes ? `Notes: ${context.notes}` : "",
          context.workerDashboardUrl ? `Review details: ${context.workerDashboardUrl}` : ""
        ]
          .filter(Boolean)
          .join("\n"),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h1 style="margin: 0 0 16px;">Verification needs attention</h1>
            <p>Hi ${recipientName},</p>
            <p>Your verification could not be approved yet.</p>
            ${context.notes ? `<p><strong>Notes:</strong> ${context.notes}</p>` : ""}
            ${context.workerDashboardUrl ? `<p><a href="${context.workerDashboardUrl}">Review details</a></p>` : ""}
          </div>
        `
      };
    case "APPLICATION_SUBMITTED":
      return {
        subject: context.shiftTitle
          ? `Application submitted for ${context.shiftTitle}`
          : "Your application was submitted",
        textContent: [
          `Hi ${recipientName},`,
          "",
          context.shiftTitle
            ? `Your application for ${context.shiftTitle} has been submitted.`
            : "Your application has been submitted.",
          context.applicationUrl ? `Track application: ${context.applicationUrl}` : ""
        ]
          .filter(Boolean)
          .join("\n"),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h1 style="margin: 0 0 16px;">Application submitted</h1>
            <p>Hi ${recipientName},</p>
            <p>${
              context.shiftTitle
                ? `Your application for <strong>${context.shiftTitle}</strong> has been submitted.`
                : "Your application has been submitted."
            }</p>
            ${context.applicationUrl ? `<p><a href="${context.applicationUrl}">Track application</a></p>` : ""}
          </div>
        `
      };
    case "APPLICATION_ACCEPTED":
      return {
        subject: context.shiftTitle
          ? `Application accepted for ${context.shiftTitle}`
          : "Your application was accepted",
        textContent: [
          `Hi ${recipientName},`,
          "",
          context.shiftTitle
            ? `Good news. Your application for ${context.shiftTitle} was accepted.`
            : "Good news. Your application was accepted.",
          context.shiftUrl ? `View shift: ${context.shiftUrl}` : ""
        ]
          .filter(Boolean)
          .join("\n"),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h1 style="margin: 0 0 16px;">Application accepted</h1>
            <p>Hi ${recipientName},</p>
            <p>${
              context.shiftTitle
                ? `Good news. Your application for <strong>${context.shiftTitle}</strong> was accepted.`
                : "Good news. Your application was accepted."
            }</p>
            ${context.shiftUrl ? `<p><a href="${context.shiftUrl}">View shift</a></p>` : ""}
          </div>
        `
      };
    case "APPLICATION_REJECTED":
      return {
        subject: context.shiftTitle
          ? `Application update for ${context.shiftTitle}`
          : "Your application was not selected",
        textContent: [
          `Hi ${recipientName},`,
          "",
          context.shiftTitle
            ? `Your application for ${context.shiftTitle} was not selected this time.`
            : "Your application was not selected this time.",
          context.notes ? `Notes: ${context.notes}` : ""
        ]
          .filter(Boolean)
          .join("\n"),
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h1 style="margin: 0 0 16px;">Application update</h1>
            <p>Hi ${recipientName},</p>
            <p>${
              context.shiftTitle
                ? `Your application for <strong>${context.shiftTitle}</strong> was not selected this time.`
                : "Your application was not selected this time."
            }</p>
            ${context.notes ? `<p><strong>Notes:</strong> ${context.notes}</p>` : ""}
          </div>
        `
      };
    default:
      return {
        subject: "CareConnect notification",
        textContent: "You have a new message from CareConnect.",
        htmlContent: "<p>You have a new message from CareConnect.</p>"
      };
  }
}

export async function sendBrevoEmail(input: BrevoSendEmailInput): Promise<BrevoSendEmailResult> {
  const config = getBrevoConfig();
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const rendered = renderTemplate(input.template, input.context);
  const subject = input.subject ?? rendered.subject;
  const htmlContent = input.htmlContent ?? rendered.htmlContent;
  const textContent = input.textContent ?? rendered.textContent;

  const response = await fetch(`${config.apiBaseUrl}/smtp/email`, {
    method: "POST",
    headers: {
      "api-key": config.apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        email: config.senderEmail,
        name: config.senderName
      },
      to: recipients.map((recipient) => ({
        email: recipient.email,
        name: recipient.name ?? recipient.email
      })),
      subject,
      htmlContent,
      textContent,
      tags: input.tags ?? [],
      replyTo: input.replyTo
        ? {
            email: input.replyTo.email,
            name: input.replyTo.name ?? input.replyTo.email
          }
        : undefined
    })
  });

  const bodyText = await response.text();

  if (!response.ok) {
    const error = new Error(
      bodyText || `Brevo email request failed with status ${response.status}.`
    );
    (error as Error & { statusCode?: number }).statusCode = 502;
    throw error;
  }

  let parsed: { messageId?: string } | null = null;
  try {
    parsed = bodyText ? (JSON.parse(bodyText) as { messageId?: string }) : null;
  } catch {
    parsed = null;
  }

  return {
    messageId: parsed?.messageId ?? "",
    template: input.template,
    subject
  };
}

export { getBrevoConfig, renderTemplate as renderBrevoTemplate };
