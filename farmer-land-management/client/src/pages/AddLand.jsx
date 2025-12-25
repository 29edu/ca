import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";

const AddLand = () => {
  const { farmerId, landId } = useParams(); // Get both farmerId and landId from URL
  const navigate = useNavigate();
  const isEditMode = !!landId; // Check if we're in edit mode

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State matches your schema structure
  const [formData, setFormData] = useState({
    surveyNumber: "",
    areaHectares: "",
    cropType: "",
    irrigationType: "Rainfed", // Default value
    village: "",
    district: "",
    state: "",
  });

  // Load land data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchLand = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/lands/${landId}`);
          const land = res.data;

          setFormData({
            surveyNumber: land.surveyNumber || "",
            areaHectares: land.areaHectares || "",
            cropType: land.cropType || "",
            irrigationType: land.irrigationType || "Rainfed",
            village: land.location?.village || "",
            district: land.location?.district || "",
            state: land.location?.state || "",
          });
        } catch (err) {
          console.error("Error fetching land:", err);
          setError("Failed to load land data");
        } finally {
          setLoading(false);
        }
      };

      fetchLand();
    }
  }, [landId, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ⚡️ Construct payload to match mongoose schema exactly
      const payload = {
        farmerId: farmerId,
        surveyNumber: formData.surveyNumber,
        areaHectares: formData.areaHectares,
        cropType: formData.cropType,
        irrigationType: formData.irrigationType,
        location: {
          village: formData.village,
          district: formData.district,
          state: formData.state,
        },
      };

      if (isEditMode) {
        await api.put(`/lands/${landId}`, payload);
        alert("Land record updated successfully!");
      } else {
        await api.post("/lands", payload);
        alert("Land record added successfully!");
      }

      navigate(`/farmers/${farmerId}`); // Go back to the Farmer Details page
    } catch (err) {
      console.error("Error saving land:", err);
      setError(err.response?.data?.message || "Failed to save land.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "Edit Land Record" : "Add Land Record"}
        </h1>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Survey Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Survey Number
                </label>
                <input
                  type="text"
                  name="surveyNumber"
                  value={formData.surveyNumber}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. 142/B"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (Hectares)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="areaHectares"
                  value={formData.areaHectares}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. 2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crop Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Crop
                </label>
                <input
                  type="text"
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. Wheat, Rice"
                />
              </div>

              {/* Irrigation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Irrigation Type
                </label>
                <select
                  name="irrigationType"
                  value={formData.irrigationType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="Rainfed">Rainfed</option>
                  <option value="Canal">Canal</option>
                  <option value="Borewell">Borewell</option>
                  <option value="Drip">Drip Irrigation</option>
                </select>
              </div>
            </div>

            {/* Location Section */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Land Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Village
                  </label>
                  <input
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    District
                  </label>
                  <input
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    State
                  </label>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Land Record"
                  : "Add Land Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddLand;
