import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Schemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await api.get("/schemes");
        setSchemes(res.data);
      } catch (err) {
        console.error("Error fetching schemes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Government Schemes
          </h1>
          <p className="text-sm text-gray-500">
            Manage available welfare programs.
          </p>
        </div>
        <Link
          to="/add-scheme"
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 flex items-center gap-2"
        >
          <span>+</span> Create Scheme
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <div
              key={scheme._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {scheme.title}
                </h3>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {scheme.schemeCode}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {scheme.description}
              </p>

              <div className="bg-green-50 rounded-lg p-3 mb-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Min Land:</span>
                  <span className="font-medium">
                    {scheme.eligibility?.minLandArea || 0} Ha
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Districts:</span>
                  <span className="font-medium truncate `max-w-[100px]`">
                    {scheme.eligibility?.allowedDistricts?.join(", ") || "All"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                  Benefits
                </p>
                <p className="text-sm text-gray-700">{scheme.benefits}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/edit-scheme/${scheme._id}`}
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm"
                >
                  Edit Scheme
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Schemes;
