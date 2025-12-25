import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Farmers from "./pages/Farmers";
import Lands from "./pages/Lands";
import Schemes from "./pages/Schemes";
import Enrollments from "./pages/Enrollments";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import FarmersList from "./pages/FarmersList.jsx";
import FarmerDetail from "./pages/FarmerDetail.jsx";
import ApplyScheme from "./pages/ApplyScheme.jsx";
import AddFarmer from "./pages/AddFarmer.jsx";
import AddLand from "./pages/AddLand.jsx";
import AddScheme from "./pages/AddScheme.jsx";
import EnrollmentsList from "./pages/EnrollmentsList.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmers"
          element={
            <ProtectedRoute>
              {" "}
              <FarmersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmers/:id"
          element={
            <ProtectedRoute>
              {" "}
              <FarmerDetail />
            </ProtectedRoute>
          }
        />

        <Route path="/lands" element={<Lands />} />
        <Route path="/schemes" element={<Schemes />} />

        <Route
          path="/apply/:farmerId"
          element={
            <ProtectedRoute>
              <ApplyScheme />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enrollments/:farmerId"
          element={
            <ProtectedRoute>
              <Enrollments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-farmer"
          element={
            <ProtectedRoute>
              <AddFarmer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-farmer/:id"
          element={
            <ProtectedRoute>
              <AddFarmer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-land/:farmerId"
          element={
            <ProtectedRoute>
              <AddLand />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-land/:farmerId/:landId"
          element={
            <ProtectedRoute>
              <AddLand />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-scheme"
          element={
            <ProtectedRoute>
              <AddScheme />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-scheme/:id"
          element={
            <ProtectedRoute>
              <AddScheme />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enrollments"
          element={
            <ProtectedRoute>
              <EnrollmentsList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
