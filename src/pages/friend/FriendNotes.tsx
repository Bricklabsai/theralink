import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const FriendNotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [clientId, setClientId] = useState(""); // Could be selected from your client list

  // Fetch notes for this therapist
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("session_notes")
        .select("*")
        .eq("therapist_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !noteContent.trim() || !clientId) {
        throw new Error("Missing content or client");
      }
      const { error } = await supabase.from("session_notes").insert([
        {
          therapist_id: user.id,
          client_id: clientId,
          content: noteContent.trim(),
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Note saved successfully" });
      setNoteContent("");
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
    },
    onError: (err: any) => {
      toast({
        title: "Error saving note",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Notes</h2>
          <p className="text-muted-foreground mt-2">
            Keep track of your sessions and progress with clients.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Client ID (link to a dropdown in production)"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
              <Textarea
                placeholder="Write your session note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <Button
                onClick={() => addNoteMutation.mutate()}
                disabled={addNoteMutation.isLoading}
              >
                Save Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div>Loading notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center border rounded-lg p-12 bg-muted/40">
          <div className="rounded-full bg-primary/10 p-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No notes yet</h3>
          <p className="text-muted-foreground text-center mt-2 max-w-sm">
            You haven't created any session notes yet. Start by creating a new note for one of your sessions.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>Client: {note.client_id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{note.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendNotes;
