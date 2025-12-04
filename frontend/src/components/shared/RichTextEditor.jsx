import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Custom toolbar configuration
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
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
  "indent",
  "link",
  "align",
];

function RichTextEditor({ value, onChange, placeholder = "Start typing..." }) {
  const quillRef = React.useRef(null);

  return (
    <>
      <style>{`
        .rich-text-editor .ql-container {
          font-family: inherit;
          font-size: 14px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(17, 24, 39, 0.4);
          color: white;
          min-height: 200px;
        }
        .rich-text-editor .ql-container .ql-editor {
          min-height: 200px;
          color: white;
        }
        .rich-text-editor .ql-container .ql-editor.ql-blank::before {
          color: rgba(156, 163, 175, 0.5);
          font-style: normal;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(17, 24, 39, 0.6);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: rgba(255, 255, 255, 0.7);
        }
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: rgba(255, 255, 255, 0.7);
        }
        .rich-text-editor .ql-toolbar .ql-picker-label {
          color: rgba(255, 255, 255, 0.7);
        }
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button.ql-active {
          background: rgba(255, 255, 255, 0.1);
        }
        .rich-text-editor .ql-toolbar .ql-picker-options {
          background: rgba(17, 24, 39, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }
        .rich-text-editor .ql-toolbar .ql-picker-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
      <div className="rich-text-editor">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ""}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="bg-gray-950/40 text-white"
          style={{
            minHeight: "200px",
          }}
        />
      </div>
    </>
  );
}

export default RichTextEditor;

