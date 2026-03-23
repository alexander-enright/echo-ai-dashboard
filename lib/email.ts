import nodemailer from 'nodemailer';

// Email configuration for CEO Agent reports
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: 'alexenrightt@gmail.com',
    pass: 'itjlrfwranzxgwdc', // App password you provided
  },
};

/**
 * Send CEO Agent report via email
 * @param subject - Email subject line
 * @param htmlBody - HTML content of the email
 * @param textBody - Plain text fallback
 */
export async function sendCEOReport(
  subject: string,
  htmlBody: string,
  textBody?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    const info = await transporter.sendMail({
      from: '"OpenClaw CEO Agent" <alexenrightt@gmail.com>',
      to: 'alexenrightt@gmail.com',
      subject,
      text: textBody || htmlBody.replace(/\u003c[^\u003e]*\u003e/g, ''), // Strip HTML tags for text version
      html: htmlBody,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send build completion report
 */
export async function sendBuildReport(
  company: string,
  features: string[],
  commitHash: string
): Promise<void> {
  const html = `
    <h2>Build Complete: ${company}</h2>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Commit:</strong> ${commitHash}</p>
    <h3>Features Built:</h3>
    <ul>${features.map(f => `<li>${f}</li>`).join('')}</ul>
  `;

  await sendCEOReport(
    `Build Complete: ${company} — ${new Date().toLocaleDateString()}`,
    html
  );
}

/**
 * Send competitor intelligence report
 */
export async function sendCompetitorReport(
  intel: { company: string; updates: string[] }[]
): Promise<void> {
  const html = `
    <h2>Daily Competitor Intelligence</h2>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    ${intel.map(i => `
      <h3>${i.company}</h3>
      <ul>${i.updates.map(u => `<li>${u}</li>`).join('')}</ul>
    `).join('')}
  `;

  await sendCEOReport(
    `Competitor Intel — ${new Date().toLocaleDateString()}`,
    html
  );
}
