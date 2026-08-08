import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getLocalForms } from "@/lib/forms";
import redirectsFallback from "@/data/redirects.json";
import CustomFormRender, { CustomFormItem } from "@/app/components/CustomFormRender";
import NotFound from "../404";

interface RedirectPageProps {
  params: Promise<{ url_name: string }>;
}

export default async function RedirectOrFormPage({ params }: RedirectPageProps) {
  const resolvedParams = await params;
  const rawUrlName = resolvedParams?.url_name
    ? decodeURIComponent(resolvedParams.url_name)
    : "";
  const targetSlug = rawUrlName.trim().toLowerCase();

  let matchedForm: CustomFormItem | null = null;
  let targetUrl: string | null = null;

  // 1. Check if target matches a Custom Form slug in Supabase or local fallback
  try {
    const { data: formData } = await supabase
      .from("forms")
      .select("id,slug,event_id,title,description,whatsapp_link,fields,is_active,created_at")
      .eq("slug", targetSlug)
      .single();

    if (formData) {
      matchedForm = formData as CustomFormItem;
    }
  } catch {}

  if (!matchedForm) {
    const localForms = getLocalForms();
    const fallbackForm = localForms.find(
      (f) => f.slug === targetSlug || f.id === targetSlug
    );
    if (fallbackForm) {
      matchedForm = fallbackForm as CustomFormItem;
    }
  }

  // If matched custom form, render registration form page directly
  if (matchedForm) {
    return <CustomFormRender form={matchedForm} />;
  }

  // 2. Check if target matches a Redirect URL in Supabase
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
      (item) => item.url_name.trim().toLowerCase() === targetSlug
    );
    if (fallbackMatch) {
      targetUrl = fallbackMatch.target_url;
    }
  }

  if (targetUrl) {
    let destination = targetUrl.trim();
    if (
      !destination.startsWith("http://") &&
      !destination.startsWith("https://") &&
      !destination.startsWith("/")
    ) {
      destination = `https://${destination}`;
    }
    redirect(destination);
  }

  return <NotFound />;
}
