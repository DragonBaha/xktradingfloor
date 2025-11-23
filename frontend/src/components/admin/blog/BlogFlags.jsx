import React from "react";
import { Flag, X } from "lucide-react";
import { useSelector } from "react-redux";
import { getUserCookie } from "../../../utils/cookies.js";

export default function BlogFlags({ blog, onFlag, onUnflag }) {
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();
  const isOperator = user?.role === "operator";
  const isAdmin = user?.role === "admin";

  if (!isOperator && !isAdmin) return null;

  const flags = blog.flags || [];
  const hasFlags = flags.length > 0;

  const handleFlag = (flagType) => {
    if (onFlag) {
      onFlag(blog._id, flagType);
    }
  };

  const handleUnflag = (flagType) => {
    if (onUnflag) {
      onUnflag(blog._id, flagType);
    }
  };

  return (
    <div className="space-y-2">
      {hasFlags && (
        <div className="flex flex-wrap gap-2 mb-3">
          {flags.map((flag, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 text-red-300 text-xs border border-red-500/50"
            >
              <Flag className="h-3 w-3" />
              <span className="capitalize">{flag.type}</span>
              {isAdmin && (
                <button
                  onClick={() => handleUnflag(flag.type)}
                  className="ml-1 hover:text-red-400"
                  title="Remove flag"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isOperator && (
        <div className="flex gap-2">
          <button
            onClick={() => handleFlag("inappropriate")}
            className="btn btn-secondary text-xs px-2 py-1"
            disabled={flags.some((f) => f.type === "inappropriate")}
          >
            <Flag className="h-3 w-3 mr-1" />
            Flag Inappropriate
          </button>
          <button
            onClick={() => handleFlag("suspicious")}
            className="btn btn-secondary text-xs px-2 py-1"
            disabled={flags.some((f) => f.type === "suspicious")}
          >
            <Flag className="h-3 w-3 mr-1" />
            Flag Suspicious
          </button>
        </div>
      )}
    </div>
  );
}
