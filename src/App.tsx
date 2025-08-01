import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from 'react-helmet-async';
import Layout from "@/components/layout/Layout";
import ClientLayout from "@/components/layout/ClientLayout";
import TherapistLayout from "@/components/layout/TherapistLayout";
import FriendLayout from "@/components/layout/FriendLayout";
import JoinCall from "@/components/video/room";

// Import pages
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import HowItWorks from "./pages/HowItWorks";
import ContactPage from "./pages/ContactPage";
import TherapistsLandingPage from "./pages/TherapistsLandingPage";
import FriendsLandingPage from "./pages/FriendsLandingPage";
import TherapistListing from "./pages/TherapistListing";
import FriendListing from "./pages/FriendListing";
import TherapistProfile from "./pages/TherapistProfile";
import BlogPage from "./pages/BlogPage";
import BookingPage from "./pages/BookingPage";
// import BookingPaymentPage from "./pages/BookingPaymentPage";
import BookingComplete from "./pages/BookingComplete";
import VideoChat from "./pages/VideoChat";
import ChatPage from "./pages/ChatPage";
import AIMatchingPage from "./pages/AIMatchingPage";
import AIMatchingResults from "./pages/AIMatchingResults";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import HIPAAPage from "./pages/HIPAAPage";
import NotFound from "./pages/NotFound";
import BlogDetail from "./pages/BlogDetail";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Client pages
import ClientDashboard from "./pages/ClientDashboard";
import ClientOverview from "./pages/client/ClientOverview";
import ClientProfile from "./pages/client/ClientProfile";
import ClientAppointments from "./pages/client/ClientAppointments";
import { ClientBookings } from "./pages/client/ClientBookings";
import ClientMessages from "./pages/client/ClientMessages";
import ClientBilling from "./pages/client/ClientBilling";
import ClientSettings from "./pages/client/ClientSettings";
import ClientTherapists from "./pages/client/ClientTherapists";
import ClientResources from "./pages/client/ClientResources";
import ClientNotes from "./pages/client/ClientNotes";
import ClientFeedback from "./pages/client/ClientFeedback";

// Therapist pages
import TherapistDashboard from "./pages/therapist/TherapistDashboard";
import TherapistOnboarding from "./pages/therapist/TherapistOnboarding";
import TherapistOnboardingPage from "./pages/TherapistOnboardingPage";
import TherapistAppointments from "./pages/therapist/TherapistAppointments";
import { TherapistBookings } from "./pages/therapist/TherapistBookings";
import TherapistClients from "./pages/therapist/TherapistClients";
import TherapistMessages from "./pages/therapist/TherapistMessages";
import TherapistEarnings from "./pages/therapist/TherapistEarnings";
import TherapistReviews from "./pages/therapist/TherapistReviews";
import TherapistAnalytics from "./pages/therapist/TherapistAnalytics";
import TherapistAccount from "./pages/therapist/TherapistAccount";
import TherapistSettings from "./pages/therapist/TherapistSettings";
import TherapistDocuments from "./pages/therapist/TherapistDocuments";
import TherapistNotifications from "./pages/therapist/TherapistNotifications";
import SessionNotes from "./pages/therapist/SessionNotes";

