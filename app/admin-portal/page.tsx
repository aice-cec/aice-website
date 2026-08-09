"use client";

import { useEffect, useState, useCallback } from "react";
import {
  EventItem,
  RedirectItem,
  CustomFormItem,
  FormField,
  FormSubmission,
} from "./types";

import { LoginModal } from "./components/LoginModal";
import { AdminHeader } from "./components/AdminHeader";
import { EventsSection } from "./components/EventsSection";
import { RedirectsSection } from "./components/RedirectsSection";
import { FormsSection } from "./components/FormsSection";
import { UnsavedChangesBar } from "./components/UnsavedChangesBar";
import { ConfirmModal } from "./components/ConfirmModal";
import { Toast } from "./components/Toast";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];
export default function AdminPortalPage() {
  const [activeSection, setActiveSection] = useState<"events" | "redirects" | "forms">("events");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Events State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"upcoming" | "past">("upcoming");
  const [savedSnapshot, setSavedSnapshot] = useState<string>("");

  // Redirects State
  const [redirects, setRedirects] = useState<RedirectItem[]>([]);
  const [selectedRedirectId, setSelectedRedirectId] = useState<string | null>(null);
  const [savedRedirectsSnapshot, setSavedRedirectsSnapshot] = useState<string>("");
  const [redirectSearch, setRedirectSearch] = useState<string>("");

  // Custom Forms State
  const [customForms, setCustomForms] = useState<CustomFormItem[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [savedFormsSnapshot, setSavedFormsSnapshot] = useState<string>("");
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Form state for selected event
  const [form, setForm] = useState<EventItem>({
    id: "",
    dateISO: "",
    date: "",
    month: "",
    title: "",
    type: "",
    label: "",
    time: "",
    place: "",
    description: "",
    stat: "",
    featured: false,
    isPast: false,
    registrationLink: "",
    registrationDeadline: "",
  });

  // Form state for selected redirect
  const [redirectForm, setRedirectForm] = useState<RedirectItem>({
    id: "",
    url_name: "",
    target_url: "",
    description: "",
  });

  // Form state for selected custom form builder
  const [customFormBuilder, setCustomFormBuilder] = useState<CustomFormItem>({
    id: "",
    slug: "",
    event_id: "",
    title: "",
    description: "",
    fields: [],
    is_active: true,
    issue_ticket: true,
  });

  // Modal / Toast state
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });

  const showToast = (text: string, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  // Check auth on mount
  useEffect(() => {
    fetch("/api/admin/login")
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Fetch initial events
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
        setSavedSnapshot(JSON.stringify(data));
        setSelectedEventId(data[0].id);
        setForm(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  }, []);

  // Fetch initial redirects
  const fetchRedirects = useCallback(async () => {
    try {
      const res = await fetch("/api/redirects");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRedirects(data);
        setSavedRedirectsSnapshot(JSON.stringify(data));
        setSelectedRedirectId(data[0].id);
        setRedirectForm(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch redirects:", err);
    }
  }, []);

  // Fetch initial custom forms
  const fetchCustomForms = useCallback(async () => {
    try {
      const res = await fetch("/api/forms");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCustomForms(data);
        setSavedFormsSnapshot(JSON.stringify(data));
        setSelectedFormId(data[0].id);
        setCustomFormBuilder(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch custom forms:", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchRedirects();
    fetchCustomForms();
  }, [fetchEvents, fetchRedirects, fetchCustomForms]);

  // Fetch form responses when selecting a custom form
  const fetchSubmissions = useCallback(async () => {
    if (activeSection === "forms" && selectedFormId) {
      setLoadingSubmissions(true);
      try {
        const res = await fetch(`/api/forms/responses?form_id=${encodeURIComponent(selectedFormId)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setFormSubmissions(data);
        } else {
          setFormSubmissions([]);
        }
      } catch (err) {
        setFormSubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }
    }
  }, [activeSection, selectedFormId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Selection Handlers
  const selectEvent = (ev: EventItem) => {
    setSelectedEventId(ev.id);
    setForm(ev);
  };

  const selectRedirect = (r: RedirectItem) => {
    setSelectedRedirectId(r.id);
    setRedirectForm(r);
  };

  const selectCustomForm = (cf: CustomFormItem) => {
    setSelectedFormId(cf.id);
    setCustomFormBuilder(cf);
  };

  // Change Handlers
  const handleInputChange = (field: keyof EventItem, value: any) => {
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [field]: value };
      if (field === "dateISO" && typeof value === "string" && value) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          updatedForm.date = String(d.getDate()).padStart(2, "0");
          updatedForm.month = MONTHS[d.getMonth()];
        }
      }
      if (field === "type") {
        updatedForm.label = value;
      }
      setEvents((prevEvents) =>
        prevEvents.map((e) => (e.id === updatedForm.id ? updatedForm : e))
      );
      return updatedForm;
    });
  };

  const handleRedirectInputChange = (field: keyof RedirectItem, value: string) => {
    let formattedValue = value;
    if (field === "url_name") {
      formattedValue = value
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "")
        .replace(/\s+/g, "-");
    }
    const updated = { ...redirectForm, [field]: formattedValue };
    setRedirectForm(updated);
    setRedirects((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleCustomFormInputChange = (field: keyof CustomFormItem, value: any) => {
    const updated = { ...customFormBuilder, [field]: value };

    if (field === "title" && typeof value === "string") {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      updated.slug = autoSlug;
    }

    setCustomFormBuilder(updated);
    setCustomForms((prev) => {
      const exists = prev.some((f) => f.id === updated.id);
      if (exists) {
        return prev.map((f) => (f.id === updated.id ? updated : f));
      }
      return [updated, ...prev];
    });
  };

  // Custom Form Questions Field Handlers
  const handleAddField = () => {
    const newFieldId = `field_${Date.now()}`;
    const newField: FormField = {
      id: newFieldId,
      label: "Question Label",
      type: "text",
      placeholder: "",
      required: true,
      options: ["Option 1", "Option 2"],
    };

    const updatedFields = [...customFormBuilder.fields, newField];
    handleCustomFormInputChange("fields", updatedFields);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = customFormBuilder.fields.map((f) =>
      f.id === fieldId ? { ...f, ...updates } : f
    );
    handleCustomFormInputChange("fields", updatedFields);
  };

  const handleRemoveField = (fieldId: string) => {
    const updatedFields = customFormBuilder.fields.filter((f) => f.id !== fieldId);
    handleCustomFormInputChange("fields", updatedFields);
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const fields = [...customFormBuilder.fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const temp = fields[index];
    fields[index] = fields[targetIndex];
    fields[targetIndex] = temp;
    handleCustomFormInputChange("fields", fields);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setIsAuthenticated(false);
    showToast("Logged out");
  };

  // Create New Items
  const handleCreateNewEvent = () => {
    const newId = "event-" + Date.now();
    const d = new Date();
    const todayISO = d.toISOString().split("T")[0];

    const newEv: EventItem = {
      id: newId,
      dateISO: todayISO,
      date: String(d.getDate()).padStart(2, "0"),
      month: MONTHS[d.getMonth()],
      title: "NEW EVENT",
      type: "Workshop",
      label: "Workshop",
      time: "4:00 PM — 5:00 PM",
      place: "SDPK ROOM",
      description: "Description of the new event.",
      featured: false,
      isPast: false,
      registrationLink: "",
      registrationDeadline: "",
    };

    const updated = [newEv, ...events];
    setEvents(updated);
    if (newEv.isPast) setCurrentTab("past");
    else setCurrentTab("upcoming");
    selectEvent(newEv);
    showToast("New event created!");
  };

  const handleCreateNewRedirect = () => {
    const newId = "redirect-" + Date.now();

    const newRed: RedirectItem = {
      id: newId,
      url_name: "new-shortlink",
      target_url: "https://aice.ceconline.edu",
      description: "Custom redirect link",
    };

    const updated = [newRed, ...redirects];
    setRedirects(updated);
    selectRedirect(newRed);
    showToast("New redirect shortlink created!");
  };

  const handleCreateNewCustomForm = () => {
    const newId = "form-" + Date.now();
    const defaultFields: FormField[] = [
      { id: "f1", label: "Full Name", type: "text", required: true },
      { id: "f2", label: "Email Address", type: "email", required: true },
      { id: "f3", label: "Phone / WhatsApp Number", type: "phone", required: true },
      { id: "f4", label: "College Department / Branch", type: "text", required: true },
    ];

    const newForm: CustomFormItem = {
      id: newId,
      slug: "aice-event-reg",
      title: "NEW REGISTRATION FORM",
      description: "Fill out the registration details below.",
      fields: defaultFields,
      is_active: true,
      issue_ticket: true,
    };

    const updated = [newForm, ...customForms];
    setCustomForms(updated);
    selectCustomForm(newForm);
    showToast("New custom registration form created!");
  };

  // Delete Items
  const handleDeleteCurrentEvent = () => {
    if (!selectedEventId) return;

    setConfirmModal({
      show: true,
      title: "Delete Event",
      message: `Are you sure you want to delete "${form.title || "this event"}"?`,
      onConfirm: () => {
        const remaining = events.filter((e) => e.id !== selectedEventId);
        setEvents(remaining);
        if (remaining.length > 0) {
          selectEvent(remaining[0]);
        } else {
          setSelectedEventId(null);
        }
        showToast("Event deleted!");
      },
    });
  };

  const handleDeleteCurrentRedirect = () => {
    if (!selectedRedirectId) return;

    setConfirmModal({
      show: true,
      title: "Delete Redirect Shortlink",
      message: `Are you sure you want to delete shortlink "/${redirectForm.url_name}"?`,
      onConfirm: () => {
        const remaining = redirects.filter((r) => r.id !== selectedRedirectId);
        setRedirects(remaining);
        if (remaining.length > 0) {
          selectRedirect(remaining[0]);
        } else {
          setSelectedRedirectId(null);
        }
        showToast("Redirect deleted!");
      },
    });
  };

  const handleDeleteCurrentCustomForm = () => {
    if (!selectedFormId) return;

    setConfirmModal({
      show: true,
      title: "Delete Registration Form",
      message: `Are you sure you want to delete form "${customFormBuilder.title}"?`,
      onConfirm: () => {
        const remaining = customForms.filter((f) => f.id !== selectedFormId);
        setCustomForms(remaining);
        if (remaining.length > 0) {
          selectCustomForm(remaining[0]);
        } else {
          setSelectedFormId(null);
        }
        showToast("Form deleted!");
      },
    });
  };

  // Discard Changes
  const handleDiscardChanges = () => {
    if (activeSection === "events" && savedSnapshot) {
      const restored: EventItem[] = JSON.parse(savedSnapshot);
      setEvents(restored);
      if (selectedEventId && restored.some((e) => e.id === selectedEventId)) {
        const match = restored.find((e) => e.id === selectedEventId)!;
        setForm(match);
      } else if (restored.length > 0) {
        selectEvent(restored[0]);
      }
      showToast("Event changes discarded");
    } else if (activeSection === "redirects" && savedRedirectsSnapshot) {
      const restored: RedirectItem[] = JSON.parse(savedRedirectsSnapshot);
      setRedirects(restored);
      if (selectedRedirectId && restored.some((r) => r.id === selectedRedirectId)) {
        const match = restored.find((r) => r.id === selectedRedirectId)!;
        setRedirectForm(match);
      } else if (restored.length > 0) {
        selectRedirect(restored[0]);
      }
      showToast("Redirect changes discarded");
    } else if (activeSection === "forms" && savedFormsSnapshot) {
      const restored: CustomFormItem[] = JSON.parse(savedFormsSnapshot);
      setCustomForms(restored);
      if (selectedFormId && restored.some((f) => f.id === selectedFormId)) {
        const match = restored.find((f) => f.id === selectedFormId)!;
        setCustomFormBuilder(match);
      } else if (restored.length > 0) {
        selectCustomForm(restored[0]);
      }
      showToast("Form changes discarded");
    }
  };

  // Publish / Save Changes to Backend API
  const handlePublishChanges = async () => {
    try {
      if (activeSection === "events") {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(events),
        });

        if (res.status === 401) {
          setIsAuthenticated(false);
          showToast("Session expired. Please log in again.", true);
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save events");

        setSavedSnapshot(JSON.stringify(events));
        showToast("Successfully saved all event changes!");
      } else if (activeSection === "redirects") {
        const res = await fetch("/api/redirects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(redirects),
        });

        if (res.status === 401) {
          setIsAuthenticated(false);
          showToast("Session expired. Please log in again.", true);
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save redirects");

        setSavedRedirectsSnapshot(JSON.stringify(redirects));
        showToast("Successfully saved all redirect URLs!");
      } else if (activeSection === "forms") {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customForms),
        });

        if (res.status === 401) {
          setIsAuthenticated(false);
          showToast("Session expired. Please log in again.", true);
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save forms");

        setSavedFormsSnapshot(JSON.stringify(customForms));
        showToast("Successfully saved all registration forms!");
      }
    } catch (err: any) {
      showToast("Save Error: " + err.message, true);
    }
  };

  // Export JSON File
  const handleExportJSON = () => {
    let dataToExport: any = events;
    let filename = "events.json";

    if (activeSection === "redirects") {
      dataToExport = redirects;
      filename = "redirects.json";
    } else if (activeSection === "forms") {
      dataToExport = customForms;
      filename = "forms.json";
    }

    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${filename} exported!`);
  };

  // Export Form Responses to CSV
  const handleExportResponsesCSV = () => {
    if (!customFormBuilder || formSubmissions.length === 0) {
      showToast("No submissions available to export", true);
      return;
    }

    const fields = customFormBuilder.fields || [];
    const headers = ["Submission ID", "Submitted At", ...fields.map((f) => f.label)];

    const rows = formSubmissions.map((sub) => {
      const resp = sub.responses || {};
      const fieldValues = fields.map((f) => {
        const val = resp[f.id];
        if (Array.isArray(val)) return `"${val.join(", ")}"`;
        if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
        return `"${val || ""}"`;
      });
      return [sub.id, sub.created_at || "", ...fieldValues].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${customFormBuilder.slug}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Responses exported to CSV!");
  };

  // Import JSON File
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (Array.isArray(data)) {
          if (activeSection === "events") {
            setEvents(data);
            if (data.length > 0) selectEvent(data[0]);
            showToast("Events JSON imported successfully!");
          } else if (activeSection === "redirects") {
            setRedirects(data);
            if (data.length > 0) selectRedirect(data[0]);
            showToast("Redirects JSON imported successfully!");
          } else if (activeSection === "forms") {
            setCustomForms(data);
            if (data.length > 0) selectCustomForm(data[0]);
            showToast("Forms JSON imported successfully!");
          }
        }
      } catch (err) {
        showToast("Invalid JSON file!", true);
      }
    };
    reader.readAsText(file);
  };

  const copyFormLinkToClipboard = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://aice.ceconline.edu";
    const fullUrl = `${origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    showToast(`Copied: ${fullUrl}`);
  };

  const copyShortlinkToClipboard = (urlName: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://aice.ceconline.edu";
    const fullUrl = `${origin}/${urlName}`;
    navigator.clipboard.writeText(fullUrl);
    showToast(`Copied: ${fullUrl}`);
  };

  const isEventsDirty = JSON.stringify(events) !== savedSnapshot;
  const isRedirectsDirty = JSON.stringify(redirects) !== savedRedirectsSnapshot;
  const isFormsDirty = JSON.stringify(customForms) !== savedFormsSnapshot;
  const isDirty = isEventsDirty || isRedirectsDirty || isFormsDirty;

  const filteredEvents = events.filter((e) =>
    currentTab === "past" ? e.isPast : !e.isPast
  );

  const filteredRedirects = redirects.filter(
    (r) =>
      r.url_name.toLowerCase().includes(redirectSearch.toLowerCase()) ||
      r.target_url.toLowerCase().includes(redirectSearch.toLowerCase()) ||
      (r.description &&
        r.description.toLowerCase().includes(redirectSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 font-sans flex flex-col">
      {/* Login Modal */}
      {!isAuthenticated && (
        <LoginModal
          onLoginSuccess={() => setIsAuthenticated(true)}
          showToast={showToast}
        />
      )}

      {/* Header */}
      <AdminHeader
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleExportJSON={handleExportJSON}
        handleImportJSON={handleImportJSON}
        handlePublishChanges={handlePublishChanges}
        handleLogout={handleLogout}
      />

      {/* SECTION 1: EVENTS MANAGEMENT */}
      {activeSection === "events" && (
        <EventsSection
          events={events}
          filteredEvents={filteredEvents}
          selectedEventId={selectedEventId}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          form={form}
          selectEvent={selectEvent}
          handleCreateNewEvent={handleCreateNewEvent}
          handleDeleteCurrentEvent={handleDeleteCurrentEvent}
          handleInputChange={handleInputChange}
        />
      )}

      {/* SECTION 2: REDIRECT URLS MANAGEMENT */}
      {activeSection === "redirects" && (
        <RedirectsSection
          redirects={redirects}
          filteredRedirects={filteredRedirects}
          selectedRedirectId={selectedRedirectId}
          redirectSearch={redirectSearch}
          setRedirectSearch={setRedirectSearch}
          redirectForm={redirectForm}
          selectRedirect={selectRedirect}
          handleCreateNewRedirect={handleCreateNewRedirect}
          handleDeleteCurrentRedirect={handleDeleteCurrentRedirect}
          handleRedirectInputChange={handleRedirectInputChange}
          copyShortlinkToClipboard={copyShortlinkToClipboard}
        />
      )}

      {/* SECTION 3: CUSTOM FORMS BUILDER & RESPONSES */}
      {activeSection === "forms" && (
        <FormsSection
          customForms={customForms}
          selectedFormId={selectedFormId}
          customFormBuilder={customFormBuilder}
          events={events}
          formSubmissions={formSubmissions}
          setFormSubmissions={setFormSubmissions}
          loadingSubmissions={loadingSubmissions}
          onRefreshSubmissions={fetchSubmissions}
          selectCustomForm={selectCustomForm}
          handleCreateNewCustomForm={handleCreateNewCustomForm}
          handleDeleteCurrentCustomForm={handleDeleteCurrentCustomForm}
          handleCustomFormInputChange={handleCustomFormInputChange}
          handleAddField={handleAddField}
          handleUpdateField={handleUpdateField}
          handleRemoveField={handleRemoveField}
          handleMoveField={handleMoveField}
          handleExportResponsesCSV={handleExportResponsesCSV}
          copyFormLinkToClipboard={copyFormLinkToClipboard}
          showToast={showToast}
        />
      )}

      {/* Floating Unsaved Changes Bar */}
      {isDirty && (
        <UnsavedChangesBar
          isEventsDirty={isEventsDirty}
          isRedirectsDirty={isRedirectsDirty}
          isFormsDirty={isFormsDirty}
          handleDiscardChanges={handleDiscardChanges}
          handlePublishChanges={handlePublishChanges}
        />
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ ...confirmModal, show: false })}
      />

      {/* Toast Notification */}
      <Toast toastMsg={toastMsg} />
    </div>
  );
}
