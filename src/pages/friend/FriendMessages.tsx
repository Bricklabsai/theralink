
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Video, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}



 const FriendMessages = () => {
  const { user } = useAuth(); // Friend is logged in
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [message, setMessage] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    searchParams.get('clientId') || null
  ); // Target client

  // Fetch clients for the friend
  const { data: clientsRaw } = useQuery({
  queryKey: ["friend-clients", user?.id],
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

const clients = Array.isArray(clientsRaw) ? clientsRaw : [];



  // Fetch messages between this friend and the selected client
  const { data: messages = [], refetch, isLoading } = useQuery({
    queryKey: ["friend-messages-list", user?.id, selectedClientId],
    queryFn: async () => {
      if (!user?.id || !selectedClientId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedClientId}),and(sender_id.eq.${selectedClientId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!selectedClientId,
  });

  // Send new message to the selected client
  const handleSend = async () => {
    if (!message.trim() || !selectedClientId) {
      toast({
        title: "Cannot send message",
        description: "Client not selected or message is empty.",
        variant: "destructive",
      });
      return;
    }

    setSendLoading(true);

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: selectedClientId,
        content: message.trim(),
      },
    ]);

    setSendLoading(false);

    if (!error) {
      setMessage("");
      refetch();
    } else {
      toast({
        title: "Failed to send",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
<div className="flex h-[calc(100vh-100px)] gap-4 mx-auto max-w-7xl">
      {/* Client List Sidebar */}
      <div className="w-1/3 border-r">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={`p-3 cursor-pointer hover:bg-accent transition-colors flex items-center gap-3 ${
                    selectedClientId === client.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedClientId(client.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={client.profile_image_url} alt={client.full_name} />
                    <AvatarFallback>
                      {client.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{client.full_name}</p>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  </div>
                </div>
              ))}
              {clients.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No clients yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        {selectedClientId ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedClient?.profile_image_url} alt={selectedClient?.full_name} />
                    <AvatarFallback>
                      {selectedClient?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedClient?.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Online</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => navigate(`/video/${selectedClientId}`)}
                >
                  <Video className="h-4 w-4" />
                  Video Call
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[400px]">
                {isLoading ? (
                  <div className="text-center p-4">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  messages.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`p-3 rounded-lg max-w-xs ${
                          msg.sender_id === user.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {msg.content}
                        <div className="text-xs mt-1 opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form
                className="flex gap-2"
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <Input
                  placeholder="Type your message..."
                  value={message}
                  disabled={sendLoading || !selectedClientId}
                  onChange={e => setMessage(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={sendLoading || !message.trim() || !selectedClientId}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a client to start messaging</h3>
              <p className="text-muted-foreground">Choose a client from the list to begin your conversation</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FriendMessages;
