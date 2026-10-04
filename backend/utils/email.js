const buildHtml = ({ heading, body, code }) => `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
    <h2 style="color: #312e81;">${heading}</h2>
    <p style="font-size: 15px; line-height: 1.6;">${body}</p>
    <div style="margin: 24px 0; padding: 16px; font-size: 28px; font-weight: 700; letter-spacing: 6px; text-align: center; background: #eef2ff; color: #4338ca; border-radius: 12px;">
      ${code}
    </div>
    <p style="font-size: 13px; color: #64748b;">If you did not request this, you can safely ignore this email.</p>
  </div>
`;

const sendWithMailtrap = async ({ to, subject, html }) => {
  const response = await fetch("https://send.api.mailtrap.io/api/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MAILTRAP_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: {
        email: process.env.EMAIL_FROM || "noreply@campusmatrix.com",
        name: "Campus Matrix",
      },
      to: [{ email: to }],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mailtrap email failed with status ${response.status}: ${errorText}`);
  }
};

const sendWithResend = async ({ to, subject, html }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Campus Matrix <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend email failed with status ${response.status}`);
  }
};

const sendWithBrevo = async ({ to, subject, html }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Campus Matrix",
        email: process.env.EMAIL_FROM || "noreply@campusmatrix.app",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo email failed with status ${response.status}`);
  }
};

export const sendOtpEmail = async ({ to, subject, heading, body, code }) => {
  const html = buildHtml({ heading, body, code });

  try {
    if (process.env.MAILTRAP_API_TOKEN) {
      return await sendWithMailtrap({ to, subject, html });
    }
    if (process.env.RESEND_API_KEY) {
      return await sendWithResend({ to, subject, html });
    }
    if (process.env.BREVO_API_KEY) {
      return await sendWithBrevo({ to, subject, html });
    }
    console.log(`[EMAIL FALLBACK] ${subject} -> ${to} :: OTP ${code}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    console.log(`[EMAIL FALLBACK] ${subject} -> ${to} :: OTP ${code}`);
  }
};
