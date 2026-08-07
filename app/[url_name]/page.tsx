import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

  // 1. Check if target matches a Custom Form slug in Supabase
  try {
    const { data: formData } = await supabase
      .from("forms")
      .select("*")
      .eq("slug", targetSlug)
      .single();

    if (formData) {
      matchedForm = formData as CustomFormItem;
    }
  } catch (err) {
    // Form not found in Supabase, fallback to checking API/fallback
  }

  if (!matchedForm) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/forms?slug=${encodeURIComponent(targetSlug)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && data.id) {
          matchedForm = data as CustomFormItem;
        }
      }
    } catch (err) {
      // Ignore API fetch errors
    }
  }

  // If matched custom form, render registration form page directly!
  if (matchedForm) {
    return <CustomFormRender form={matchedForm} />;
  }

  // 2. Check if target matches a Redirect URL in Supabase
  try {
    const { data } = await supabase.from("redirects").select("*");

    if (data && data.length > 0) {
      const match = data.find((item: any) => {
        const name = item.url_name || item.urlname || "";
        return name.trim().toLowerCase() === targetSlug;
      });

      if (match) {
        targetUrl = match.target_url || match.targeturl || null;
      }
    }
  } catch (err) {
    console.error("Error fetching redirect from Supabase:", err);
  }

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
