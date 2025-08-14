
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users as UsersIcon, Loader2, MessageCircle, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

const FriendClients = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clients, isLoading } = useQuery({
    queryKey: ["friend-clients-list", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: appointments, error: apptError } = await supabase
        .from("booking_requests")
        .select("client_id")
        .eq("therapist_id", user.id);
      
      if (apptError) throw apptError;

      const clientIds = [...new Set(appointments.map(a => a.client_id))];

      if (clientIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", clientIds);

      if (profileError) throw profileError;
      return profiles || [];
    },
    enabled: !!user?.id,
  });

  const filteredClients = clients?.filter(client =>
    client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Clients</h2>
        <p className="text-muted-foreground mt-2">
          View and manage the people you're supporting as a Friend.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients by name or email..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : filteredClients && filteredClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={client.profile_image_url} alt={client.full_name} />
                  <AvatarFallback>{getInitials(client.full_name || "C")}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{client.full_name}</h3>
                <p className="text-sm text-muted-foreground">{client.email}</p>
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/friend/messages?clientId=${client.id}`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/video/${client.id}`}>
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 bg-muted/40 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <UsersIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No clients yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            You don't have any clients at the moment. When someone connects with you, they'll appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendClients;
