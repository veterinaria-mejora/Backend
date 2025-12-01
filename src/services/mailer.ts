import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM
} = process.env as Record<string, string>;

let transporter: nodemailer.Transporter;

export function getMailer() {
  if (transporter) return transporter;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  } else {
    transporter = {
      sendMail: async (opts: any) => {
        console.log("=== SIMULATED EMAIL ===");
        console.log("to:", opts.to);
        console.log("subject:", opts.subject);
        console.log("text:", opts.text);
        console.log("html:", opts.html);
        console.log("=======================");
        return { messageId: "simulated" } as any;
      },
      verify: async () => true
    } as any;
  }
  return transporter;
}

export async function sendPasswordResetEmail(to: string, tokenReset:string ,resetUrl: string) {
	const mailer = getMailer();
	const from = MAIL_FROM || SMTP_USER || "no-reply@example.com";
	const subject = "Restablecer contrasena";
	const html = `
		<p>Para restablecer su contraseña utilice el siguiente enlace (válido por 1 hora):</p>
		<p><a href="${resetUrl}">${resetUrl}</a></p>

		<p>Su token es:</p>
		<p><strong>${tokenReset}</strong></p>

		<p>Si usted no solicitó este restablecimiento, simplemente ignore este correo.</p>
	`;
		const text = `Enlace: ${resetUrl}`;
	try {
		const info = await mailer.sendMail({ from, to, subject, text, html });
		console.log("smtp sent:", { messageId: info?.messageId, to });
		return true;
	} catch (e: any) {
		console.error("smtp send error:", e?.message || e);
		return false;
	}
}
