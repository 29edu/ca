import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";

const AddFarmer = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get farmer ID from URL for editing
  const isEditMode = !!id; // Check if we're in edit mode

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "", // We keep this as phoneNumber in state for the input
    age: "",
    gender: "Male",
    village: "",
    district: "",
    state: "",
  });

  // Load farmer data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchFarmer = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/farmers/${id}`);
          const farmer = res.data;

          setFormData({
            name: farmer.name || "",
            phoneNumber: farmer.phone || "",
            age: farmer.age || "",
            gender: farmer.gender || "Male",
            village: farmer.address?.village || "",
            district: farmer.address?.district || "",
            state: farmer.address?.state || "",
          });
        } catch (err) {
          console.error("Error fetching farmer:", err);
          setError("Failed to load farmer data");
        } finally {
          setLoading(false);
        }
      };

      fetchFarmer();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // FIX IS HERE: We map 'phoneNumber' to 'phone'
      const payload = {
        name: formData.name,
        phone: formData.phoneNumber, // <--- CHANGED THIS KEY TO 'phone'
        age: formData.age,
        gender: formData.gender,
        address: {
          village: formData.village,
          district: formData.district,
          state: formData.state,
        },
      };

      if (isEditMode) {
        await api.put(`/farmers/${id}`, payload);
        alert("Farmer Updated Successfully!");
      } else {
        await api.post("/farmers", payload);
        alert("Farmer Registered Successfully!");
      }

      navigate("/farmers");
    } catch (err) {
      console.error("Error saving farmer:", err);
      // Show the exact error message from backend if available
      setError(
        err.response?.data?.message ||
          "Failed to save farmer. Please check the data."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Farmer" : "Register New Farmer"}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditMode
              ? "Update the farmer's personal and location details."
              : "Enter the farmer's personal and location details."}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 border-b border-red-100 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="e.g. 45"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 pt-4">
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    name="village"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/farmers")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Farmer"
                  : "Register Farmer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddFarmer;
