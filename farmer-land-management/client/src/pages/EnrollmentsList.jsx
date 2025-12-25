import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const EnrollmentsList = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Enrollments
  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/enrollments');
      setEnrollments(res.data);
    } catch (err) {
      console.error("Error fetching enrollments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Handle Approve/Reject
  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this application?`)) return;
    try {
      await api.put(`/enrollments/${id}/status`, { 
        status: newStatus, 
        remarks: `Updated to ${newStatus} by Admin` 
      });
      fetchEnrollments();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // ✅ NEW: Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to DELETE this application permanently?")) return;
    try {
      await api.delete(`/enrollments/${id}`);
      // Remove from UI immediately
      setEnrollments(enrollments.filter(item => item._id !== id));
    } catch (err) {
      alert("Failed to delete. You might not have permission.");
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Application Requests</h1>
          <p className="text-sm text-gray-500">Manage farmer scheme enrollments.</p>
        </div>
        <button 
          onClick={fetchEnrollments} 
          className="text-sm text-green-600 hover:underline"
        >
          Refresh List
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading applications...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {enrollments.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No pending applications found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Farmer</th>
                  <th className="px-6 py-4">Scheme</th>
                  <th className="px-6 py-4">Land Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {enrollments.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">
                        {item.farmerId?.name || <span className="text-red-400">Unknown Farmer</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.farmerId?.phoneNumber}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 font-medium">
                      {item.schemeId ? (
                        <span className="text-purple-700">{item.schemeId.title}</span>
                      ) : (
                        <span className="text-red-400 italic text-xs">Scheme Deleted</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      <div>Survey: {item.landId?.surveyNumber}</div>
                      <div className="text-xs text-gray-400">
                        {item.landId?.location?.village}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize
                        ${item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          item.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'}`
                      }>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {item.status === 'applied' ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(item._id, 'approved')}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 text-xs font-medium"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(item._id, 'rejected')}
                            className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 text-xs font-medium"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs italic py-1 px-2">Processed</span>
                      )}

                      {/* DELETE BUTTON */}
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 text-xs font-medium border border-red-200"
                        title="Delete Enrollment"
                      >
                        🗑 Delete
                      </button>
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

export default EnrollmentsList;