import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  Ticket,
  MessageSquare,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { useSelector } from "react-redux";
import { getUserCookie } from "../../utils/cookies.js";

export default function QuickActions() {
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();

  const baseActions = [
    { to: "/profile", label: "Edit Profile", icon: User },
    { to: "/academy", label: "View Tickets", icon: Ticket },
    { to: "/reviews", label: "Manage Reviews", icon: MessageSquare },
    { to: "/merch", label: "Open Shop", icon: ShoppingBag },
  ];

  // Add blog management based on role
  const blogAction =
    user?.role === "admin"
      ? { to: "/admin/blogs", label: "Manage Blogs", icon: FileText }
      : user?.role === "operator"
      ? { to: "/operator/blogs", label: "My Blogs", icon: FileText }
      : user?.role === "User" || user?.role === "user"
      ? { to: "/blogs/my-blogs", label: "My Blogs", icon: FileText }
      : null;

  const actions = blogAction ? [...baseActions, blogAction] : baseActions;

  return (
    <div
      className="card bg-gray-900/60 border border-border"
      role="region"
      aria-label="Quick actions"
    >
      <div className="card-body grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="btn btn-secondary flex items-center justify-center gap-2"
            aria-label={a.label}
          >
            <a.icon aria-hidden="true" />
            <span className="text-sm">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
