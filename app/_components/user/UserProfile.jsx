"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast, Toaster } from "react-hot-toast"; // ShadCN-compatible toast

export default function UserProfilePage({ session }) {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editableFields, setEditableFields] = useState({});
  const [saving, setSaving] = useState(false);

  const isCurrentUser = session?.user?.username === username;

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get(`/api/v1/users/username/${username}`);
        setUser(res.data);
        setEditableFields({
          name: res.data.name || "",
          email: res.data.email || "",
          photo: res.data.photo || "",
          bio: res.data.bio || "",
          dob: res.data.dob || "",
          address: res.data.address || "",
          state: res.data.state || "",
          country: res.data.country || "",
          gender: res.data.gender || "",
          mobileNumber: res.data.mobileNumber || "",
          status: res.data.status || "",
          subscription: res.data.subscription || false,
          role: res.data.role || "reader",
          accountType: res.data.accountType || "Personal",
        });
      } catch (err) {
        toast.error("Failed to load user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [username]);
  console.log(editableFields.photo);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditableFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!isCurrentUser) return;

    setSaving(true);
    try {
      const res = await axios.patch(
        `/api/v1/users/${user._id}`,
        editableFields
      );
      setUser(res.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!user) return <p className="text-center py-10">User not found</p>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Toaster position="top-right" reverseOrder={false} />
      <Card className="rounded-xs shadow-none">
        <CardHeader>
          <CardTitle>{user.name || username}'s Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <img
              src={editableFields.photo || "/default-avatar.png"}
              alt="Profile"
              className="w-24 h-24 rounded-xs object-cover border"
            />
          </div>

          {/* Username (not editable) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Username</Label>
            <Input
              value={user.username}
              disabled
              className="col-span-3 rounded-xs bg-gray-100"
            />
          </div>

          {/* Editable fields if current user */}

          <>
            {[
              "name",
              "email",
              "bio",
              "dob",
              "address",
              "state",
              "country",
              "gender",
              "mobileNumber",
              "status",
            ].map((field) => (
              <div key={field} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Label>
                {field === "bio" ? (
                  <Textarea
                    disabled={!isCurrentUser}
                    name={field}
                    value={editableFields[field]}
                    onChange={handleChange}
                    className="col-span-3 rounded-xs resize-none"
                    rows={3}
                  />
                ) : field === "dob" ? (
                  <Input
                    disabled={!isCurrentUser}
                    type="date"
                    name={field}
                    value={
                      editableFields[field]
                        ? editableFields[field].split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    className="col-span-3 rounded-xs"
                  />
                ) : (
                  <Input
                    disabled={!isCurrentUser}
                    type="text"
                    name={field}
                    value={editableFields[field]}
                    onChange={handleChange}
                    className="col-span-3 rounded-xs"
                  />
                )}
              </div>
            ))}
            <Button
              className="rounded-xs mt-4"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </>
          {!isCurrentUser && (
            <Alert className="rounded-xs">
              <AlertDescription>
                You are viewing someone else's profile. You cannot edit it.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
