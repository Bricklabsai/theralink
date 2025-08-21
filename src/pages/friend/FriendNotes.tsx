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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FriendNotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [bookingRequestId, setBookingRequestId] = useState("");

  // ✅ fetch therapist’s booking requests
  const { data: bookingRequests = [] } = useQuery({
    queryKey: ["booking_requests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("booking_requests")
        .select("id, requested_date, client_id")
        .eq("therapist_id", user.id)
        .order("requested_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // ✅ fetch therapist’s notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["booking_notes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
    const { data, error } = await (supabase as any)
  .from("booking_notes")
  .select("*")
  .eq("therapist_id", user.id)
  .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // ✅ add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !noteContent.trim() || !bookingRequestId) {
        throw new Error("Missing title, content, or booking request");
      }

      // fetch client_id from the booking_requests table
      const { data: booking, error: bookingError } = await supabase
        .from("booking_requests")
        .select("client_id")
        .eq("id", bookingRequestId)
        .single();

      if (bookingError) throw bookingError;

      const { error } = await (supabase as any).from("booking_notes").insert([
        {
          therapist_id: user.id,
          client_id: booking.client_id, // ✅ add client_id
          booking_request_id: bookingRequestId, // ✅ correct field
          title: noteTitle.trim(),
          content: noteContent.trim(),
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Note saved successfully" });
      setNoteTitle("");
      setNoteContent("");
      setBookingRequestId("");
      queryClient.invalidateQueries({ queryKey: ["booking_notes", user?.id] });
    },
    onError: (err: any) => {
      toast({
        title: "Error saving note",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const filteredNotes = notes.filter(
    (note) =>
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Booking Notes</h2>
          <p className="text-muted-foreground mt-2">
            Keep track of your notes for client booking requests.
          </p>
        </div>

        {/* ✅ Dialog for new note */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Booking Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Select Booking Request */}
              <Select
                value={bookingRequestId}
                onValueChange={setBookingRequestId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select booking request" />
                </SelectTrigger>
                <SelectContent>
                  {bookingRequests.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {`Request: ${req.id} — ${new Date(
                        req.requested_date
                      ).toLocaleString()}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Title */}
              <Input
                placeholder="Note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />

              {/* Content */}
              <Textarea
                placeholder="Write your note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />

              <Button
                onClick={() => addNoteMutation.mutate()}
                disabled={(addNoteMutation as any).isLoading}
              >
                Save Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Notes Display */}
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
            You haven't created any booking notes yet. Start by creating one for
            a client request.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{note.content}</p>
                {/* <p className="text-xs text-muted-foreground mt-2">
                  Request ID: {note.booking_request_id}
                </p> */}
                <p className="text-xs text-muted-foreground mt-1">
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
