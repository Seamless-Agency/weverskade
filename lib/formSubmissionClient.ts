export type FormSubmissionPayload = {
  formType: "contact" | "wonen_bij" | "gebouw_wonen";
  sourceLabel: string;
  name: string;
  email: string;
  phone?: string;
  interestedProject?: string;
  message?: string;
  agreed?: boolean;
  projectName?: string;
  projectSlug?: string;
  pageUrl?: string;
};

export async function submitFormSubmission(payload: FormSubmissionPayload) {
  const response = await fetch("/api/form-submissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.error ?? "Het formulier kon niet worden verstuurd."
    );
  }

  return result as { ok: true; submissionId: string; emailId?: string };
}
