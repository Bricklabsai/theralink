
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, FileText, MessageCircle, Clock, User, CreditCard, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ClientOverview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [therapyProgress, setTherapyProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [therapists, setTherapists] = useState({});

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch upcoming appointments (without trying to join with therapist profiles)
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            end_time,
            session_type,
            status,
            therapist_id
          `)
          .eq('client_id', user.id)
          .eq('status', 'confirmed')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3);

        if (appointmentError) throw appointmentError;
        
        // Get unique therapist IDs from appointments
        const therapistIds = [...new Set(appointmentData?.map(apt => apt.therapist_id) || [])];
        
        // Fetch therapist profiles separately if there are appointments
        if (therapistIds.length > 0) {
          const { data: therapistData, error: therapistError } = await supabase
            .from('profiles')
            .select('id, full_name, profile_image_url')
            .in('id', therapistIds);
            
          if (therapistError) throw therapistError;
          
          // Create a map of therapist data for easy lookup
          const therapistMap = {};
          therapistData?.forEach(therapist => {
            therapistMap[therapist.id] = therapist;
          });
          
          setTherapists(therapistMap);
        }
        
        // Combine appointment data with therapist data
        const enrichedAppointments = appointmentData?.map(apt => ({
          ...apt,
          profiles: therapists[apt.therapist_id] || null
        })) || [];
        
        setUpcomingAppointments(enrichedAppointments);

        // Fetch recent client notes
        const { data: notesData, error: notesError } = await supabase
          .from('session_notes')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (notesError) throw notesError;
        setRecentNotes(notesData || []);

        // Count unread messages
        const { count: messageCount, error: messageError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        if (messageError) throw messageError;
        setUnreadMessages(messageCount || 0);
        
        // Fetch wallet balance
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (walletError && walletError.code !== 'PGRST116') throw walletError;
        setWalletBalance(walletData?.balance || 0);
        
        // Calculate therapy progress (this is a placeholder - in a real app, you'd have a proper algorithm)
        // For demo purposes: Based on completed sessions out of expected total
        const { count: completedSessions, error: completedError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .eq('status', 'completed');
          
        if (completedError) throw completedError;
        
        // Simple progress calculation - assuming 12 sessions is "complete"
        const expectedTotal = 12;
        const progress = Math.min(((completedSessions || 0) / expectedTotal) * 100, 100);
        setTherapyProgress(Math.round(progress));
        
      } catch (error) {
        console.error('Error fetching overview data:', error);
        toast({
          title: "Failed to load dashboard data",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Update the appointment data whenever therapists data changes
  useEffect(() => {
    if (Object.keys(therapists).length > 0) {
      setUpcomingAppointments(prev => 
        prev.map(apt => ({
          ...apt,
          profiles: therapists[apt.therapist_id] || null
        }))
      );
    }
  }, [therapists]);

  const formatDate = (dateString) => {
    // Use const typed parameters to fix the TypeScript error
    const options = { 
      weekday: 'long' as const, 
      year: 'numeric' as const, 
      month: 'long' as const, 
      day: 'numeric' as const, 
      hour: '2-digit' as const, 
      minute: '2-digit' as const 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatDateShort = (dateString) => {
    const options = { 
      month: 'short' as const, 
      day: 'numeric' as const 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { 
      hour: '2-digit' as const, 
      minute: '2-digit' as const 
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingAppointments.length > 0 
                ? `Next on ${formatDateShort(upcomingAppointments[0].start_time)}` 
                : "No upcoming sessions"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Therapy Progress
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{therapyProgress}%</div>
            <Progress value={therapyProgress} className="h-1 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Messages
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              {unreadMessages > 0 ? "Unread messages" : "No new messages"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(walletBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available balance
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Appointments</span>
            </CardTitle>
            <CardDescription>Your scheduled therapy sessions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingAppointments.length > 0 ? (
              <div className="divide-y">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.profiles?.full_name || 'Therapist'}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3.5 w-3.5" />
                            <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge>{appointment.session_type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="mr-1 h-3.5 w-3.5" />
                      <span>{formatDate(appointment.start_time).split('at')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                <p className="mt-4 text-muted-foreground font-medium">No upcoming appointments</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/therapists">Find a Therapist</Link>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-muted/50">
            <Button asChild variant="ghost" className="w-full">
              <Link to="/client/appointments" className="flex gap-2 items-center justify-center">
                View All Appointments
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Recent Notes</span>
              </CardTitle>
              <CardDescription>Session notes from your therapist</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentNotes.length > 0 ? (
                <div className="divide-y">
                  {recentNotes.map((note) => (
                    <div key={note.id} className="p-4 hover:bg-accent/50 transition-colors">
                      <p className="font-medium">{note.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{new Date(note.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                  <p className="mt-4 text-muted-foreground font-medium">No session notes yet</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/50">
              <Button asChild variant="ghost" className="w-full">
                <Link to="/client/notes">
                  View All Notes
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Resources</span>
              </CardTitle>
              <CardDescription>Helpful materials for your therapy</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Understanding Anxiety</p>
                      <p className="text-sm text-muted-foreground">Complete guide to managing anxiety</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Mindfulness Exercises</p>
                      <p className="text-sm text-muted-foreground">Practical techniques for daily mindfulness</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50">
              <Button asChild variant="ghost" className="w-full">
                <Link to="/client/resources">
                  Browse All Resources
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Messages Card */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span>Messages</span>
              {unreadMessages > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadMessages} new
                </Badge>
              )}
            </CardTitle>
          </div>
          <CardDescription>Communication with your therapist</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          {unreadMessages > 0 ? (
            <div className="text-center py-4">
              <AlertCircle className="h-10 w-10 text-primary mx-auto" />
              <p className="mt-2 font-medium">You have {unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''}</p>
              <p className="text-sm text-muted-foreground">Check your messages to stay up to date</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto opacity-30" />
              <p className="mt-2 text-muted-foreground">No new messages</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 mt-4">
          <Button asChild variant="ghost" className="w-full">
            <Link to="/client/messages">
              Go to Messages
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClientOverview;
