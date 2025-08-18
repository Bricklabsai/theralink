
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  RefreshCw, 
  Calendar, 
  Clock, 
  User, 
  FileEdit, 
  Trash2, 
  Eye, 
  Loader2,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [therapistData, setTherapistData] = useState<any>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (profile && profile.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    fetchAppointments();
  }, [profile, navigate, toast]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: false });
      
      // Apply date range filter if set
      if (dateRange?.from) {
        query = query.gte('start_time', dateRange.from.toISOString());
      }
      
      if (dateRange?.to) {
        query = query.lte('start_time', dateRange.to.toISOString());
      }
      
      // Apply status filter if set
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters when they change
  useEffect(() => {
    fetchAppointments();
  }, [dateRange, statusFilter]);

  const handleViewAppointment = async (appointment: any) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
    
    try {
      // Fetch client data
      const { data: clientData, error: clientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', appointment.client_id)
        .single();
      
      if (clientError) throw clientError;
      setClientData(clientData);
      
      // Fetch therapist data
      const { data: therapistData, error: therapistError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', appointment.therapist_id)
        .single();
      
      if (therapistError) throw therapistError;
      setTherapistData(therapistData);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointment details',
        variant: 'destructive',
      });
    }
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setEditNotes(appointment.notes || '');
    setEditStatus(appointment.status);
    setEditDialogOpen(true);
  };

  const updateAppointment = async () => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          notes: editNotes,
          status: editStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedAppointment.id);
      
      if (error) throw error;
      
      toast({
        title: 'Appointment Updated',
        description: 'Appointment details have been successfully updated',
      });
      
      setEditDialogOpen(false);
      fetchAppointments();
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update appointment',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      toast({
        title: 'Appointment Deleted',
        description: 'Appointment has been successfully deleted',
      });
      
      fetchAppointments();
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete appointment',
        variant: 'destructive',
      });
    }
  };

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => 
    appointment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.therapist_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Confirmed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      case 'no-show':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">No Show</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange(undefined);
    fetchAppointments();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Appointments Management</h1>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 justify-between items-start md:items-center mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search appointments..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-full md:w-auto"
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={clearFilters}
          >
            <RefreshCw className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>
            {filteredAppointments.length} appointments found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Therapist ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                      <p className="mt-2 text-gray-500">Loading appointments...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <p className="text-gray-500">No appointments found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800 capitalize">
                          {appointment.session_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-500" />
                            {new Date(appointment.start_time).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500 text-sm">
                            <Clock className="h-3 w-3" />
                            {new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {" - "}
                            {new Date(appointment.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {appointment.client_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {appointment.therapist_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Appointment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View complete information about this appointment
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Session Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Session Type:</span>
                      <span className="capitalize">{selectedAppointment.session_type}</span>
                      
                      <span className="text-gray-500">Status:</span>
                      <span>{getStatusBadge(selectedAppointment.status)}</span>
                      
                      <span className="text-gray-500">Date:</span>
                      <span>{new Date(selectedAppointment.start_time).toLocaleDateString()}</span>
                      
                      <span className="text-gray-500">Time:</span>
                      <span>
                        {new Date(selectedAppointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {" - "}
                        {new Date(selectedAppointment.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      <span className="text-gray-500">Duration:</span>
                      <span>
                        {Math.round(
                          (new Date(selectedAppointment.end_time).getTime() - 
                           new Date(selectedAppointment.start_time).getTime()) / 
                          (1000 * 60)
                        )} minutes
                      </span>
                    </div>
                  </div>
                  
                  {selectedAppointment.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Session Notes</h3>
                      <p className="text-sm bg-gray-50 p-3 rounded border">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {clientData && (
                    <div>
                      <h3 className="font-semibold mb-2">Client</h3>
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarImage src={clientData.profile_image_url} />
                          <AvatarFallback>{getInitials(clientData.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{clientData.full_name}</div>
                          <div className="text-sm text-gray-500">{clientData.email}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {therapistData && (
                    <div>
                      <h3 className="font-semibold mb-2">Therapist</h3>
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarImage src={therapistData.profile_image_url} />
                          <AvatarFallback>{getInitials(therapistData.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{therapistData.full_name}</div>
                          <div className="text-sm text-gray-500">{therapistData.email}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold mb-2">Appointment IDs</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <span className="text-gray-500">Appointment ID:</span>
                      <span className="font-mono text-xs overflow-auto">{selectedAppointment.id}</span>
                      
                      {selectedAppointment.payment_id && (
                        <>
                          <span className="text-gray-500">Payment ID:</span>
                          <span className="font-mono text-xs overflow-auto">{selectedAppointment.payment_id}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setViewDialogOpen(false);
                  handleEditAppointment(selectedAppointment);
                }}>
                  Edit Appointment
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update the status and notes for this appointment
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger id="status">e
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Session Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any notes about this session..."
                    value={editNotes || ''}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateAppointment}>
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAppointments;
