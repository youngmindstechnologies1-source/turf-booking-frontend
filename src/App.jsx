import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/common/ProtectedRoute';
import PlayerLayout from './layouts/PlayerLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';

const Home = React.lazy(() => import('./pages/player/Home'));
const TurfDetail = React.lazy(() => import('./pages/player/TurfDetail'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const MyBookings = React.lazy(() => import('./pages/player/MyBookings'));
const Favourites = React.lazy(() => import('./pages/player/Favourites'));
const Profile = React.lazy(() => import('./pages/player/Profile'));

const OwnerDashboard = React.lazy(() => import('./pages/owner/Dashboard'));
const MyTurfs = React.lazy(() => import('./pages/owner/MyTurfs'));
const CreateTurf = React.lazy(() => import('./pages/owner/CreateTurf'));
const EditTurf = React.lazy(() => import('./pages/owner/EditTurf'));
const SlotManager = React.lazy(() => import('./pages/owner/SlotManager'));
const BookingCalendar = React.lazy(() => import('./pages/owner/BookingCalendar'));
const Analytics = React.lazy(() => import('./pages/owner/Analytics'));

const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const PendingTurfs = React.lazy(() => import('./pages/admin/PendingTurfs'));
const ManageUsers = React.lazy(() => import('./pages/admin/ManageUsers'));
const AllBookings = React.lazy(() => import('./pages/admin/AllBookings'));

function App() {
  return (
    <Suspense fallback={<Loader text="Loading TurfBook..." />}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Player Routes */}
        <Route element={<PlayerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/turfs/:slug" element={<TurfDetail />} />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute roles={['player']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favourites"
            element={
              <ProtectedRoute roles={['player']}>
                <Favourites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Owner Routes */}
        <Route
          element={
            <ProtectedRoute roles={['owner']}>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/turfs" element={<MyTurfs />} />
          <Route path="/owner/turfs/create" element={<CreateTurf />} />
          <Route path="/owner/turfs/:id/edit" element={<EditTurf />} />
          <Route path="/owner/turfs/:id/slots" element={<SlotManager />} />
          <Route path="/owner/bookings/:turfId" element={<BookingCalendar />} />
          <Route path="/owner/analytics" element={<Analytics />} />
        </Route>

        {/* Admin Routes */}
        <Route
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pending-turfs" element={<PendingTurfs />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/bookings" element={<AllBookings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
