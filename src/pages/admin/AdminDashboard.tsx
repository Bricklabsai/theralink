import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, 
  MessageSquare, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  BookOpen, 
  UserCog, 
  Heart, 
  BarChart2, 
  Star, 
  CheckCircle, 
  Clock, 
  XCircle,
  Mail,
  TrendingUp,
  Shield,
  Zap,
  Activity,
  Edit3,
  Stethoscope,
  UserCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    therapists: 0,
    friends: 0,
    clients: 0,
    admins: 0,
    appointments: 0,
    transactions: 0,
    sessionNotes: 0,
    unreadFeedback: 0,
    unreadMessages: 0,
    reviews: 0,
    pendingTherapists: 0,
    pendingFriends: 0,
    totalRevenue: 0,
    averageRating: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    contactMessages: 0,
    unreadContactMessages: 0,
    blogs: 0,
    publishedBlogs: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Optimized queries using database functions and minimal data fetching
        const [
          // Use count queries only where possible
          usersCountResult,
          therapistsCountResult,
          friendsCountResult,
          clientsCountResult,
          adminsCountResult,
          appointmentsCountResult,
          completedAppointmentsResult,
          cancelledAppointmentsResult,
          transactionsResult,
          sessionNotesCountResult,
          unreadFeedbackResult,
          unreadContactResult,
          reviewsResult,
          pendingTherapistsResult,
          friendDetailsResult,
          blogsCountResult,
          publishedBlogsResult
        ] = await Promise.all([
          // Count-only queries for better performance
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "therapist"),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "friend"),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
          supabase.from("appointments").select("*", { count: "exact", head: true }),
          supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "completed"),
          supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
          supabase.from("transactions").select("amount", { count: "exact" }).eq("status", "success"),
          supabase.from("session_notes").select("*", { count: "exact", head: true }),
          supabase.from("feedback").select("*", { count: "exact", head: true }).eq("is_read", false),
          supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
          supabase.from("reviews").select("rating", { count: "exact" }),
          supabase.from("therapists").select("*", { count: "exact", head: true }).in("application_status", ["pending", null]),
          supabase.from("friend_details").select("*", { count: "exact", head: true }),
          supabase.from("blogs").select("*", { count: "exact", head: true }),
          supabase.from("blogs").select("*", { count: "exact", head: true }).eq("published", true)
        ]);

        // Calculate stats efficiently
        const usersCount = usersCountResult.count || 0;
        const therapistsCount = therapistsCountResult.count || 0;
        const friendsCount = friendsCountResult.count || 0;
        const clientsCount = clientsCountResult.count || 0;
        const adminsCount = adminsCountResult.count || 0;
        const appointmentsCount = appointmentsCountResult.count || 0;
        const completedAppointmentsCount = completedAppointmentsResult.count || 0;
        const cancelledAppointmentsCount = cancelledAppointmentsResult.count || 0;
        const sessionNotesCount = sessionNotesCountResult.count || 0;
        const unreadFeedbackCount = unreadFeedbackResult.count || 0;
        const unreadMessagesCount = unreadContactResult.count || 0;
        const reviewsCount = reviewsResult.count || 0;
        const pendingTherapistsCount = pendingTherapistsResult.count || 0;
        const friendDetailsCount = friendDetailsResult.count || 0;
        const pendingFriendsCount = Math.max(0, friendsCount - friendDetailsCount);
        const blogsCount = blogsCountResult.count || 0;
        const publishedBlogsCount = publishedBlogsResult.count || 0;

        // Calculate revenue and ratings
        const transactionData = transactionsResult.data || [];
        const transactionsCount = transactionsResult.count || 0;
        const totalRevenue = transactionData.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

        const reviewData = reviewsResult.data || [];
        const averageRating = reviewData.length > 0 
          ? reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length 
          : 0;

        setStats({
          users: usersCount,
          therapists: therapistsCount,
          friends: friendsCount,
          clients: clientsCount,
          admins: adminsCount,
          appointments: appointmentsCount,
          transactions: transactionsCount,
          sessionNotes: sessionNotesCount,
          unreadFeedback: unreadFeedbackCount,
          unreadMessages: unreadMessagesCount,
          reviews: reviewsCount,
          pendingTherapists: pendingTherapistsCount,
          pendingFriends: pendingFriendsCount,
          totalRevenue: totalRevenue,
          averageRating: averageRating,
          completedAppointments: completedAppointmentsCount,
          cancelledAppointments: cancelledAppointmentsCount,
          contactMessages: 0, // Will be calculated from unread count
          unreadContactMessages: unreadMessagesCount,
          blogs: blogsCount,
          publishedBlogs: publishedBlogsCount
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 mx-auto rounded-xl" />
          <Skeleton className="h-10 w-96 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingApprovals = stats.pendingTherapists + stats.pendingFriends;

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome back, {profile?.full_name || "Administrator"} - Complete platform oversight
            </p>
          </div>
        </div>
      </div>

      {/* Alert for pending approvals */}
      {(pendingApprovals > 0 || stats.unreadFeedback > 0 || stats.unreadContactMessages > 0) && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-full">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">Attention Required</h3>
                <div className="space-y-1 text-sm text-amber-700">
                  {pendingApprovals > 0 && (
                    <p>📋 {pendingApprovals} pending approvals ({stats.pendingTherapists} therapists, {stats.pendingFriends} friends)</p>
                  )}
                  {(stats.unreadFeedback > 0 || stats.unreadContactMessages > 0) && (
                    <p>📧 {stats.unreadFeedback + stats.unreadContactMessages} unread messages</p>
                  )}
                </div>
                <div className="flex gap-3 mt-3">
                  {pendingApprovals > 0 && (
                    <Button asChild variant="outline" size="sm" className="border-amber-300 hover:bg-amber-100">
                      <Link to="/admin/therapists">Review Approvals</Link>
                    </Button>
                  )}
                  {(stats.unreadFeedback > 0 || stats.unreadContactMessages > 0) && (
                    <Button asChild variant="outline" size="sm" className="border-amber-300 hover:bg-amber-100">
                      <Link to="/admin/feedback">View Messages</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Main Statistics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <p className="text-3xl font-bold text-blue-800">{stats.users}</p>
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>{stats.admins} admins</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{stats.therapists} therapists</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{stats.friends} friends</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{stats.clients} clients</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Therapists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Stethoscope className="h-5 w-5 text-indigo-600 mr-3" />
                <p className="text-3xl font-bold text-indigo-800">{stats.therapists}</p>
              </div>
              <div className="text-xs text-indigo-600">
                {stats.pendingTherapists > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{stats.pendingTherapists} pending</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-green-600 mr-3" />
                <p className="text-3xl font-bold text-green-800">{stats.friends}</p>
              </div>
              <div className="text-xs text-green-600">
                {stats.pendingFriends > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{stats.pendingFriends} pending</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 text-purple-600 mr-3" />
                <p className="text-3xl font-bold text-purple-800">{stats.clients}</p>
              </div>
              <div className="text-xs text-purple-600">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Service users</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-amber-600 mr-3" />
                <p className="text-3xl font-bold text-amber-800">₦{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-xs text-amber-600">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stats.transactions} transactions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-orange-600 mr-3" />
                <p className="text-3xl font-bold text-orange-800">{stats.appointments}</p>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">{stats.completedAppointments} completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">{stats.cancelledAppointments} cancelled</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">Reviews & Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-pink-600 mr-3" />
                <p className="text-3xl font-bold text-pink-800">{stats.averageRating.toFixed(1)}</p>
              </div>
              <div className="text-xs text-pink-600">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>{stats.reviews} reviews</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              User Management
            </CardTitle>
            <CardDescription>Manage all platform users and approvals</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center relative hover:bg-blue-50">
              <Link to="/admin/therapists">
                <Stethoscope className="h-5 w-5 mb-1" />
                <span className="text-xs">Therapists</span>
                {stats.pendingTherapists > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {stats.pendingTherapists}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-blue-50">
              <Link to="/admin/friends">
                <Users className="h-5 w-5 mb-1" />
                <span className="text-xs">All Users</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center relative hover:bg-red-50">
              <Link to="/admin/friends">
                <Heart className="h-5 w-5 mb-1" />
                <span className="text-xs">Friends</span>
                {stats.pendingFriends > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {stats.pendingFriends}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-yellow-50">
              <Link to="/admin/emails">
                <Mail className="h-5 w-5 mb-1" />
                <span className="text-xs">Send Emails</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Session Management
            </CardTitle>
            <CardDescription>Monitor appointments and session data</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-green-50">
              <Link to="/admin/appointments">
                <Calendar className="h-5 w-5 mb-1" />
                <span className="text-xs">Appointments</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-green-50">
              <Link to="/admin/session-notes">
                <FileText className="h-5 w-5 mb-1" />
                <span className="text-xs">Session Notes</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-purple-500" />
              Analytics & Finance
            </CardTitle>
            <CardDescription>Revenue tracking and platform insights</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-purple-50">
              <Link to="/admin/transactions">
                <DollarSign className="h-5 w-5 mb-1" />
                <span className="text-xs">Transactions</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-purple-50">
              <Link to="/admin/analytics">
                <BarChart2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Analytics</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              Communication Hub
            </CardTitle>
            <CardDescription>Messages, feedback and platform communication</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center relative hover:bg-orange-50">
              <Link to="/admin/feedback">
                <MessageSquare className="h-5 w-5 mb-1" />
                <span className="text-xs">Feedback</span>
                {(stats.unreadFeedback + stats.unreadContactMessages > 0) && 
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {stats.unreadFeedback + stats.unreadContactMessages}
                  </Badge>
                }
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-orange-50">
              <Link to="/admin/messages">
                <Mail className="h-5 w-5 mb-1" />
                <span className="text-xs">Messages</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-500" />
              Content & System
            </CardTitle>
            <CardDescription>Platform content and configuration</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-teal-50">
              <Link to="/admin/content">
                <BookOpen className="h-5 w-5 mb-1" />
                <span className="text-xs">Content</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-teal-50">
              <Link to="/admin/settings">
                <UserCog className="h-5 w-5 mb-1" />
                <span className="text-xs">Settings</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-pink-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-pink-500" />
              Blog Management
            </CardTitle>
            <CardDescription>Create and manage blog posts</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-pink-50">
              <Link to="/admin/blogs">
                <Edit3 className="h-5 w-5 mb-1" />
                <span className="text-xs">Manage Blogs</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center hover:bg-pink-50">
              <Link to="/admin/blogs/new">
                <FileText className="h-5 w-5 mb-1" />
                <span className="text-xs">New Post</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status Footer */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium text-green-800">System Status: Online</span>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-300">
                <Zap className="h-3 w-3 mr-1" />
                All Services Operational
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
