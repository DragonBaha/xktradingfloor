import React from "react";

export default function BlogStatusBadge({ status }) {
  const statusConfig = {
    draft: {
      label: "Draft",
      className: "bg-gray-500/20 text-gray-300 border-gray-500/50",
    },
    published: {
      label: "Published",
      className: "bg-green-500/20 text-green-300 border-green-500/50",
    },
    archived: {
      label: "Archived",
      className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
