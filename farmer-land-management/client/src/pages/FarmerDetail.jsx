import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";

const FarmerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [lands, setLands] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [totalLandArea, setTotalLandArea] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Farmer Profile
        const farmerRes = await api.get(`/farmers/${id}`);
        setFarmer(farmerRes.data);

        // 2. Fetch Lands
        try {
          const landsRes = await api.get(`/lands/farmer/${id}`);
          setLands(landsRes.data);
        } catch (e) {
          console.warn("No lands found or error fetching lands");
        }

        // 3. Fetch Enrollments ()
        try {
          const enrollRes = await api.get(`/enrollments/farmer/${id}`);
          setEnrollments(enrollRes.data);
        } catch (e) {
          console.warn("No enrollments found or error fetching enrollments");
        }

        // 4. Fetch Eligible Schemes
        try {
          const eligibleRes = await api.get(`/schemes/eligible/${id}`);
          setEligibleSchemes(eligibleRes.data.eligibleSchemes || []);
          setTotalLandArea(eligibleRes.data.farmer?.totalLandArea || 0);
        } catch (e) {
          console.warn("Error fetching eligible schemes:", e);
        }
      } catch (err) {
        console.error("Critical Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );

  if (!farmer)
    return (
      <Layout>
        <div className="p-8 text-center text-red-500">Farmer not found</div>
      </Layout>
    );

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/farmers")}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{farmer.name}</h1>
            <p className="text-sm text-gray-500">Farmer Profile & Records</p>
          </div>
        </div>
        <Link
          to={`/edit-farmer/${id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
        >
          <span>✏️</span> Edit Farmer
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info Card */}
        <div className="lg:col-span-1 h-fit">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-2xl font-bold mb-3">
                {farmer.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{farmer.name}</h2>
              <p className="text-gray-500 text-sm">
                {farmer.address?.village || "Village N/A"}
              </p>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Phone
                </label>
                <p className="text-gray-700">
                  {farmer.phone || farmer.phoneNumber || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Location
                </label>
                <p className="text-gray-700">
                  {farmer.address?.village}, {farmer.address?.district}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Total Land
                </label>
                <p className="text-gray-700 font-semibold text-lg">
                  {totalLandArea.toFixed(2)} Ha
                </p>
                {/* <p className="text-xs text-gray-500 mt-1">
                  {totalLandArea > 20 
                    ? "⚠️ Exceeds most scheme limits" 
                    : "✓ Within common scheme limits"}
                </p> */}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Records */}
        <div className="lg:col-span-2 space-y-6">
          {/* Land Records */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">Land Records</h3>
              <Link
                to={`/add-land/${id}`}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition"
              >
                + Add Land
              </Link>
            </div>

            {lands.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">
                  No lands registered yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lands.map((land) => (
                  <div
                    key={land._id}
                    className="border border-green-100 p-4 rounded-lg bg-green-50/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-800">
                        Survey: {land.surveyNumber}
                      </span>
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                        {land.areaHectares} Ha
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Loc: {land.location?.village}
                    </p>
                    <Link
                      to={`/edit-land/${id}/${land._id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit Land →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Eligible Government Schemes */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl shadow-sm border-2 border-green-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Eligible Government Schemes
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Based on your land area ({totalLandArea.toFixed(2)} Ha) and
                  districts
                </p>
              </div>
            </div>

            {eligibleSchemes.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">
                  No eligible schemes found at the moment.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Check back later for new schemes!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {eligibleSchemes.map((scheme) => (
                  <div
                    key={scheme._id}
                    className="bg-white border-2 border-green-300 rounded-lg p-5 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-base">
                          {scheme.title}
                        </h4>
                        <p className="text-xs text-green-700 font-semibold mt-1">
                          Code: {scheme.schemeCode}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                        ✓ Eligible
                      </span>
                    </div>

                    {scheme.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {scheme.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {scheme.eligibility?.minLandArea > 0 && (
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <span className="text-gray-500">Min Land:</span>
                          <span className="font-semibold text-blue-700 ml-1">
                            {scheme.eligibility.minLandArea} Ha
                          </span>
                        </div>
                      )}
                      {scheme.eligibility?.maxLandArea > 0 && (
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <span className="text-gray-500">Max Land:</span>
                          <span className="font-semibold text-blue-700 ml-1">
                            {scheme.eligibility.maxLandArea} Ha
                          </span>
                        </div>
                      )}
                      {scheme.eligibility?.allowedDistricts?.length > 0 && (
                        <div className="bg-purple-50 p-2 rounded border border-purple-200 col-span-2">
                          <span className="text-gray-500">Districts:</span>
                          <span className="font-semibold text-purple-700 ml-1">
                            {scheme.eligibility.allowedDistricts.join(", ")}
                          </span>
                        </div>
                      )}
                      {scheme.applicationDeadline && (
                        <div className="bg-orange-50 p-2 rounded border border-orange-200 col-span-2">
                          <span className="text-gray-500">Deadline:</span>
                          <span className="font-semibold text-orange-700 ml-1">
                            {new Date(
                              scheme.applicationDeadline
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {scheme.benefits && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs font-semibold text-yellow-800 mb-1">
                          Benefits:
                        </p>
                        <p className="text-xs text-gray-700 whitespace-pre-line">
                          {scheme.benefits}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Government Schemes */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">
                Government Schemes
              </h3>
              <Link
                to={`/apply/${id}`}
                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition"
              >
                Apply Scheme
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">
                  Not enrolled in any schemes yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment._id}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        {/* Display Scheme Title (populated) or Fallback */}
                        <h4 className="font-bold text-gray-800 text-sm">
                          {enrollment.schemeId?.title || "Unknown Scheme"}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Land: {enrollment.landId?.surveyNumber || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                        ${
                          enrollment.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : enrollment.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </div>
                    {enrollment.remarks && (
                      <p className="text-xs text-gray-500 mt-2 italic border-t pt-2 border-gray-100">
                        "{enrollment.remarks}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FarmerDetail;
