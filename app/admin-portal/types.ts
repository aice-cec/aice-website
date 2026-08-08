export interface EventItem {
  id: string;
  dateISO: string;
  date: string;
  month?: string;
  title: string;
  type?: string;
  label?: string;
  time?: string;
  place?: string;
  description?: string;
  stat?: string;
  featured?: boolean;
  isPast?: boolean;
  registrationLink?: string;
  registrationDeadline?: string;
}

export interface RedirectItem {
  id: string;
  url_name: string;
  target_url: string;
  description?: string;
  created_at?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "number" | "select" | "radio" | "checkbox" | "file";
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface CustomFormItem {
  id: string;
  slug: string;
  event_id?: string;
  title: string;
  description?: string;
  whatsapp_link?: string;
  fields: FormField[];
  is_active: boolean;
  created_at?: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  event_id?: string | null;
  responses: Record<string, any>;
  ticket_code?: string;
  created_at?: string;
}
