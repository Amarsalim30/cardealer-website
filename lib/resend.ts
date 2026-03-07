import { Resend } from "resend";

import { siteConfig } from "@/lib/config/site";
import { env, hasResendConfig } from "@/lib/env";

type NotificationPayload = {
  subject: string;
  lines: string[];
};

export async function sendNotificationEmail({
  subject,
  lines,
}: NotificationPayload) {
  if (!hasResendConfig) {
    return { sent: false };
  }

  const resend = new Resend(env.resendApiKey);

  await resend.emails.send({
    from: `${siteConfig.name} <onboarding@resend.dev>`,
    to: [env.adminNotificationEmail],
    subject,
    text: lines.join("\n"),
  });

  return { sent: true };
}
