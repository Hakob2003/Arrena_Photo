import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | AI Template Studio",
  description: "Explore the latest AI generated templates and creations.",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
