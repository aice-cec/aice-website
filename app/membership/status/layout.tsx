import { Suspense, ReactNode } from "react";

export const metadata = {
  title: "Membership Status | AICE CEC",
  description: "AICE membership activation status.",
};

export default function MembershipStatusLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