// Friend pages
import FriendDashboard from "./pages/friend/FriendDashboard";
import FriendOnboarding from "./pages/friend/FriendOnboarding";
import FriendBookings from "./pages/friend/FriendBookings";
import FriendClients from "./pages/friend/FriendClients";
import FriendNotes from "./pages/friend/FriendNotes";
import FriendMessages from "./pages/friend/FriendMessages";
import FriendAccount from "./pages/friend/FriendAccount";
import FriendSettings from "./pages/friend/FriendSettings";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTherapists from "./pages/admin/AdminTherapists";
import AdminFriends from "./pages/admin/AdminFriends";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminEmails from "./pages/admin/AdminEmails";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminContent from "./pages/admin/AdminContent";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSessionNotes from "./pages/admin/AdminSessionNotes";
import AdminBlogs from "./pages/admin/AdminBlogs";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes with main layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="how-it-works" element={<HowItWorks />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="for-therapists" element={<TherapistsLandingPage />} />
                <Route path="for-friends" element={<FriendsLandingPage />} />
                <Route path="therapists" element={<TherapistListing />} />
                <Route path="friends" element={<FriendListing />} />
                <Route path="/therapists/:id" element={<TherapistProfile />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:id" element={<BlogDetail />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="hipaa" element={<HIPAAPage />} />
                
                {/* Booking routes */}
               <Route path="/therapists/:therapistId/book" element={<BookingPage />} />
               <Route path="/friends/:friendId/book" element={<BookingPage />} />

                {/* <Route path="booking/:therapistId/payment" element={<BookingPaymentPage />} /> */}
                <Route path="booking/complete" element={<BookingComplete />} />
                
                {/* Chat and video routes */}
                <Route path="video/:appointmentId" element={<VideoChat />} />
                <Route path="/video/room/:roomName" element={<JoinCall />} />
                <Route path="chat/:friendId" element={<ChatPage />} />
                
                {/* AI Matching routes */}
                <Route path="ai-matching" element={<AIMatchingPage />} />
                <Route path="ai-matching/results" element={<AIMatchingResults />} />
                
                {/* Onboarding routes */}
                <Route path="therapist-onboarding" element={<TherapistOnboardingPage />} />
              </Route>

              {/* Auth routes (no layout) */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />

              {/* Client dashboard routes */}
              <Route path="/client" element={<ClientLayout />}>
                <Route index element={<ClientDashboard />} />

                <Route path="overview" element={<ClientOverview />} />
                <Route path="profile" element={<ClientProfile />} />
                <Route path="appointments" element={<ClientAppointments />} />
                <Route path="bookings" element={<ClientBookings />} />
                <Route path="messages" element={<ClientMessages />} />
                <Route path="billing" element={<ClientBilling />} />
                <Route path="settings" element={<ClientSettings />} />
                <Route path="therapists" element={<ClientTherapists />} />
                <Route path="resources" element={<ClientResources />} />
                <Route path="notes" element={<ClientNotes />} />
                <Route path="feedback" element={<ClientFeedback />} />
              </Route>

              {/* Therapist dashboard routes */}
              <Route path="/therapist" element={<TherapistLayout />}>
                <Route path="dashboard" element={<TherapistDashboard />} />
                <Route path="onboarding" element={<TherapistOnboarding />} />
                <Route path="appointments" element={<TherapistAppointments />} />
                <Route path="bookings" element={<TherapistBookings />} />
                <Route path="clients" element={<TherapistClients />} />
                <Route path="messages" element={<TherapistMessages />} />
                <Route path="earnings" element={<TherapistEarnings />} />
                <Route path="reviews" element={<TherapistReviews />} />
                <Route path="analytics" element={<TherapistAnalytics />} />
                <Route path="account" element={<TherapistAccount />} />
                <Route path="settings" element={<TherapistSettings />} />
                <Route path="documents" element={<TherapistDocuments />} />
                <Route path="notifications" element={<TherapistNotifications />} />
                <Route path="session-notes" element={<SessionNotes />} />
              </Route>

              {/* Friend dashboard routes */}
              <Route path="/friend" element={<FriendLayout />}>
                <Route path="dashboard" element={<FriendDashboard />} />
                <Route path="onboarding" element={<FriendOnboarding />} />
                <Route path="bookings" element={<FriendBookings />} />
                <Route path="clients" element={<FriendClients />} />
                <Route path="notes" element={<FriendNotes />} />
                <Route path="messages" element={<FriendMessages />} />
                <Route path="account" element={<FriendAccount />} />
                <Route path="settings" element={<FriendSettings />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<TherapistLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="therapists" element={<AdminTherapists />} />
                <Route path="friends" element={<AdminFriends />} />
                <Route path="appointments" element={<AdminAppointments />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="emails" element={<AdminEmails />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="session-notes" element={<AdminSessionNotes />} />
                <Route path="blogs" element={<AdminBlogs />} />
              </Route>

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
