import type { Metadata } from "next";
import NotFound from "./404";

export const metadata: Metadata = {
  title: "404 - Page Not Found | AICE CEC",
  description: "The page you are looking for does not exist or has been moved.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootNotFound() {
  return <NotFound />;
}
