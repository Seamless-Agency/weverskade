import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export const runtime = "nodejs";

type FormType = "contact" | "wonen_bij" | "gebouw_wonen";

type IncomingSubmission = {
  formType?: FormType;
  sourceLabel?: string;
  name?: string;
  email?: string;
  phone?: string;
  interestedProject?: string;
  message?: string;
  agreed?: boolean;
  projectName?: string;
  projectSlug?: string;
  pageUrl?: string;
};

const FORM_TYPES = new Set<FormType>(["contact", "wonen_bij", "gebouw_wonen"]);
const EMAIL_TO = process.env.FORM_EMAIL_TO ?? "info@weverskade.com";
const EMAIL_FROM =
  process.env.FORM_EMAIL_FROM ?? "Weverskade <info@weverskade.com>";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function row(label: string, value: string | boolean | undefined) {
  if (value === undefined || value === "") return "";

  return `
    <tr>
      <td style="padding:8px 16px 8px 0;color:#666;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#181915;white-space:pre-wrap;">${escapeHtml(String(value))}</td>
    </tr>
  `;
}

function plainLine(label: string, value: string | boolean | undefined) {
  if (value === undefined || value === "") return "";
  return `${label}: ${value}\n`;
}

function buildEmail(submission: Required<Pick<IncomingSubmission, "formType" | "sourceLabel" | "name" | "email">> & IncomingSubmission) {
  const subject = `Nieuwe formulierinzending: ${submission.sourceLabel}`;
  const fields = {
    Formulier: submission.sourceLabel,
    Naam: submission.name,
    Emailadres: submission.email,
    Telefoonnummer: submission.phone,
    "Interesse in project": submission.interestedProject,
    Project: submission.projectName,
    "Project slug": submission.projectSlug,
    Bericht: submission.message,
    Akkoord: submission.agreed ? "Ja" : "Nee",
    Pagina: submission.pageUrl,
  };

  const htmlRows = Object.entries(fields)
    .map(([label, value]) => row(label, value))
    .join("");
  const text = Object.entries(fields)
    .map(([label, value]) => plainLine(label, value))
    .join("");

  return {
    subject,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#181915;">
        <h1 style="font-size:22px;line-height:1.2;margin:0 0 20px;">Nieuwe formulierinzending</h1>
        <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${htmlRows}
        </table>
      </div>
    `,
  };
}

async function sendEmail(submission: Required<Pick<IncomingSubmission, "formType" | "sourceLabel" | "name" | "email">> & IncomingSubmission) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is niet ingesteld.");
  }

  const email = buildEmail(submission);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [EMAIL_TO],
      reply_to: submission.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message ?? "Resend kon de email niet versturen.");
  }

  return result?.id as string | undefined;
}

type AutoReplySettings = {
  autoReplyEnabled?: boolean;
  autoReplySubject?: string;
  autoReplyBody?: string;
};

function bodyToHtmlParagraphs(body: string) {
  return body
    .trim()
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;">${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`
    )
    .join("");
}

// Auto-reply (bevestigingsmail) naar de inzender. Tekst komt uit het CMS
// (wonenBijPage). Best-effort: een fout hier mag de inzending niet laten falen.
async function sendAutoReply(recipientEmail: string, settings: AutoReplySettings | null) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || !settings || settings.autoReplyEnabled === false) {
    return undefined;
  }

  const subject = clean(settings.autoReplySubject);
  const body = clean(settings.autoReplyBody);

  if (!subject || !body) {
    return undefined;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [recipientEmail],
      reply_to: EMAIL_TO,
      subject,
      text: body,
      html: `
      <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#181915;">
        ${bodyToHtmlParagraphs(body)}
      </div>
    `,
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ?? "Resend kon de bevestigingsmail niet versturen."
    );
  }

  return result?.id as string | undefined;
}

export async function POST(request: Request) {
  try {
    if (!projectId || !dataset) {
      console.error("Form submission missing Sanity project configuration");
      return NextResponse.json(
        { error: "Het formulier kon niet worden verstuurd." },
        { status: 500 }
      );
    }

    const token =
      process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_WRITE_TOKEN;

    if (!token) {
      console.error("Form submission missing SANITY_API_WRITE_TOKEN");
      return NextResponse.json(
        { error: "Het formulier kon niet worden verstuurd." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as IncomingSubmission;
    const formType = body.formType;
    const sourceLabel = clean(body.sourceLabel);
    const name = clean(body.name);
    const email = clean(body.email);
    const phone = clean(body.phone);
    const interestedProject = clean(body.interestedProject);
    const message = clean(body.message);
    const projectName = clean(body.projectName);
    const projectSlug = clean(body.projectSlug);
    const pageUrl = clean(body.pageUrl);
    const agreed = Boolean(body.agreed);

    if (!formType || !FORM_TYPES.has(formType)) {
      return NextResponse.json({ error: "Ongeldig formulier." }, { status: 400 });
    }

    if (!sourceLabel || !name || !email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Vul minimaal naam en een geldig emailadres in." },
        { status: 400 }
      );
    }

    if ((formType === "wonen_bij" || formType === "gebouw_wonen") && !agreed) {
      return NextResponse.json(
        { error: "Ga akkoord met de voorwaarden om het formulier te versturen." },
        { status: 400 }
      );
    }

    const submittedAt = new Date().toISOString();
    const submission = {
      formType,
      sourceLabel,
      name,
      email,
      phone,
      interestedProject,
      message,
      agreed,
      projectName,
      projectSlug,
      pageUrl,
    };

    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    });

    const created = await client.create({
      _type: "formSubmission",
      submittedAt,
      status: "new",
      ...submission,
    });

    const resendEmailId = await sendEmail(submission);

    if (resendEmailId) {
      await client.patch(created._id).set({ resendEmailId }).commit();
    }

    // Stuur de inzender een automatische bevestiging (alleen "wonen bij").
    if (formType === "wonen_bij") {
      try {
        const autoReplySettings = await client.fetch<AutoReplySettings | null>(
          `*[_type == "wonenBijPage"][0]{ autoReplyEnabled, autoReplySubject, autoReplyBody }`
        );
        const autoReplyId = await sendAutoReply(email, autoReplySettings);
        if (autoReplyId) {
          console.log(`Auto-reply verstuurd voor ${created._id}: ${autoReplyId}`);
        }
      } catch (autoReplyError) {
        // Inzending is opgeslagen en de melding is verstuurd; een mislukte
        // bevestigingsmail mag de gebruiker geen foutmelding geven.
        console.error("Auto-reply (bevestigingsmail) mislukt", autoReplyError);
      }
    }

    return NextResponse.json({
      ok: true,
      submissionId: created._id,
      emailId: resendEmailId,
    });
  } catch (error) {
    console.error("Form submission failed", error);

    return NextResponse.json(
      { error: "Het formulier kon niet worden verstuurd." },
      { status: 500 }
    );
  }
}
