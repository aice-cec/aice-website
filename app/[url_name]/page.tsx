import type { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getLocalForms } from "@/lib/forms";
import redirectsFallback from "@/data/redirects.json";
import CustomFormRender, {
  CustomFormItem,
} from "@/app/components/CustomFormRender";
import NotFound from "../404";

interface RedirectPageProps {
  params: Promise<{ url_name: string }>;
}

async function getFormBySlug(rawUrlName: string): Promise<CustomFormItem | null> {
  const targetSlug = (rawUrlName || "").trim().toLowerCase();
  if (!targetSlug) return null;

  // 1. Check if target matches a Custom Form slug in Supabase
  try {
    const { data: formData } = await supabase
      .from("forms")
      .select(
        "id,slug,event_id,title,description,whatsapp_link,fields,is_active,issue_ticket,created_at,free_for_members,require_payment,amount_members,amount_non_members",
      )
      .eq("slug", targetSlug)
      .single();

    if (formData) {
      const form = formData as any;
      if (Array.isArray(form.fields)) {
        const configItem = form.fields.find(
          (f: any) =>
            f &&
            (f.id === "__payment_config__" || f.type === "system_config"),
        );
        if (configItem) {
          if (!form.upi_id && configItem.upi_id) form.upi_id = configItem.upi_id;
          if (!form.upi_name && configItem.upi_name) form.upi_name = configItem.upi_name;
          form.fields = form.fields.filter(
            (f: any) =>
              f &&
              f.id !== "__payment_config__" &&
              f.type !== "system_config",
          );
        }
      }
      return form as CustomFormItem;
    }
  } catch {}

  // 2. Fallback to local forms
  const localForms = getLocalForms();
  const fallbackForm = localForms.find(
    (f) =>
      f.slug?.toLowerCase() === targetSlug ||
      f.id?.toLowerCase() === targetSlug,
  );
  if (fallbackForm) {
    return fallbackForm as CustomFormItem;
  }

  return null;
}

export async function generateMetadata(
  { params }: RedirectPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedParams = await params;
  const rawUrlName = resolvedParams?.url_name
    ? decodeURIComponent(resolvedParams.url_name)
    : "";

  const form = await getFormBySlug(rawUrlName);

  if (form) {
    const formTitle = form.title?.trim() || "Registration Form";
    const formDescription =
      form.description?.trim() ||
      `Official registration for ${formTitle} - AI Innovation Community for Excellence (AICE CEC).`;
    const formSlug = form.slug || rawUrlName;

    return {
      title: formTitle,
      description: formDescription,
      openGraph: {
        title: formTitle,
        description: formDescription,
        url: `/${formSlug}`,
        siteName: "AICE CEC",
        type: "website",
        images: [
          {
            url: "/logos/aice_logo.png",
            width: 800,
            height: 800,
            alt: `${formTitle} - AICE CEC`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: formTitle,
        description: formDescription,
        images: ["/logos/aice_logo.png"],
      },
    };
  }

  return {
    title: "AICE CEC",
  };
}

export default async function RedirectOrFormPage({
  params,
}: RedirectPageProps) {
  const resolvedParams = await params;
  const rawUrlName = resolvedParams?.url_name
    ? decodeURIComponent(resolvedParams.url_name)
    : "";
  const targetSlug = rawUrlName.trim().toLowerCase();

  // 1. Check if target matches a Custom Form
  const matchedForm = await getFormBySlug(rawUrlName);

  // If matched custom form, render registration form page directly
  if (matchedForm) {
    return <CustomFormRender form={matchedForm} />;
  }

  // 2. Check if target matches a Redirect URL in Supabase
  let targetUrl: string | null = null;
  try {
    const { data } = await supabase
      .from("redirects")
      .select("id,url_name,target_url");

    if (data?.length) {
      const match = data.find((item: any) => {
        const name = item.url_name || item.urlname || "";
        return name.trim().toLowerCase() === targetSlug;
      });

      if (match) {
        targetUrl = match.target_url || null;
      }
    }
  } catch {}

  if (!targetUrl && Array.isArray(redirectsFallback)) {
    const fallbackMatch = redirectsFallback.find(
      (item) => item.url_name.trim().toLowerCase() === targetSlug,
    );
    if (fallbackMatch) {
      targetUrl = fallbackMatch.target_url;
    }
  }

  if (targetUrl) {
    const target = targetUrl.trim();
    if (
      target.startsWith("/") &&
      !target.startsWith("//") &&
      !target.startsWith("/\\")
    ) {
      redirect(target);
    }

    let validDestinationUrl: string | null = null;
    try {
      const destination = new URL(
        target.includes("://") ? target : `https://${target}`,
      );
      if (
        destination.protocol === "http:" ||
        destination.protocol === "https:"
      ) {
        validDestinationUrl = destination.toString();
      }
    } catch {
      validDestinationUrl = null;
    }

    if (validDestinationUrl) {
      redirect(validDestinationUrl);
    }
  }

  return <NotFound />;
}
