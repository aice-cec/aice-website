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
  issue_ticket?: boolean;
  created_at?: string;
  // Payment settings
  free_for_members?: boolean;
  require_payment?: boolean;
  amount_members?: number;
  amount_non_members?: number;
  upi_id?: string;
  upi_name?: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  event_id?: string | null;
  responses: Record<string, any>;
  ticket_code?: string;
  created_at?: string;
  // Payment tracking
  payment_status?: "PENDING" | "APPROVED" | "REJECTED" | null;
  payment_amount?: number | null;
  payment_transaction_id?: string | null;
  payment_screenshot_url?: string | null;
  is_member?: boolean;
  membership_id_used?: string | null;
  payment_reviewed_at?: string | null;
  payment_reviewed_by?: string | null;
  payment_rejection_reason?: string | null;
}

export interface FormPaymentItem {
  id: string;
  form_id: string;
  form_title: string;
  submitter_name: string;
  submitter_email: string;
  amount: number;
  transaction_id: string;
  screenshot_url?: string | null;
  is_member: boolean;
  membership_id_used?: string | null;
  payment_status: "PENDING" | "APPROVED" | "REJECTED";
  payment_rejection_reason?: string | null;
  payment_reviewed_at?: string | null;
  payment_reviewed_by?: string | null;
  created_at: string;
}

export interface MembershipItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: string;
  amount: number;
  transaction_id: string;
  screenshot_url?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason?: string | null;
  membership_id?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
}

export interface FinanceStats {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalRevenue: number;
}

