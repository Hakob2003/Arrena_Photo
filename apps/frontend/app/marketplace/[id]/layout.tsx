import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const name =
    id === "2" ? "Minimalist Product Studio" : "Cyberpunk Neon Portraits";
  const description =
    id === "2"
      ? "A highly detailed prompt for generating minimalist product photography."
      : "A highly detailed prompt for generating cyberpunk style portraits with neon lighting. Best used with DALL-E 3 or SDXL.";

  return {
    title: `${name} | Marketplace`,
    description,
    openGraph: {
      title: name,
      description,
      type: "website",
    },
  };
}

export default function MarketplaceItemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
