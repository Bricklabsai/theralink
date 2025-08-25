
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
        .order("requested_time", { ascending: false });

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
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">My Bookings</h2>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Here are all the upcoming and past sessions with your clients.
        </p>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-6 sm:p-8 text-primary">
          <Loader2 className="animate-spin h-6 w-6 sm:h-8 sm:w-8" />
        </div>
      ) : data?.length === 0 ? (
        <div className="text-muted-foreground text-center p-6 sm:py-12 border-2 border-dashed rounded-lg">
          <Calendar className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
          <h3 className="mt-3 text-sm sm:text-base font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">Clients who book a session with you will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {data.map((appt: { id: string; client: { profile_image_url?: string; full_name?: string; email?: string } | null; status: string; requested_date: string; }) => (
            <Card key={appt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                    <AvatarImage src={appt.client?.profile_image_url} alt={appt.client?.full_name || "Client"} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {getInitials(appt.client?.full_name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base sm:text-lg truncate">
                      {appt.client?.full_name || "Unnamed Client"}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      {appt.client?.email}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="break-words">{formatDate(appt.requested_date)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-col items-start sm:items-end gap-2 w-full sm:w-auto sm:self-stretch justify-between mt-3 sm:mt-0">
                    <Badge 
                      variant={appt.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs sm:text-sm"
                    >
                      {appt.status}
                    </Badge>
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary cursor-pointer" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}