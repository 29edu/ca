import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const Enrollments = () => {
  const { farmerId } = useParams(); // ✅ THIS WAS MISSING
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    if (!farmerId) return;

    const fetchEnrollments = async () => {
      try {
        const res = await api.get(`/enrollments/farmer/${farmerId}`);
        setEnrollments(res.data);
      } catch (error) {
        console.error("Failed to fetch enrollments", error);
      }
    };

    fetchEnrollments();
  }, [farmerId]);

  return (
    <div>
      <h2>Enrollments</h2>

      {enrollments.length === 0 ? (
        <p>No enrollments found</p>
      ) : (
        enrollments.map((e) => (
          <div key={e._id} style={{ border: "1px solid #ccc", margin: "10px" }}>
            <p><b>Scheme:</b> {e.schemeId?.title}</p>
            <p><b>Status:</b> {e.status}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Enrollments;
