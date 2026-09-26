import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance",
  description: "Volunteer attendance check-in portal for AICE CEC events.",
  robots: { index: false, follow: false },
};

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
