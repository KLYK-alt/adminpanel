import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import BlogsPage from "./pages/blogs/BlogsPage";
import TeamPage from "./pages/team/TeamPage";
import TestimonialsPage from "./pages/testimonials/TestimonialsPage";
import PartnersPage from "./pages/partners/PartnersPage";
import TrainingsPage from "./pages/trainings/TrainingsPage";
import ContactsPage from "./pages/Contacts";
import FAQsPage from "./pages/faqs/FAQsPage";
import ServicesPage from "./pages/services/ServicesPage";
import SocialContactsPage from "./pages/social-contacts/SocialContactsPage";
import MissionVisionPage from "./pages/mission-vision/MissionVisionPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="blogs" element={<BlogsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="partners" element={<PartnersPage />} />
            <Route path="trainings" element={<TrainingsPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="faqs" element={<FAQsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="social-contacts" element={<SocialContactsPage />} />
            <Route path="mission-vision" element={<MissionVisionPage />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
