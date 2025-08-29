import React from "react";
import { auth } from "@/lib/auth";
import AdminCategories from "@/app/_components/admin/AdminCategories";

const AdminCategoriesPage = async () => {
  // Middleware restricts /admin to admins; derive session for SSR context
  await auth();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Manage Categories</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and remove story categories.</p>
        </div>
        <AdminCategories />
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
