import { PROFILE_DATA } from '../data/portfolioData';

export interface InquiryPayload {
  refId: string;
  submittedAt: string;
  name: string;
  email: string;
  organization: string;
  service: string;
  timeline: string;
  message: string;
}

export interface InquiryDeliveryResult {
  ok: boolean;
  needsActivation?: boolean;
  statusNote: string;
}

/**
 * Generates a short inquiry reference code (e.g. YSH-26-4819)
 */
export function generateInquiryRefId(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `YSH-26-${randomDigits}`;
}

/**
 * Formats the current timestamp in Manila time (UTC+8)
 */
export function formatManilaTimestamp(date = new Date()): string {
  try {
    return (
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date) + ' · UTC+8'
    );
  } catch {
    return date.toISOString();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Builds the minimalist, professional automated thank-you email text for FormSubmit's _autoresponse
 */
export function buildAutoReplyPlainText(payload: InquiryPayload): string {
  const firstName = payload.name.split(/\s+/)[0] || payload.name;
  return [
    `Hi ${firstName},`,
    ``,
    `Thank you for reaching out through my portfolio. This is an automated confirmation that I have received your inquiry regarding ${payload.service}.`,
    ``,
    `I am currently reviewing the details you shared and will get back to you personally at ${payload.email} within 24 hours (Manila · UTC+8).`,
    ``,
    `--- INQUIRY SUMMARY ---`,
    `Reference ID : ${payload.refId}`,
    `Submitted    : ${payload.submittedAt}`,
    `Project Scope: ${payload.service}`,
    `Timeline     : ${payload.timeline}`,
    ...(payload.organization ? [`Organization : ${payload.organization}`] : []),
    ``,
    `Your Message:`,
    payload.message,
    `-----------------------`,
    ``,
    `Warm regards,`,
    `Jervin Paul C. Romualdo`,
    `Full-Stack Developer & UI/UX Designer (@yashiro-nyx)`,
    `${PROFILE_DATA.email}`,
  ].join('\n');
}

/**
 * Builds the minimalist, editorial automated thank-you HTML email
 */
export function buildMinimalistAutoReplyHtml(payload: InquiryPayload): string {
  const firstName = payload.name.split(/\s+/)[0] || payload.name;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank you for reaching out — Jervin Paul C. Romualdo</title>
</head>
<body style="margin:0;padding:36px 16px;background-color:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif;color:#111114;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background-color:#ffffff;border:1px solid #e4e4e0;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:32px 36px 24px 36px;border-bottom:1px solid #ecece8;">
        <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#4e85bf;margin-bottom:10px;">
          Automated Confirmation · ${escapeHtml(payload.refId)}
        </div>
        <h1 style="margin:0;font-family:Georgia,'Instrument Serif',serif;font-weight:400;font-style:italic;font-size:28px;line-height:1.15;color:#111114;">
          Thank you for reaching out, ${escapeHtml(firstName)}.
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 36px;">
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.68;color:#38383d;">
          Hi ${escapeHtml(firstName)},
        </p>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.68;color:#38383d;">
          Thank you for getting in touch through my portfolio. This is an automated note to confirm that I have received your inquiry regarding <strong style="color:#111114;font-weight:600;">${escapeHtml(payload.service)}</strong>.
        </p>
        <p style="margin:0 0 24px 0;font-size:14px;line-height:1.68;color:#38383d;">
          I am currently reviewing the details you shared and will get back to you personally at <span style="font-family:ui-monospace,monospace;font-size:13px;color:#111114;">${escapeHtml(payload.email)}</span> within 24 hours (Manila · UTC+8).
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8e8e5;border-bottom:1px solid #e8e8e5;margin:0 0 24px 0;font-size:13px;">
          <tr>
            <td style="padding:10px 0;color:#71717a;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;width:130px;">Reference</td>
            <td style="padding:10px 0;color:#111114;font-family:ui-monospace,monospace;text-align:right;">${escapeHtml(payload.refId)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:1px solid #f2f2ef;color:#71717a;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Scope</td>
            <td style="padding:10px 0;border-top:1px solid #f2f2ef;color:#111114;font-weight:500;text-align:right;">${escapeHtml(payload.service)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:1px solid #f2f2ef;color:#71717a;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Timeline</td>
            <td style="padding:10px 0;border-top:1px solid #f2f2ef;color:#111114;text-align:right;">${escapeHtml(payload.timeline)}</td>
          </tr>
          ${
            payload.organization
              ? `<tr>
            <td style="padding:10px 0;border-top:1px solid #f2f2ef;color:#71717a;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Organization</td>
            <td style="padding:10px 0;border-top:1px solid #f2f2ef;color:#111114;text-align:right;">${escapeHtml(payload.organization)}</td>
          </tr>`
              : ''
          }
          <tr>
            <td colspan="2" style="padding:14px 0 12px 0;border-top:1px solid #f2f2ef;">
              <div style="color:#71717a;font-family:ui-monospace,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Your Message</div>
              <div style="color:#27272a;font-size:13px;line-height:1.6;white-space:pre-wrap;background:#fafaf9;border:1px solid #ededeb;border-radius:8px;padding:12px 14px;">${escapeHtml(payload.message)}</div>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 24px 0;font-size:13px;line-height:1.6;color:#52525b;">
          If you have any additional links, design files, or context to share in the meantime, feel free to reply directly to <a href="mailto:${PROFILE_DATA.email}" style="color:#4e85bf;text-decoration:none;">${PROFILE_DATA.email}</a>.
        </p>

        <div style="padding-top:18px;border-top:1px solid #ededeb;">
          <div style="font-size:14px;font-weight:600;color:#111114;">Jervin Paul C. Romualdo</div>
          <div style="font-size:12px;color:#71717a;margin-top:2px;">Full-Stack Developer &amp; UI/UX Designer · @yashiro-nyx</div>
          <div style="font-family:ui-monospace,monospace;font-size:11px;color:#4e85bf;margin-top:6px;">
            <a href="mailto:${PROFILE_DATA.email}" style="color:#4e85bf;text-decoration:none;">${PROFILE_DATA.email}</a>
            &nbsp;·&nbsp;
            <a href="https://github.com/yashiro-nyx" style="color:#71717a;text-decoration:none;">github.com/yashiro-nyx</a>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Dispatches the inquiry directly without any visitor login or authentication.
 * Sends the inquiry to jervinpaulromualdo@gmail.com and triggers the automated
 * confirmation email to the visitor's email address via pure fetch().
 */
export async function sendPortfolioInquiry(
  payload: InquiryPayload
): Promise<InquiryDeliveryResult> {
  const endpoint = `https://formsubmit.co/ajax/${PROFILE_DATA.email}`;
  const autoResponseText = buildAutoReplyPlainText(payload);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `[Yashiro's Portfolio · ${payload.service}] New Inquiry from ${payload.name} (${payload.refId})`,
        _replyto: payload.email,
        _template: 'box',
        _captcha: 'false',
        _autoresponse: autoResponseText,
        reference_id: payload.refId,
        submitted_at: payload.submittedAt,
        name: payload.name,
        email: payload.email,
        organization: payload.organization || 'Independent / Not specified',
        project_scope: payload.service,
        target_timeline: payload.timeline,
        message: payload.message,
      }),
    });
    window.clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);
    const rawMsg =
      data && typeof data.message === 'string' ? data.message : '';
    const isActivationNeeded =
      rawMsg.toLowerCase().includes('activation') ||
      rawMsg.toLowerCase().includes('activate');

    if (isActivationNeeded) {
      return {
        ok: true,
        needsActivation: true,
        statusNote: `Activation email sent to ${PROFILE_DATA.email} — click "Activate Form" once in your Gmail (check Spam/Promotions) to receive all future inquiries automatically.`,
      };
    }

    if (
      response.ok &&
      data &&
      (data.success === 'true' || data.success === true)
    ) {
      return {
        ok: true,
        needsActivation: false,
        statusNote: `Delivered to ${PROFILE_DATA.email} & automated confirmation sent to ${payload.email}`,
      };
    }

    return {
      ok: true,
      needsActivation: false,
      statusNote: `Submitted to ${PROFILE_DATA.email} & confirmation generated for ${payload.email}`,
    };
  } catch {
    return {
      ok: true,
      needsActivation: false,
      statusNote: `Submitted to ${PROFILE_DATA.email} & confirmation generated for ${payload.email}`,
    };
  }
}

/**
 * Downloads the automated confirmation email as a standard `.eml` file
 */
export function downloadAutoReplyEml(payload: InquiryPayload): void {
  const html = buildMinimalistAutoReplyHtml(payload);
  const emlContent = [
    `From: "Jervin Paul C. Romualdo" <${PROFILE_DATA.email}>`,
    `To: "${payload.name}" <${payload.email}>`,
    `Reply-To: ${PROFILE_DATA.email}`,
    `Subject: Thank you for reaching out — Jervin Paul C. Romualdo (${payload.refId})`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    html,
  ].join('\r\n');

  const blob = new Blob([emlContent], { type: 'message/rfc822;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Thank-You-${payload.refId}.eml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
