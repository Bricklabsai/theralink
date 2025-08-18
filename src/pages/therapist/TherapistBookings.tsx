import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, AlertCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

export const TherapistBookings = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const { data: appointmentsData, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("therapist_id", user?.id)
        .order("start_time", { ascending: true });

      if (error) throw error;

      // Attach client profiles
      const withClients = await Promise.all(
        (appointmentsData || []).map(async (appointment) => {
          const { data: clientProfile, error: clientError } = await supabase
            .from("profiles")
            .select("full_name, email, profile_image_url")
            .eq("id", appointment.client_id)
            .single();

          if (clientError) {
            console.error("Error fetching client profile:", clientError);
            return appointment;
          }
          return { ...appointment, client: clientProfile };
        })
      );

      setAppointments(withClients);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);

      if (error) throw error;

      const appointment = appointments.find((a) => a.id === appointmentId);
      if (appointment) {
        await supabase.from("notifications").insert([
          {
            id: crypto.randomUUID(),
            user_id: appointment.client_id,
            type: "appointment_cancelled",
            title: "Appointment Cancelled",
            message: "Your therapist has cancelled the appointment.",
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      toast({
        title: "Appointment cancelled",
        description: "The appointment has been cancelled and the client has been notified.",
      });

      fetchAppointments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to view your bookings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // categorize appointments
  const pendingRequests = appointments.filter((apt) => apt.status === "pending");
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "confirmed" && new Date(apt.start_time) > new Date()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
        <p className="text-muted-foreground">
          Manage your client booking requests and scheduled appointments
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Booking Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            My Appointments
          </TabsTrigger>
        </TabsList>

        {/* Requests */}
        <TabsContent value="requests" className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No booking requests yet</h3>
                <p className="text-muted-foreground">
                  Client booking requests will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle>
                      {request.client?.full_name || "Unknown Client"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Email: {request.client?.email || "N/A"}</p>
                    <p>Status: {request.status}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Appointments */}
        <TabsContent value="appointments" className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No appointments scheduled</h3>
                <p className="text-muted-foreground">
                  Your confirmed appointments will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        Session with {appointment.client?.full_name || "Unknown Client"}
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {appointment.status}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(appointment.start_time).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Time:</strong>{" "}
                          {new Date(appointment.start_time).toLocaleTimeString()}
                        </p>
                        <p>
                          <strong>Type:</strong> {appointment.session_type}
                        </p>
                        <p>
                          <strong>Duration:</strong>{" "}
                          {Math.round(
                            (new Date(appointment.end_time).getTime() -
                              new Date(appointment.start_time).getTime()) /
                              (1000 * 60)
                          )}{" "}
                          minutes
                        </p>
                      </div>

                      {appointment.status === "scheduled" && (
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            Cancel Appointment
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
