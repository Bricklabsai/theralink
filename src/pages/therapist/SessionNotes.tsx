import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Edit, Save, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface SessionNote {
  id: string;
  appointment_id: string;
  client_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
  appointment_date?: string;
}

interface Appointment {
  id: string;
  client_id: string;
  start_time: string;
  status: string;
  client_name?: string;
  hasNote: boolean;
}

const SessionNotes = () => {
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<SessionNote | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', appointment_id: '' });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchNotesAndAppointments();
  }, [user]);

  const fetchNotesAndAppointments = async () => {
    if (!user) return;

    try {
      // Fetch session notes
      const { data: notesData, error: notesError } = await supabase
        .from('session_notes')
        .select('*')
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      // Fetch completed appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', user.id)
        .eq('status', 'confirmed')
        .order('start_time', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Get client names for each appointment/note
      const processedNotes: SessionNote[] = [];
      const processedAppointments: Appointment[] = [];

      if (notesData) {
        for (const note of notesData) {
          const { data: clientData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', note.client_id)
            .single();

          const { data: appointmentData } = await supabase
            .from('appointments')
            .select('start_time')
            .eq('id', note.appointment_id)
            .single();

          processedNotes.push({
            ...note,
            client_name: clientData?.full_name || 'Unknown Client',
            appointment_date: appointmentData?.start_time
          });
        }
      }

      if (appointmentsData) {
        for (const appointment of appointmentsData) {
          const { data: clientData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', appointment.client_id)
            .single();

          const hasNote = notesData?.some(note => note.appointment_id === appointment.id) || false;

          processedAppointments.push({
            ...appointment,
            client_name: clientData?.full_name || 'Unknown Client',
            hasNote
          });
        }
      }

      setNotes(processedNotes);
      setAppointments(processedAppointments);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session notes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!user || !formData.title || !formData.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (selectedNote) {
        // Update existing note
        const { error } = await supabase
          .from('session_notes')
          .update({
            title: formData.title,
            content: formData.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedNote.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Session note updated successfully',
        });
      } else {
        // Create new note
        const appointment = appointments.find(a => a.id === formData.appointment_id);
        if (!appointment) {
          toast({
            title: 'Error',
            description: 'Please select an appointment',
            variant: 'destructive',
          });
          return;
        }

        const { error } = await supabase
          .from('session_notes')
          .insert({
            appointment_id: formData.appointment_id,
            therapist_id: user.id,
            client_id: appointment.client_id,
            title: formData.title,
            content: formData.content
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Session note created successfully',
        });
      }

      setIsDialogOpen(false);
      setSelectedNote(null);
      setFormData({ title: '', content: '', appointment_id: '' });
      fetchNotesAndAppointments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = (appointmentId?: string) => {
    setIsCreating(true);
    setSelectedNote(null);
    setFormData({ 
      title: '', 
      content: '', 
      appointment_id: appointmentId || '' 
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (note: SessionNote) => {
    setIsCreating(false);
    setSelectedNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      appointment_id: note.appointment_id
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading session notes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session Notes</h1>
          <p className="text-muted-foreground">Document your therapy sessions and track client progress</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openCreateDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {isCreating ? 'Create Session Note' : 'Edit Session Note'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isCreating && (
                <div>
                  <Label htmlFor="appointment">Appointment</Label>
                  <select
                    id="appointment"
                    value={formData.appointment_id}
                    onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select an appointment</option>
                    {appointments.filter(a => !a.hasNote).map(appointment => (
                      <option key={appointment.id} value={appointment.id}>
                        {appointment.client_name} - {format(new Date(appointment.start_time), 'MMM dd, yyyy h:mm a')}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Session title or summary"
                />
              </div>
              <div>
                <Label htmlFor="content">Notes</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Session notes, observations, goals, progress..."
                  rows={8}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNote}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Appointments without notes */}
      {appointments.filter(a => !a.hasNote).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Appointments Needing Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {appointments.filter(a => !a.hasNote).map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{appointment.client_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.start_time), 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => openCreateDialog(appointment.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Note
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing notes */}
      <div className="grid gap-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No session notes yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete appointments will appear here for you to add notes
              </p>
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{note.client_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {note.appointment_date 
                            ? format(new Date(note.appointment_date), 'MMM dd, yyyy')
                            : format(new Date(note.created_at), 'MMM dd, yyyy')
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(note)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                <div className="mt-4 text-xs text-muted-foreground">
                  Last updated: {format(new Date(note.updated_at), 'MMM dd, yyyy h:mm a')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionNotes;
