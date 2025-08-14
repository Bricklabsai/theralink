
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Download, Calendar } from "lucide-react";
import { saveAs } from 'file-saver';

const ClientNotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchNotes = async () => {
      setIsLoading(true);
      try {
    const { data: profile } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', user.id) // Or eq('user_id', user.id) depending on schema
  .single();

const { data, error } = await supabase
  .from('session_notes')
  .select('*')
  .eq('client_id', profile.id)
  .order('created_at', { ascending: false });


  


        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: "Failed to load notes",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [user, toast]);

  const handleOpenNote = (note) => {
    setSelectedNote(note);
    setIsNoteOpen(true);
  };

  const handleCloseNote = () => {
    setIsNoteOpen(false);
  };

  const downloadNote = (note) => {
    const noteContent = `
# ${note.title}
Date: ${new Date(note.created_at).toLocaleDateString()}
Therapist: ${note.profiles?.full_name || 'Unknown therapist'}

${note.content}
    `;
    
    const blob = new Blob([noteContent], {type: "text/plain;charset=utf-8"});
    saveAs(blob, `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
    
    toast({
      title: "Note downloaded",
      description: "Your session note has been downloaded",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Session Notes</h2>
      
      {notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>{note.title}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(note.created_at)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  From: {note.profiles?.full_name || 'Unknown therapist'}
                </p>
                <p className="line-clamp-2 text-sm mt-2">
                  {note.content}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleOpenNote(note)}>
                  View Full Note
                </Button>
                <Button variant="ghost" onClick={() => downloadNote(note)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">No session notes available</p>
        </div>
      )}

      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        {selectedNote && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedNote.title}</DialogTitle>
              <DialogDescription>
                {formatDate(selectedNote.created_at)} • {selectedNote.profiles?.full_name || 'Unknown therapist'}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                {selectedNote.content}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => downloadNote(selectedNote)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default ClientNotes;
