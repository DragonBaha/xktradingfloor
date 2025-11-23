import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function BlogEditor({
  value,
  onChange,
  placeholder = "Write your blog content here...",
}) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link"],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "align",
  ];

  return (
    <div className="blog-editor">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-gray-900 text-white"
        style={{
          height: "400px",
          marginBottom: "50px",
        }}
      />
      <style jsx global>{`
        .blog-editor .ql-container {
          height: calc(100% - 42px);
          background: #111827;
          color: #f3f4f6;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .blog-editor .ql-editor {
          min-height: 350px;
          color: #f3f4f6;
        }
        .blog-editor .ql-toolbar {
          background: #1f2937;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-bottom: 1px solid #374151;
        }
        .blog-editor .ql-toolbar .ql-stroke {
          stroke: #9ca3af;
        }
        .blog-editor .ql-toolbar .ql-fill {
          fill: #9ca3af;
        }
        .blog-editor .ql-toolbar .ql-picker-label {
          color: #9ca3af;
        }
        .blog-editor .ql-toolbar button:hover,
        .blog-editor .ql-toolbar button.ql-active {
          color: #3b82f6;
        }
        .blog-editor .ql-toolbar button:hover .ql-stroke,
        .blog-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6;
        }
        .blog-editor .ql-toolbar button:hover .ql-fill,
        .blog-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6;
        }
      `}</style>
    </div>
  );
}
