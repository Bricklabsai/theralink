import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  Video, 
  MessageSquare,
  Filter,
  Clock,
  Check,
  X,
  MoreVertical,
  Loader2,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Type definition for appointments
interface Appointment {
  id: string;
  client: {
    full_name: string;
    id: string;
  };
  date: string;
  time: string;
  duration: number;
  type: "video" | "chat";
  status: "confirmed" | "pending" | "completed" | "cancelled";
  notes?: string;
  start_time: string;
  end_time: string;
}

const TherapistAppointments = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"calendar" | "list">("list");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*, client_id')
          .eq('therapist_id', user.id);
          
        if (appointmentsError) throw appointmentsError;
        
        // Fetch client profiles for each appointment
        const formattedAppointments: Appointment[] = [];
        
        for (const appointment of appointmentsData) {
          // Get client information
          const { data: clientData, error: clientError } = await supabase
            .from('profiles')
            .select('full_name, id')
            .eq('id', appointment.client_id)
            .single();
            
          if (clientError) {
            console.error('Error fetching client data:', clientError);
            continue;
          }
          
          // Format the date for display
          const startTime = new Date(appointment.start_time);
          const endTime = new Date(appointment.end_time);
          
          // Calculate duration in minutes
          const durationMs = endTime.getTime() - startTime.getTime();
          const durationMinutes = Math.floor(durationMs / (1000 * 60));
          
          formattedAppointments.push({
            id: appointment.id,
            client: {
              full_name: clientData.full_name || 'Unknown Client',
              id: clientData.id
            },
            date: startTime.toISOString().split('T')[0],
            time: startTime.toTimeString().substring(0, 5),
            duration: durationMinutes,
            type: appointment.session_type === 'video' ? 'video' : 'chat',
            status: appointment.status as "confirmed" | "pending" | "completed" | "cancelled",
            notes: appointment.notes,
            start_time: appointment.start_time,
            end_time: appointment.end_time,
          });
        }
        
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error Loading Appointments",
          description: "There was an error loading your appointments.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, [user, toast]);

  // Filter appointments for the selected date
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };
  
  const todaysAppointments = date 
    ? appointments.filter(app => app.date === formatDate(date))
    : [];

  // Appointments for list view by status
  const confirmedAppointments = appointments.filter(app => app.status === "confirmed");
  const pendingAppointments = appointments.filter(app => app.status === "pending");
  
  const formatAppointmentTime = (time: string, duration: number) => {
    const [hours, minutes] = time.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(hours), parseInt(minutes));
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    const startFormatted = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endFormatted = endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  // Handle appointment status update
  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      // Update local state
      setAppointments(appointments.map(appointment => 
        appointment.id === appointmentId 
          ? {...appointment, status: newStatus as "confirmed" | "pending" | "completed" | "cancelled"} 
          : appointment
      ));
      
      toast({
        title: "Appointment Updated",
        description: `Appointment status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error Updating Appointment",
        description: "There was an error updating the appointment status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 text-thera-600 animate-spin mb-4" />
        <p className="text-lg">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming client sessions.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setView(view === "calendar" ? "list" : "calendar")}>
            {view === "calendar" ? "List View" : "Calendar View"}
          </Button>
          <Button asChild>
            <Link to="/therapist/appointments/new">
              <CalendarIcon className="mr-2 h-4 w-4" /> New Appointment
            </Link>
          </Button>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {date?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todaysAppointments.map(appointment => (
                    <div 
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          appointment.type === 'video' ? 'bg-thera-100 text-thera-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {appointment.type === 'video' ? 
                            <Video className="h-5 w-5" /> : 
                            <MessageSquare className="h-5 w-5" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{appointment.client.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatAppointmentTime(appointment.time, appointment.duration)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 'outline'}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive"
                              onClick={() => handleUpdateStatus(appointment.id, "cancelled")}>
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No appointments scheduled</h3>
                  <p className="text-muted-foreground mt-1">You don't have any appointments for this day.</p>
                  <Button className="mt-4" asChild>
                    <Link to="/therapist/appointments/new">
                      Schedule an Appointment
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
          
          <TabsContent value="upcoming" className="space-y-4">
            {confirmedAppointments.length > 0 ? (
              confirmedAppointments.map(appointment => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${
                          appointment.type === 'video' ? 'bg-thera-100' : 'bg-blue-100'
                        }`}>
                          {appointment.type === 'video' ? (
                            <Video className="h-6 w-6 text-thera-600" />
                          ) : (
                            <MessageSquare className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{appointment.client.full_name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <Clock className="h-4 w-4 ml-3 mr-1" />
                            <span>{formatAppointmentTime(appointment.time, appointment.duration)}</span>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm mt-2">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        {appointment.type === 'video' ? (
                          <Button 
                            variant="default" 
                            className="bg-thera-600 hover:bg-thera-700"
                            asChild
                          >
                            <Link to={`/video-chat/${appointment.id}`}>
                              <Video className="h-4 w-4 mr-2" /> 
                              Start Video Session
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="default" className="bg-blue-600" asChild>
                            <Link to={`/chat/${appointment.id}`}>
                              <MessageSquare className="h-4 w-4 mr-2" /> Open Chat
                            </Link>
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={`/therapist/clients?clientId=${appointment.client.id}`}>
                                View Client Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Appointment</DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/therapist/session-notes?appointmentId=${appointment.id}`}>
                                Add Session Notes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive"
                              onClick={() => handleUpdateStatus(appointment.id, "cancelled")}>
                              Cancel Appointment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No upcoming appointments</h3>
                <p className="text-muted-foreground mt-1">You don't have any confirmed appointments scheduled.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {pendingAppointments.length > 0 ? (
              pendingAppointments.map(appointment => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${
                          appointment.type === 'video' ? 'bg-thera-100' : 'bg-blue-100'
                        }`}>
                          {appointment.type === 'video' ? (
                            <Video className="h-6 w-6 text-thera-600" />
                          ) : (
                            <MessageSquare className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{appointment.client.full_name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <Clock className="h-4 w-4 ml-3 mr-1" />
                            <span>{formatAppointmentTime(appointment.time, appointment.duration)}</span>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm mt-2">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        <Button 
                          variant="default" 
                          className="bg-green-600"
                          onClick={() => handleUpdateStatus(appointment.id, "confirmed")}
                        >
                          <Check className="h-4 w-4 mr-2" /> Confirm
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-destructive text-destructive"
                          onClick={() => handleUpdateStatus(appointment.id, "cancelled")}
                        >
                          <X className="h-4 w-4 mr-2" /> Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No pending appointments</h3>
                <p className="text-muted-foreground mt-1">You don't have any pending appointment requests.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            {appointments.filter(app => app.status === "completed").length > 0 ? (
              appointments.filter(app => app.status === "completed").map(appointment => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-lg bg-gray-100">
                          {appointment.type === 'video' ? (
                            <Video className="h-6 w-6 text-gray-600" />
                          ) : (
                            <MessageSquare className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{appointment.client.full_name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <Clock className="h-4 w-4 ml-3 mr-1" />
                            <span>{formatAppointmentTime(appointment.time, appointment.duration)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <Button 
                          variant="outline" 
                          asChild
                          className="mr-2"
                        >
                          <Link to={`/therapist/session-notes?appointmentId=${appointment.id}`}>
                            <FileText className="h-4 w-4 mr-2" /> View Notes
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No past appointments</h3>
                <p className="text-muted-foreground mt-1">Past appointments will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default TherapistAppointments;
