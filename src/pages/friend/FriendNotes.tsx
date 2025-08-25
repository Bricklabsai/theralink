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
    const { data, error } = await supabase
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

      const { error } = await supabase.from("booking_notes").insert([
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
    onError: (err: Error) => {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Booking Notes</h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Keep track of your notes for client booking requests.
          </p>
        </div>

        {/* ✅ Dialog for new note */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center w-full sm:w-auto">
              <Plus className="mr-1 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Add New Booking Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Select Booking Request */}
              <Select
                value={bookingRequestId}
                onValueChange={setBookingRequestId}
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Select booking request" />
                </SelectTrigger>
                <SelectContent>
                  {bookingRequests.map((req) => (
                    <SelectItem key={req.id} value={req.id} className="text-sm sm:text-base">
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
                className="text-sm sm:text-base"
              />

              {/* Content */}
              <Textarea
                placeholder="Write your note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="text-sm sm:text-base min-h-[100px]"
              />

              <Button
                onClick={() => addNoteMutation.mutate()}
                disabled={addNoteMutation.isPending}
                className="w-full sm:w-auto"
              >
                Save Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Notes Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Find Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notes..."
                className="pl-8 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="w-full sm:w-auto mt-2 sm:mt-0">Search</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center p-6 text-muted-foreground">
          Loading notes...
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center border rounded-lg p-6 sm:p-12 bg-muted/40">
          <div className="rounded-full bg-primary/10 p-3 sm:p-4">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h3 className="mt-3 text-base sm:text-lg font-medium">No notes yet</h3>
          <p className="text-muted-foreground text-center mt-1 text-xs sm:text-sm max-w-sm">
            You haven't created any booking notes yet. Start by creating one for
            a client request.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg line-clamp-2">
                  {note.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base line-clamp-4">{note.content}</p>
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
