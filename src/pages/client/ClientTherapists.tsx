import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, MapPin, Clock, Filter, Calendar, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Therapist {
  id: string;
  full_name: string;
  email: string;
  profile_image_url?: string;
  location?: string;
  bio?: string;
  specialization?: string;
  years_experience?: number;
  hourly_rate?: number;
  rating?: number;
  availability?: any;
  therapist_details?: {
    license_type?: string;
    therapy_approaches?: string[];
    languages?: string[];
    session_formats?: string[];
    is_verified: boolean;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const ClientTherapists = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [sortBy, setSortBy] = useState("all");
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock available time slots - in a real app, this would come from the therapist's availability
  const availableSlots: TimeSlot[] = [
    { time: "09:00", available: true },
    { time: "10:00", available: false },
    { time: "11:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: false },
  ];

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      setLoading(true);

      // 1. Get all therapists
      const { data: therapistsData, error: therapistsError } = await supabase
        .from('therapists')
        .select(`
          id,
          bio,
          specialization,
          years_experience,
          hourly_rate,
          rating,
          availability
        `);

      if (therapistsError) throw therapistsError;
      console.log('therapistsData:', therapistsData);

      // 2. Get therapist IDs
      const therapistIds = therapistsData?.map((t: any) => t.id) || [];
      console.log('therapistIds:', therapistIds);

      if (!therapistIds.length) {
        setTherapists([]);
        setLoading(false);
        return;
      }

      // 3. Get profiles for those therapists with role 'therapist'
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          profile_image_url,
          location,
          role
        `)
        .in('id', therapistIds)
        .eq('role', 'therapist');
      if (profilesError) throw profilesError;
      console.log('profilesData:', profilesData);

      // 4. Get therapist details (now in therapists table)
      const { data: detailsData, error: detailsError } = await supabase
        .from('therapists')
        .select(`
          id,
          license_type,
          therapy_approaches,
          languages,
          session_formats,
          is_verified
        `)
        .in('id', therapistIds);

      if (detailsError) throw detailsError;
      console.log('detailsData:', detailsData);

      // Merge all by id, and DO NOT filter by is_verified for debugging
      const mergedTherapists: Therapist[] =
        therapistsData
          ?.map((therapist: any) => {
            const profile = profilesData?.find((p: any) => p.id === therapist.id);
            const details = detailsData?.find((d: any) => d.id === therapist.id);

            // If missing a profile skip this therapist (must have matching profile)
            if (!profile) return null;

            return {
              id: therapist.id,
              full_name: profile.full_name,
              email: profile.email,
              profile_image_url: profile.profile_image_url,
              location: profile.location,
              bio: therapist.bio,
              specialization: therapist.specialization,
              years_experience: therapist.years_experience,
              hourly_rate: therapist.hourly_rate,
              rating: therapist.rating || 4.5,
              availability: therapist.availability,
              therapist_details: details
                ? {
                    license_type: details.license_type,
                    therapy_approaches: details.therapy_approaches,
                    languages: details.languages,
                    session_formats: details.session_formats,
                    is_verified: details.is_verified || false,
                  }
                : undefined,
            } as Therapist;
          })
          .filter(Boolean) || [];

      console.log('mergedTherapists:', mergedTherapists);

      setTherapists(mergedTherapists);

    } catch (error) {
      console.error('Error fetching therapists:', error);
      toast({
        title: "Error",
        description: "Failed to load therapists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async () => {
    if (!user || !selectedTherapist || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your session.",
        variant: "destructive",
      });
      return;
    }

    setBookingLoading(true);
    try {
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour session

      const { error } = await supabase
        .from('appointments')
        .insert({
          client_id: user.id,
          therapist_id: selectedTherapist.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          session_type: 'therapy',
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Session Booked!",
        description: "Your therapy session has been successfully scheduled.",
      });

      // Reset selection
      setSelectedTherapist(null);
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book your session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = !searchQuery || 
      therapist.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialization = specialization === "all" || 
      therapist.specialization?.toLowerCase().includes(specialization.toLowerCase());
    
    return matchesSearch && matchesSpecialization;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Find Therapists</h1>
          <p className="text-muted-foreground mt-2">Loading verified therapists...</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show number of therapists fetched */}
      <div>
        <h1 className="text-3xl font-bold">Find Therapists</h1>
        <p className="text-muted-foreground mt-2">
          {therapists.length} therapist(s) loaded. Discover qualified therapists that match your needs and preferences.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search therapists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                <SelectItem value="anxiety">Anxiety & Depression</SelectItem>
                <SelectItem value="relationships">Relationship Counseling</SelectItem>
                <SelectItem value="trauma">Trauma Therapy</SelectItem>
                <SelectItem value="addiction">Addiction Recovery</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Default</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="experience">Most Experience</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Therapist List */}
      <div className="grid gap-6">
        {filteredTherapists.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No therapists found</h3>
              <p className="text-muted-foreground">
                No (filtered) therapists match your current search criteria. <br />
                (Debug: therapists loaded: {therapists.length})
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTherapists.map((therapist) => (
            <Card key={therapist.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Avatar className="h-24 w-24">
                    {therapist.profile_image_url ? (
                      <AvatarImage src={therapist.profile_image_url} />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {therapist.full_name
                          ? therapist.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : "T"}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{therapist.full_name}</h3>
                        {therapist.specialization && (
                          <Badge variant="secondary" className="mt-1">
                            {therapist.specialization}
                          </Badge>
                        )}
                        {/* Show verification status */}
                        {therapist.therapist_details?.is_verified ? (
                          <Badge variant="outline" className="mt-1 ml-2">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="mt-1 ml-2">
                            Not Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          ${therapist.hourly_rate || 100}
                        </p>
                        <p className="text-sm text-muted-foreground">per session</p>
                      </div>
                    </div>

                    <p className="text-muted-foreground">
                      {therapist.bio || "Professional therapist dedicated to helping clients achieve their mental health goals."}
                    </p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{therapist.rating}</span>
                        <span className="text-muted-foreground">(Reviews)</span>
                      </div>
                      
                      {therapist.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{therapist.location}</span>
                        </div>
                      )}
                      
                      {therapist.years_experience && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{therapist.years_experience} years experience</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link to={`/therapists/${therapist.id}`}>View Profile</Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <Link to={`/therapists/${therapist.id}/book`}>
                          
                               Book Session
                           
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
export default ClientTherapists;
