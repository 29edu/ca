import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import Layout from "../components/Layout"; // Import the sidebar layout

const FarmersList = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const res = await api.get("/farmers");
        setFarmers(res.data);
      } catch (err) {
        console.error("Error fetching farmers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Farmers Directory
          </h1>
          <p className="text-sm text-gray-500">
            View and manage all registered farmers
          </p>
        </div>
        <Link
          to="/add-farmer"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 font-medium"
        >
          <span>+</span> Add Farmer
        </Link>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      ) : (
        /* Data Table */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {farmers.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <p className="text-lg">No farmers found.</p>
              <p className="text-sm">Click "Add Farmer" to get started.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Farmer Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {farmers.map((farmer) => (
                  <tr
                    key={farmer._id}
                    className="hover:bg-green-50/50 transition-colors"
                  >
                    {/* Name Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                          {farmer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {farmer.name}
                        </span>
                      </div>
                    </td>

                    {/* District Column */}
                    <td className="px-6 py-4 text-gray-600">
                      {farmer.address?.district || (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </td>

                    {/* Contact Column (Assuming you have phone, otherwise showing N/A) */}
                    <td className="px-6 py-4 text-gray-600">
                      {farmer.phone || (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          to={`/edit-farmer/${farmer._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/farmers/${farmer._id}`}
                          className="text-green-600 hover:text-green-800 font-medium text-sm border border-green-200 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Layout>
  );
};

export default FarmersList;
