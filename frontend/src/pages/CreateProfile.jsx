import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axios";
import { UploadCloud } from "lucide-react";
import { toast } from "react-toastify";

const defaultFormData = {
  department: "",
  bio: "",
  skills: "",
  interests: "",
  languages: "",
  gender: "",
  linkedin: "",
};

const CreateProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const [formData, setFormData] = useState(defaultFormData);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!isEditMode) return;

      try {
        const profileRes = await axios.get("/api/profile/me", { withCredentials: true });

        setFormData({
          department: profileRes.data.department || "",
          bio: profileRes.data.bio || "",
          skills: (profileRes.data.skills || []).join(", "),
          interests: (profileRes.data.interests || []).join(", "),
          languages: (profileRes.data.languages || []).join(", "),
          gender: profileRes.data.gender || "",
          linkedin: profileRes.data.linkedin || "",
        });
      } catch (err) {
        toast.error("Failed to load existing profile.");
      }
    };

    loadExistingProfile();
  }, [isEditMode]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileUpload = async (file) => {
    const data = new FormData();
    data.append("image", file);
    const res = await axios.post("/api/upload", data, {
      withCredentials: true,
    });
    return res.data.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let profileImageUrl = null;
      let coverImageUrl = null;

      if (profileImageFile) {
        profileImageUrl = await handleFileUpload(profileImageFile);
      }
      if (coverImageFile) {
        coverImageUrl = await handleFileUpload(coverImageFile);
      }

      const endpoint = isEditMode ? "/api/profile/edit-profile" : "/api/profile/create-profile";
      await axios[isEditMode ? "put" : "post"](
        endpoint,
        {
          ...formData,
          ...(profileImageUrl && { profileImage: profileImageUrl }),
          ...(coverImageUrl && { coverImage: coverImageUrl }),
          linkedin: formData.linkedin.trim(),
          skills: formData.skills.split(",").map((item) => item.trim()).filter(Boolean),
          interests: formData.interests.split(",").map((item) => item.trim()).filter(Boolean),
          languages: formData.languages.split(",").map((item) => item.trim()).filter(Boolean),
        },
        { withCredentials: true }
      );

      toast.success(isEditMode ? "Profile updated successfully." : "Profile created successfully.");
      navigate("/profile");
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to save profile.";
      toast.error(errorMsg);
      console.error("Save Profile Error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center px-4 py-12 transition-colors">
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
      >
        <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6 transition-colors">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {isEditMode ? "Edit Profile" : "Profile Setup"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            {isEditMode
              ? "Update your profile details so matching, messaging, and tasks stay relevant."
              : "Tell us about yourself to tailor your matchmaking experience."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Department *</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="border border-slate-200 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              placeholder="Computer Science"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="border border-slate-200 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cover Image</label>
            <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
              <UploadCloud className="text-slate-400 dark:text-slate-500 mb-2" size={24} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImageFile(e.target.files[0])}
                className="text-sm text-slate-600 dark:text-slate-400 w-full ml-12"
              />
              {coverImageFile && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">Selected: {coverImageFile.name}</p>}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Profile Avatar</label>
            <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
              <UploadCloud className="text-slate-400 dark:text-slate-500 mb-2" size={24} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImageFile(e.target.files[0])}
                className="text-sm text-slate-600 dark:text-slate-400 w-full ml-12"
              />
              {profileImageFile && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">Selected: {profileImageFile.name}</p>}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="border border-slate-200 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
              placeholder="A brief description of yourself."
            />
          </div>

          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="border border-slate-200 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                placeholder="React, Node, Python"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Interests</label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="border border-slate-200 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                placeholder="AI, Web3, Reading"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Languages</label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                className="border border-slate-200 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                placeholder="English, Hindi"
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">LinkedIn Username</label>
            <input
              type="text"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="border border-slate-200 dark:border-slate-600 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              placeholder="your-linkedin-handle"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="mt-8 w-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading Images & Saving..." : isEditMode ? "Update Profile" : "Save Profile"}
        </button>
      </motion.form>
    </div>
  );
};

export default CreateProfile;
