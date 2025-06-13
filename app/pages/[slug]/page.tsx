import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <RichTextEditor slug={params.slug} />
    </div>
  );
}
