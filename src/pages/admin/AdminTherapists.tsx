
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserCog, 
  Users, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  DollarSign,
  Star,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TherapistDetailsModal } from '@/components/admin/TherapistDetailsModal';
import { TherapistAppointmentsModal } from '@/components/admin/TherapistAppointmentsModal';
import { TherapistEarningsModal } from '@/components/admin/TherapistEarningsModal';
import { SendEmailModal } from '@/components/admin/SendEmailModal';

interface TherapistAdmin {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  profile_image_url?: string;
  created_at: string;
  bio?: string;
  specialization?: string;
  years_experience?: number;
  hourly_rate?: number;
  rating?: number;
  preferred_currency?: string;
  license_number?: string;
  license_type?: string;
  therapy_approaches?: string[];
  languages?: string[];
  application_status?: string;
  is_verified?: boolean;
  has_insurance?: boolean;
  insurance_info?: string;
  session_formats?: string[];
  is_community_therapist?: boolean;
  availability?: any;
}

const AdminTherapists = () => {
  const [therapists, setTherapists] = useState<TherapistAdmin[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<TherapistAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistAdmin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false);
  const [isEarningsModalOpen, setIsEarningsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTherapists();
  }, []);

  useEffect(() => {
    filterTherapists();
  }, [therapists, searchTerm, statusFilter]);

  const fetchTherapists = async () => {
    try {
      // Fetch therapist data with profile information
      const { data: therapistData, error: therapistError } = await supabase
        .from('therapists')
        .select(`
          *,
          profiles!inner(full_name, email, profile_image_url, phone, location)
        `);

      if (therapistError) throw therapistError;

      // Transform data to match TherapistAdmin interface
      const transformedData = therapistData.map(therapist => ({
        ...therapist,
        full_name: therapist.profiles?.full_name || 'Unknown',
        email: therapist.profiles?.email || '',
        profile_image_url: therapist.profiles?.profile_image_url,
        phone: therapist.profiles?.phone,
        location: therapist.profiles?.location
      }));

      setTherapists(transformedData);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      toast({
        title: "Error",
        description: "Failed to fetch therapists data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTherapists = () => {
    let filtered = therapists;

    if (searchTerm) {
      filtered = filtered.filter(therapist =>
        therapist.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(therapist => {
        switch (statusFilter) {
          case 'verified':
            return therapist.is_verified;
          case 'pending':
            return therapist.application_status === 'pending';
          case 'active':
            return therapist.is_verified && therapist.license_number;
          default:
            return true;
        }
      });
    }

    setFilteredTherapists(filtered);
  };

  const getStatusBadge = (therapist: TherapistAdmin) => {
    if (therapist.is_verified) {
      return <Badge variant="default" className="bg-green-500 text-white border-green-500">Verified</Badge>;
    } else if (therapist.application_status === 'pending') {
      return <Badge variant="secondary" className="bg-yellow-500 text-white border-yellow-500">Pending</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-500 text-white border-red-500">Unverified</Badge>;
    }
  };

  const updateTherapistStatus = async (therapistId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('therapists')
        .update({ 
          is_verified: isVerified,
          application_status: isVerified ? 'approved' : 'rejected'
        })
        .eq('id', therapistId);

      if (error) throw error;

      // Update local state
      setTherapists(prevState =>
        prevState.map(therapist => 
          therapist.id === therapistId 
            ? { ...therapist, is_verified: isVerified, application_status: isVerified ? 'approved' : 'rejected' } 
            : therapist
        )
      );

      toast({
        title: "Success",
        description: `Therapist ${isVerified ? 'verified' : 'unverified'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating therapist status:', error);
      toast({
        title: "Error",
        description: "Failed to update therapist status.",
        variant: "destructive",
      });
    }
  };

  const openTherapistDetails = (therapist: TherapistAdmin) => {
    setSelectedTherapist(therapist);
    setIsModalOpen(true);
  };

  const openAppointments = (therapist: TherapistAdmin) => {
    setSelectedTherapist(therapist);
    setIsAppointmentsModalOpen(true);
  };

  const openEarnings = (therapist: TherapistAdmin) => {
    setSelectedTherapist(therapist);
    setIsEarningsModalOpen(true);
  };

  const openSendEmail = (therapist: TherapistAdmin) => {
    setSelectedTherapist(therapist);
    setIsEmailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTherapist(null);
  };

  const closeAppointmentsModal = () => {
    setIsAppointmentsModalOpen(false);
    setSelectedTherapist(null);
  };

  const closeEarningsModal = () => {
    setIsEarningsModalOpen(false);
    setSelectedTherapist(null);
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setSelectedTherapist(null);
  };

  const handleStatusUpdate = () => {
    fetchTherapists();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-spacing-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Therapist Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage therapists, verify credentials, and monitor activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 text-xs sm:text-sm">
            <UserCog className="h-3 w-3" />
            {therapists.length} Total Therapists
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Therapists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{therapists.length}</div>
            <p className="text-xs text-muted-foreground">Registered therapists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {therapists.filter(t => t.is_verified).length}
            </div>
            <p className="text-xs text-muted-foreground">Active & verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {therapists.filter(t => t.application_status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {therapists.filter(t => {
                const createdDate = new Date(t.created_at);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() && 
                       createdDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">New applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search therapists by name, email, specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Therapists</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Therapists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Therapist Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTherapists.map((therapist) => (
              <div key={therapist.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-muted/50 space-y-4 sm:space-y-0">
                <div className="flex items-start sm:items-center space-x-4 flex-1">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={therapist.profile_image_url} />
                    <AvatarFallback>
                      {therapist.full_name?.split(' ').map(n => n[0]).join('') || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-medium text-sm sm:text-base truncate">{therapist.full_name || 'No name provided'}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(therapist)}
                        {therapist.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-muted-foreground">{therapist.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{therapist.email}</span>
                      </div>
                      {therapist.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{therapist.phone}</span>
                        </div>
                      )}
                      {therapist.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{therapist.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      {therapist.specialization && (
                        <span className="truncate"><strong>Specialization:</strong> {therapist.specialization}</span>
                      )}
                      {therapist.years_experience && (
                        <span><strong>Experience:</strong> {therapist.years_experience} years</span>
                      )}
                      {(therapist.hourly_rate || therapist.hourly_rate === 0) && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 flex-shrink-0" />
                          <span>
                            {therapist.hourly_rate === 0 ? 'Free' : `${therapist.hourly_rate} ${therapist.preferred_currency || 'KSH'}`}
                          </span>
                        </div>
                      )}
                    </div>
                    {therapist.license_type && (
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        <strong>License:</strong> {therapist.license_type} - {therapist.license_number}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-2 sm:ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTherapistDetails(therapist)}
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                  
                  {!therapist.is_verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTherapistStatus(therapist.id, true)}
                      className="text-green-600 border-green-600 hover:bg-green-50 text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Verify
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="px-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openTherapistDetails(therapist)}>
                        View Full Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openSendEmail(therapist)}>
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openAppointments(therapist)}>
                        View Appointments
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEarnings(therapist)}>
                        View Earnings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {therapist.is_verified ? (
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => updateTherapistStatus(therapist.id, false)}
                        >
                          Revoke Verification
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          className="text-green-600"
                          onClick={() => updateTherapistStatus(therapist.id, true)}
                        >
                          Verify Therapist
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            {filteredTherapists.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No therapists found matching your search.' : 'No therapists registered yet.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      
      <TherapistDetailsModal
        therapist={selectedTherapist}
        isOpen={isModalOpen}
        onClose={closeModal}
        onStatusUpdate={handleStatusUpdate}
      />

      <TherapistAppointmentsModal
        therapistId={selectedTherapist?.id || null}
        therapistName={selectedTherapist?.full_name || ''}
        isOpen={isAppointmentsModalOpen}
        onClose={closeAppointmentsModal}
      />

      <TherapistEarningsModal
        therapistId={selectedTherapist?.id || null}
        therapistName={selectedTherapist?.full_name || ''}
        isOpen={isEarningsModalOpen}
        onClose={closeEarningsModal}
      />

      <SendEmailModal
        recipientEmail={selectedTherapist?.email || ''}
        recipientName={selectedTherapist?.full_name || ''}
        isOpen={isEmailModalOpen}
        onClose={closeEmailModal}
      />
    </div>
  );
};

export default AdminTherapists;
