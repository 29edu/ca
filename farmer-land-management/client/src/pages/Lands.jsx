import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Lands = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const res = await api.get("/lands");
        setLands(res.data);
      } catch (err) {
        console.error("Error fetching lands:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLands();
  }, []);

  // Filter logic for Search
  const filteredLands = lands.filter(
    (land) =>
      land.surveyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.location?.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.farmerId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Land Directory</h1>
          <p className="text-sm text-gray-500">
            View all registered land parcels.
          </p>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by Survey No, Farmer, or Village..."
          className="border p-2 rounded-lg w-64 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading land records...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-green-50 text-green-800 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Survey No</th>
                <th className="px-6 py-4">Owner (Farmer)</th>
                <th className="px-6 py-4">Area (Ha)</th>
                <th className="px-6 py-4">Main Crop</th>
                <th className="px-6 py-4">Village</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLands.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No lands found.
                  </td>
                </tr>
              ) : (
                filteredLands.map((land) => (
                  <tr key={land._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-gray-700">
                      {land.surveyNumber}
                    </td>
                    <td className="px-6 py-4">
                      {land.farmerId ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {land.farmerId.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {land.farmerId.phoneNumber}
                          </div>
                        </div>
                      ) : (
                        <span className="text-red-400 text-xs">
                          Unknown Owner
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                        {land.areaHectares} Ha
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {land.cropType || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {land.location?.village || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/edit-land/${land.farmerId?._id}/${land._id}`}
                          className="text-blue-600 hover:underline text-xs border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/farmers/${land.farmerId?._id}`}
                          className="text-green-600 hover:underline text-xs"
                        >
                          View Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Lands;
