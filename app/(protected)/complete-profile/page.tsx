"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useAuthStore } from "@/lib/stores/use-auth";
import Spinner from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, profile, setProfile, loading } = useAuthStore();
  const router = useRouter();
  // ⭐ local editable form state
  const [form, setForm] = useState({
    name: "",
    department: "",
    semester: ""
  });

  const [saving, setSaving] = useState(false);

  // ⭐ fill form when profile arrives from store
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        department: profile.department || "",
        semester: profile.semester || ""
      });
    }
  }, [profile]);

  if (loading || !user) {
    return <Spinner fullScreen text="Loading..." />;
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        department: form.department,
        semester: Number(form.semester)
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      alert("Error updating profile");
      console.log(error);
      setSaving(false);
      return;
    }

    // ⭐ update zustand store instantly
    setProfile(data);
    alert("Profile updated 🎉");
    setSaving(false);
    router.replace("/")
    
  }

  const isAdmin = user?.app_metadata?.isAdmin;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* EMAIL */}
      <div className="mb-4">
        <label className="block font-semibold">Email</label>
        <input
          value={user.email}
          disabled
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      {/* ADMIN BADGE */}
      {isAdmin && (
        <div className="mb-4 text-green-600 font-semibold">
          ⭐ Admin Account
        </div>
      )}

      <form onSubmit={updateProfile} className="space-y-4">

        {/* NAME */}
        <div>
          <label className="block font-semibold">Full Name</label>
          <input
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* DEPARTMENT */}
        <div>
          <label className="block font-semibold">Department</label>
          <select
            value={form.department}
            onChange={(e) =>
              setForm({ ...form, department: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>
        </div>

        {/* SEMESTER */}
        <div>
          <label className="block font-semibold">Semester</label>
          <select
            value={form.semester}
            onChange={(e) =>
              setForm({ ...form, semester: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Semester</option>
            {[1,2,3,4,5,6,7,8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={saving}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
