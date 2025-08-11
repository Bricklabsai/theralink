import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, FileText, Calendar, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const FriendDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  // Fetch friend's active clients/appointments
  const { data: clientStats } = useQuery({
    queryKey: ['friend-clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return { activeClients: 0, totalSessions: 0 };
      
      const { data: appointments } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('therapist_id', user.id)
        .eq('status', 'completed');
      
      const { data: activeAppointments } = await supabase
        .from('booking_requests')
        .select('client_id')
        .eq('therapist_id', user.id)
        .in('status', ['scheduled', 'confirmed']);
      
      const uniqueClients = new Set(activeAppointments?.map(a => a.client_id));
      
      return {
        activeClients: uniqueClients.size,
        totalSessions: appointments?.length || 0
      };
    },
    enabled: !!user?.id
  });

  // Fetch unread messages
  const { data: messageStats } = useQuery({
    queryKey: ['friend-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return { unreadCount: 0 };
      
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      return { unreadCount: data?.length || 0 };
    },
    enabled: !!user?.id
  });

  // Fetch session notes count
  const { data: notesStats } = useQuery({
    queryKey: ['friend-notes', user?.id],
    queryFn: async () => {
      if (!user?.id) return { notesCount: 0 };
      
      const { data } = await supabase
        .from('session_notes')
        .select('*')
        .eq('therapist_id', user.id);
      
      return { notesCount: data?.length || 0 };
    },
    enabled: !!user?.id
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative py-8 md:py-12 bg-gradient-to-br from-[#d9dbe7] to-[#ecf0fc] rounded-2xl overflow-hidden shadow-lg border border-border/30 mb-6">
        <div className="absolute inset-0 bg-dot-pattern pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center shadow-lg mb-3">
            <span className="text-4xl font-bold text-white">🤝</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-2 gradient-text">
            Welcome back, {profile?.full_name || 'Friend'}
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-xl">
            Thank you for sharing your experiences with others on TheraLink.<br/>
            Your support and empathy make a huge difference.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/friend/clients')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-primary">Active Clients</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-primary">{clientStats?.activeClients || 0}</div>
            <Progress value={Math.min(100, (clientStats?.activeClients || 0) * 20)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              People you're currently supporting
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => navigate('/friend/messages')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-secondary">New Messages</CardTitle>
            <MessageCircle className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-secondary">{messageStats?.unreadCount || 0}</div>
            <Progress value={Math.min(100, (messageStats?.unreadCount || 0) * 25)} color="secondary" className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Unread messages from clients
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Session Notes</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{notesStats?.notesCount || 0}</div>
            <Progress value={Math.min(100, (notesStats?.notesCount || 0) * 30)} color="muted" className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Notes from your sessions
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Total Sessions</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{clientStats?.totalSessions || 0}</div>
            <Progress value={Math.min(100, (clientStats?.totalSessions || 0) * 15)} color="accent" className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Completed support sessions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Impact as a Friend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center bg-accent/60 rounded-lg px-6 py-4">
                <div className="text-2xl font-bold text-primary">{clientStats?.activeClients || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">People Currently Supported</p>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg px-6 py-4">
                <div className="text-2xl font-bold text-secondary">{clientStats?.totalSessions || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Lives Touched</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Button size="lg" onClick={() => navigate('/friend/clients')}>View Clients</Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/friend/messages')}>Messages</Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/friend/account')}>Update Profile</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What’s New?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-4 list-disc text-sm leading-relaxed space-y-2 text-muted-foreground">
              <li>Deeper insights with session stats</li>
              <li>Beautiful new dashboard theme for Friends</li>
              <li>Instant messaging with your clients</li>
              <li>Enhanced session notes interface</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <FeedbackForm dashboardType="friend" />
    </div>
  );
};

export default FriendDashboard;
