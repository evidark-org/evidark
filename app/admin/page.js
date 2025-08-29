import React from "react";
import { auth } from "@/lib/auth";
import AdminCategories from "../_components/admin/AdminCategories";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, FolderPlus } from "lucide-react";

const AdminPage = async () => {
  // Middleware already restricts /admin to admins, but we still derive session for server-side
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" /> Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Welcome {session?.user?.name || "Admin"}</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/admin/categories" className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4" />
              Manage Categories
            </Link>
          </Button>
        </div>
        {/* Quick embed of categories manager here too (optional). You can remove if you prefer dedicated page only */}
        <AdminCategories />
      </div>
    </div>
  );
};

export default AdminPage;
