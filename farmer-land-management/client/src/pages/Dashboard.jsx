import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    farmers: 0,
    lands: 0,
    schemes: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalArea: 0,
    recent: [],
    cropDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <p className="text-gray-500">
          Welcome back! Here is what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Farmers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Farmers
            </p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {stats.farmers}
            </h2>
          </div>
          <div className="mt-4">
            <Link
              to="/farmers"
              className="text-sm text-green-600 hover:underline"
            >
              View Directory →
            </Link>
          </div>
        </div>

        {/* Card 2: Pending Requests */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Pending Approvals
            </p>
            <h2 className="text-3xl font-bold text-orange-500 mt-2">
              {stats.pending}
            </h2>
          </div>
          <div className="mt-4">
            <Link
              to="/enrollments"
              className="text-sm text-orange-600 hover:underline"
            >
              Manage Requests →
            </Link>
          </div>
        </div>

        {/* Card 3: Approved/Beneficiaries */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Active Beneficiaries
            </p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {stats.approved}
            </h2>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            Total Approved Applications
          </div>
        </div>

        {/* Card 4: Land Area */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Land Area
            </p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {stats.totalArea}{" "}
              <span className="text-sm text-gray-400 font-normal">Ha</span>
            </h2>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            Across {stats.lands} plots
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Application Status Donut */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Application Status</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: "Approved", value: stats.approved },
                    { name: "Pending", value: stats.pending },
                    { name: "Rejected", value: stats.rejected },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-green-600"></span>
                Approved
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-orange-500"></span>
                Pending
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-red-500"></span>Rejected
              </span>
            </div>
          </div>
        </div>

        {/* Crop Distribution (horizontal) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Crop Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart
                data={stats.cropDistribution}
                layout="vertical"
                margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={60} />
                <ReTooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Recent Applications</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Farmer</th>
              <th className="px-6 py-3">Scheme</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.recent.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-400">
                  No recent activity
                </td>
              </tr>
            ) : (
              stats.recent.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-3 font-medium text-gray-700">
                    {item.farmerId?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {item.schemeId?.title || "Unknown Scheme"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold capitalize 
                      ${
                        item.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : item.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Dashboard;
