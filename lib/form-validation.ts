import "server-only";

export const FORM_FIELD_TYPES = [
  "text",
  "email",
  "phone",
  "number",
  "select",
  "radio",
  "checkbox",
  "file",
] as const;

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
}

export interface FormDefinition {
  id: string;
  slug: string;
  title: string;
  fields: FormFieldDefinition[];
  is_active: boolean;
  issue_ticket?: boolean;
  event_id?: string | null;
  whatsapp_link?: string | null;
}

export type FormResponses = Record<string, string | string[]>;

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_PATTERN = /^\d{10}$/;
const MAX_VALUE_LENGTH = 250;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateResponses(
  fields: FormFieldDefinition[],
  rawResponses: unknown,
): { responses: FormResponses } | { error: string } {
  if (!isRecord(rawResponses)) return { error: "Responses must be an object" };

  const fieldsById = new Map(fields.map((field) => [field.id, field]));
  for (const key of Object.keys(rawResponses)) {
    if (!fieldsById.has(key) && !key.startsWith("field_") && !key.startsWith("__")) {
      return { error: "Submission contains an unknown field" };
    }
  }

  const responses: FormResponses = {};
  // Copy over extra valid field_ keys
  for (const [key, val] of Object.entries(rawResponses)) {
    if (key.startsWith("field_") && typeof val === "string" && val.trim()) {
      responses[key] = val.trim();
    }
  }
  for (const field of fields) {
    const value = rawResponses[field.id];
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (field.required && isEmpty) return { error: `Missing required field: ${field.label}` };
    if (isEmpty) continue;

    if (field.type === "checkbox") {
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
        return { error: `Invalid value for ${field.label}` };
      }
      const choices = value.map((item) => item.trim());
      if (choices.some((item) => !item || item.length > MAX_VALUE_LENGTH)) {
        return { error: `Invalid value for ${field.label}` };
      }
      if (field.options && choices.some((item) => !field.options?.includes(item))) {
        return { error: `Invalid option for ${field.label}` };
      }
      responses[field.id] = choices;
      continue;
    }

    if (typeof value !== "string") return { error: `Invalid value for ${field.label}` };
    const trimmed = value.trim();
    if (!trimmed) continue;

    if (field.type === "file") {
      const isValidFile =
        trimmed.startsWith("data:image/") ||
        trimmed.startsWith("data:application/pdf") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://");
      if (!isValidFile || trimmed.length > 14_000_000) {
        return { error: `Invalid file format or file size too large for ${field.label}` };
      }
    } else if (trimmed.length > 5000) {
      return { error: `Value is too long for ${field.label}` };
    }

    if (field.type === "email" && !EMAIL_PATTERN.test(trimmed)) {
      return { error: `Invalid email address for ${field.label}` };
    }
    if (field.type === "phone" && !PHONE_PATTERN.test(trimmed.replace(/\D/g, ""))) {
      return { error: `Phone number must be exactly 10 digits for ${field.label}` };
    }
    if (field.type === "number" && !Number.isFinite(Number(trimmed))) {
      return { error: `Invalid number for ${field.label}` };
    }
    if (
      (field.type === "select" || field.type === "radio") &&
      field.options &&
      !field.options.includes(trimmed)
    ) {
      return { error: `Invalid option for ${field.label}` };
    }
    responses[field.id] = trimmed;
  }

  return { responses };
}
