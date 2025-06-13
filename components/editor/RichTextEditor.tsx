"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export interface RichTextEditorProps {
  slug: string;
}

export default function RichTextEditor({ slug }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  useEffect(() => {
    if (!editor) return;
    fetch(`/api/pages/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) editor.commands.setContent(data.content);
      });
  }, [editor, slug]);

  const saveContent = async () => {
    if (!editor) return;
    const content = editor.getHTML();
    await fetch(`/api/pages/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  };

  return (
    <div className="space-y-2">
      <EditorContent editor={editor} className="border p-4 rounded-md" />
      <button onClick={saveContent} className="px-3 py-1 bg-blue-600 text-white rounded-md">
        Salvar
      </button>
    </div>
  );
}
