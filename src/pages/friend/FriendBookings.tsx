
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, User, Clock, Loader2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function formatDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function FriendBookings() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["friend-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First fetch booking requests
      const { data: bookings, error: bookingsError } = await supabase
        .from("booking_requests")
        .select("*")
        .eq("therapist_id", user.id)
        .order("start_time", { ascending: false });

      if (bookingsError) throw bookingsError;
      if (!bookings || bookings.length === 0) return [];

      // Get all unique client IDs
      const clientIds = [...new Set(bookings.map((b) => b.client_id))];

      // Fetch all client profiles in one go
      const { data: clients, error: clientsError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", clientIds);

      if (clientsError) throw clientsError;

      // Merge client data into bookings
      const mergedData = bookings.map((booking) => ({
        ...booking,
        client: clients.find((c) => c.id === booking.client_id) || null,
      }));

      return mergedData;
    },
    enabled: !!user?.id,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
        <p className="text-muted-foreground mt-2">
          Here are all the upcoming and past sessions with your clients.
        </p>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-8 text-primary">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : data?.length === 0 ? (
        <div className="text-muted-foreground text-center py-12 border-2 border-dashed rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">Clients who book a session with you will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((appt: any) => (
            <Card key={appt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={appt.client?.profile?.profile_image_url} alt={appt.client?.full_name} />
                  <AvatarFallback>{getInitials(appt.client?.full_name || "U")}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{appt.client?.full_name || "Unnamed Client"}</div>
                  <div className="text-sm text-muted-foreground">{appt.client?.email}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(appt.start_time)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 self-stretch justify-between">
                   <Badge variant={appt.status === 'completed' ? 'default' : 'secondary'}>
                    {appt.status}
                  </Badge>
                   <MessageSquare className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}