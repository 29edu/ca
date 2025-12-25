import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';

const ApplyScheme = () => {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  
  const [schemes, setSchemes] = useState([]);
  const [lands, setLands] = useState([]); // <--- New: We need lands for the dropdown
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Data matching your Enrollment Schema
  const [formData, setFormData] = useState({
    schemeId: '',
    landId: '',   // <--- REQUIRED by your backend
    remarks: '',  // mapped to 'remarks'
    status: 'applied' 
  });

  // Fetch Data (Schemes AND Lands)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schemesRes, landsRes] = await Promise.all([
          api.get('/schemes'),
          api.get(`/lands/farmer/${farmerId}`)
        ]);
        
        setSchemes(schemesRes.data);
        setLands(landsRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        setError('Could not load schemes or land records.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [farmerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Validation
    if (!formData.schemeId || !formData.landId) {
      alert("Please select both a Scheme and a Land Parcel.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        farmerId: farmerId,
        landId: formData.landId,
        schemeId: formData.schemeId,
        status: formData.status,
        remarks: formData.remarks
      };

      await api.post('/enrollments', payload);
      navigate(`/farmers/${farmerId}`);
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Enroll in Scheme</h1>
        <p className="text-gray-500 mb-6">Link a specific land parcel to a government scheme.</p>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Scheme Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Scheme</label>
              <select 
                className="w-full p-2 border rounded bg-white"
                value={formData.schemeId}
                onChange={(e) => setFormData({...formData, schemeId: e.target.value})}
                required
              >
                <option value="">-- Choose a Scheme --</option>
                {schemes.map((scheme) => (
                  <option key={scheme._id} value={scheme._id}>
                    {scheme.title} {/* Changed from .name to .title */}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Land Dropdown (CRITICAL) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Land Parcel</label>
              {lands.length === 0 ? (
                <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  No lands found. You must add land first.
                </p>
              ) : (
                <select 
                  className="w-full p-2 border rounded bg-white"
                  value={formData.landId}
                  onChange={(e) => setFormData({...formData, landId: e.target.value})}
                  required
                >
                  <option value="">-- Choose Land (Survey No) --</option>
                  {lands.map((land) => (
                    <option key={land._id} value={land._id}>
                      Survey: {land.surveyNumber} ({land.areaHectares} Ha) - {land.location?.village}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 3. Status Dropdown */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Application Status</label>
               <select 
                  className="w-full p-2 border rounded bg-white"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
               >
                 <option value="applied">Applied</option>
                 <option value="approved">Approved</option>
                 <option value="rejected">Rejected</option>
               </select>
            </div>

            {/* 4. Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea 
                rows="3"
                className="w-full p-2 border rounded"
                placeholder="Notes about eligibility or documents..."
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              ></textarea>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/3 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting || lands.length === 0}
                className="w-2/3 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Enrolling...' : 'Submit Application'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ApplyScheme;