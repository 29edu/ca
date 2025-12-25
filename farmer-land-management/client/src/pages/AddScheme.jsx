import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";

const AddScheme = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get scheme ID from URL for editing
  const isEditMode = !!id; // Check if we're in edit mode

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    schemeCode: "",
    description: "",
    benefits: "",
    minLandArea: "",
    maxLandArea: "",
    allowedDistricts: "",
    benefitAmount: "",
    benefitFrequency: "one-time",
    eligibilityCriteria: "",
    requiredDocuments: "",
    applicationDeadline: "",
    contactInfo: "",
  });

  // Load scheme data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchScheme = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/schemes/${id}`);
          const scheme = res.data;

          // Parse the benefits back into individual fields if needed
          let benefitsText = scheme.benefits || "";
          let benefitAmount = "";
          let benefitFrequency = "one-time";
          let eligibilityCriteria = "";
          let requiredDocuments = "";
          let applicationDeadline = "";
          let contactInfo = "";

          // Try to extract structured information from benefits text
          const lines = benefitsText.split("\n\n");
          if (lines.length > 0) {
            benefitsText = lines[0]; // First part is main benefits

            for (let i = 1; i < lines.length; i++) {
              const line = lines[i];
              if (line.includes("Financial Benefit:")) {
                const match = line.match(/₹(\d+)/);
                if (match) benefitAmount = match[1];
                if (line.includes("(")) {
                  const freqMatch = line.match(/\(([^)]+)\)/);
                  if (freqMatch) benefitFrequency = freqMatch[1];
                }
              } else if (line.includes("Eligibility:")) {
                eligibilityCriteria = line.replace("Eligibility:", "").trim();
              } else if (line.includes("Required Documents:")) {
                requiredDocuments = line
                  .replace("Required Documents:", "")
                  .trim();
              } else if (line.includes("Application Deadline:")) {
                applicationDeadline = line
                  .replace("Application Deadline:", "")
                  .trim();
              } else if (line.includes("Contact:")) {
                contactInfo = line.replace("Contact:", "").trim();
              }
            }
          }

          setFormData({
            title: scheme.title || "",
            schemeCode: scheme.schemeCode || "",
            description: scheme.description || "",
            benefits: benefitsText,
            minLandArea: scheme.eligibility?.minLandArea || "",
            maxLandArea: scheme.eligibility?.maxLandArea || "",
            allowedDistricts:
              scheme.eligibility?.allowedDistricts?.join(", ") || "",
            benefitAmount: benefitAmount,
            benefitFrequency: benefitFrequency,
            eligibilityCriteria: eligibilityCriteria,
            requiredDocuments: requiredDocuments,
            applicationDeadline: applicationDeadline,
            contactInfo: contactInfo,
          });
        } catch (err) {
          console.error("Error fetching scheme:", err);
          setError("Failed to load scheme data");
        } finally {
          setLoading(false);
        }
      };

      fetchScheme();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const districtsArray = formData.allowedDistricts
        ? formData.allowedDistricts
            .split(",")
            .map((d) => d.trim())
            .filter((d) => d !== "")
        : [];

      const minArea = formData.minLandArea ? Number(formData.minLandArea) : 0;
      const maxArea = formData.maxLandArea ? Number(formData.maxLandArea) : 0;

      // Build comprehensive benefits description
      let benefitsDescription = formData.benefits;
      if (formData.benefitAmount) {
        benefitsDescription += `\n\nFinancial Benefit: ₹${formData.benefitAmount} (${formData.benefitFrequency})`;
      }
      if (formData.eligibilityCriteria) {
        benefitsDescription += `\n\nEligibility: ${formData.eligibilityCriteria}`;
      }
      if (formData.requiredDocuments) {
        benefitsDescription += `\n\nRequired Documents: ${formData.requiredDocuments}`;
      }
      if (formData.applicationDeadline) {
        benefitsDescription += `\n\nApplication Deadline: ${formData.applicationDeadline}`;
      }
      if (formData.contactInfo) {
        benefitsDescription += `\n\nContact: ${formData.contactInfo}`;
      }

      const payload = {
        title: formData.title,
        schemeCode: formData.schemeCode.toUpperCase(),
        description: formData.description,
        benefits: benefitsDescription,
        eligibility: {
          minLandArea: minArea,
          maxLandArea: maxArea,
          allowedDistricts: districtsArray,
        },
        applicationDeadline: formData.applicationDeadline || null,
      };

      if (isEditMode) {
        await api.put(`/schemes/${id}`, payload);
        setSuccess("Scheme updated successfully!");
      } else {
        await api.post("/schemes", payload);
        setSuccess("Scheme created successfully!");
      }

      setTimeout(() => navigate("/schemes"), 2000);
    } catch (err) {
      console.error("Error saving scheme:", err);
      const serverMsg = err.response?.data?.message || err.message;
      setError(`Failed to save scheme: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? "Edit Government Scheme" : "Add Government Scheme"}
          </h1>
          <p className="text-gray-600">
            {isEditMode
              ? "Update the scheme with detailed benefits and eligibility criteria"
              : "Create a new agricultural scheme with detailed benefits and eligibility criteria"}
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200 flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <strong>Success!</strong> {success} Redirecting...
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  1
                </span>
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheme Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    placeholder="e.g., PM-KISAN Samman Nidhi Yojana"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheme Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="schemeCode"
                    value={formData.schemeCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition uppercase"
                    placeholder="e.g., PMKISAN-2024"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheme Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  placeholder="Provide a comprehensive overview of the scheme, its objectives, and target beneficiaries..."
                ></textarea>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  2
                </span>
                Benefits & Financial Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits Overview <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="benefits"
                    rows="3"
                    value={formData.benefits}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    placeholder="Describe the key benefits, subsidies, support services provided under this scheme..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financial Benefit Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="benefitAmount"
                      value={formData.benefitAmount}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="e.g., 6000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Benefit Frequency
                    </label>
                    <select
                      name="benefitFrequency"
                      value={formData.benefitFrequency}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    >
                      <option value="one-time">One-time</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                      <option value="per-season">Per Season</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Eligibility Criteria Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  3
                </span>
                Eligibility Criteria
              </h2>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Land Area (Hectares)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="minLandArea"
                      value={formData.minLandArea}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                      placeholder="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Land Area (Hectares)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="maxLandArea"
                      value={formData.maxLandArea}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                      placeholder="10.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Districts (comma-separated)
                  </label>
                  <input
                    name="allowedDistricts"
                    value={formData.allowedDistricts}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                    placeholder="e.g., Pune, Mumbai, Nashik (Leave empty for all districts)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to allow all districts
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Eligibility Criteria
                  </label>
                  <textarea
                    name="eligibilityCriteria"
                    rows="3"
                    value={formData.eligibilityCriteria}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                    placeholder="Specify income limits, farmer category, crop types, or any other eligibility requirements..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Application Details Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                  4
                </span>
                Application Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Documents
                  </label>
                  <textarea
                    name="requiredDocuments"
                    rows="3"
                    value={formData.requiredDocuments}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    placeholder="List required documents: Aadhaar Card, Land Ownership Certificate, Bank Account Details, etc."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Information
                    </label>
                    <input
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="e.g., 1800-XXX-XXXX or email@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/schemes")}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isEditMode ? "Updating Scheme..." : "Creating Scheme..."}
                  </>
                ) : (
                  `✓ ${isEditMode ? "Update Scheme" : "Create Scheme"}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddScheme;
