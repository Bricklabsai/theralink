import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CalendarClock, ChevronLeft, Clock, User, Video, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isAfter, isBefore, isSameDay, parseISO, isValid } from "date-fns";

type AvailabilityDay = {
  day: string;  // e.g. "monday", "tuesday"
  slots: string[];  // e.g. ["10:00", "11:00"]
};

interface BookingTherapist {
  id: string;
  full_name: string;
  profile_image_url: string | null;
  hourly_rate: number;
  specialization: string;
  availability: AvailabilityDay[];
  is_community_therapist: boolean;
  bio: string;
}

const BookingPage = () => {
  const { therapistId } = useParams<{ therapistId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [therapist, setTherapist] = useState<BookingTherapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<'video' | 'chat'>('video');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    const fetchTherapist = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('therapists')
          .select(`
            *,
            profiles!inner (
              id,
              full_name,
              profile_image_url
            )
          `)
          .eq('id', therapistId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Therapist not found');

        // Parse availability data
        let availabilityData: AvailabilityDay[] = [];
        try {
          availabilityData = typeof data.availability === 'string' 
            ? JSON.parse(data.availability) 
            : data.availability || [];
          
          // Validate availability structure
          availabilityData = availabilityData.filter(day => 
            day.day && day.slots && Array.isArray(day.slots)
          );
        } catch (e) {
          console.error('Error parsing availability:', e);
          availabilityData = [];
        }

        const therapistData: BookingTherapist = {
          id: data.id,
          full_name: data.profiles.full_name || '',
          profile_image_url: data.profiles.profile_image_url || null,
          hourly_rate: data.hourly_rate || 0,
          specialization: data.specialization || 'General Therapy',
          availability: availabilityData,
          is_community_therapist: data.is_community_therapist || false,
          bio: data.bio || 'Professional therapist.'
        };

        setTherapist(therapistData);

        // Set initial date to next available day
        const nextAvailableDate = getNextAvailableDate(therapistData.availability);
        setSelectedDate(nextAvailableDate);

      } catch (error) {
        console.error('Error fetching therapist:', error);
        toast({
          title: "Failed to load therapist",
          description: error instanceof Error ? error.message : 'Therapist profile could not be loaded',
          variant: "destructive",
        });
        navigate('/therapists');
      } finally {
        setLoading(false);
      }
    };

    const getNextAvailableDate = (availability: AvailabilityDay[]): Date => {
      const today = new Date();
      
      // Check next 14 days for availability
      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayName = format(date, 'EEEE').toLowerCase();
        
        if (availability.some(day => day.day.toLowerCase() === dayName)) {
          return date;
        }
      }
      
      // Fallback to tomorrow if no availability found
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow;
    };

    if (therapistId) fetchTherapist();
  }, [therapistId, toast, navigate]);
const handleDateSelect = (date: Date | undefined) => {
  console.log('Selected Date:', date);
  if (date && isValid(date)) {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  }
};

const handleTimeSelect = (time: string) => {
  console.log('Selected Time:', time);
  setSelectedTime(time === selectedTime ? null : time); // Toggle selection
};

const handleBookSession = async () => {
  console.log('Booking Attempt:', {
    therapist: therapist,
    selectedDate: selectedDate,
    selectedTime: selectedTime,
    user: user,
  });
  if (!therapist || !selectedDate || !selectedTime || !user) {
    toast({
      title: "Error",
      description: "Please select both a date and time for your session",
      variant: "destructive",
    });
    return;
  }
    if (!isValid(selectedDate)) {
      toast({
        title: "Invalid Date",
        description: "Please select a valid date for your session.",
        variant: "destructive",
      });
      return;
    }

    // Verify the selected time is actually available
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const dayAvailability = therapist.availability.find(
      day => day.day.toLowerCase() === dayName
    );
    
    if (!dayAvailability || !dayAvailability.slots.includes(selectedTime)) {
      toast({
        title: "Time not available",
        description: "The selected time is no longer available. Please choose another time.",
        variant: "destructive",
      });
      return;
    }

    try {
      const sessionDuration = selectedSessionType === 'video' ? 50 : 30;
      const [hours, minutes] = selectedTime.split(':').map(Number);
      
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime.getTime() + sessionDuration * 60000);

      const sessionDetails = {
        client_id: user.id,
        therapist_id: therapist.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        session_type: selectedSessionType,
        status: therapist.is_community_therapist ? 'confirmed' : 'pending',
        client_notes: additionalNotes || null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('appointments')
        .insert([sessionDetails]);

      if (error) throw error;

      await supabase.from("notifications").insert([
  {
    id: crypto.randomUUID(),
    user_id: therapist.id,
    title: "New Booking",
    type: "appointment",
    message: `New appointment booked by ${user?.user_metadata?.full_name || 'Client'}`,
    is_read: false,
    created_at: new Date().toISOString(),
  },
]);

      toast({
        title: "Booking successful!",
        description: therapist.is_community_therapist 
          ? "Your session has been confirmed." 
          : "Your session request has been sent.",
      });

      navigate('/client/appointments');

    } catch (error) {
  console.error('Booking error details:', error);
  toast({
    title: "Booking failed",
    description: `Could not complete your booking: ${error.message || 'Unknown error'}`,
    variant: "destructive",
  });
}
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date || !isValid(date)) return "Select a date";
    return format(date, "EEE, MMM d");
  };

  const getCurrentDateSlots = () => {
    if (!selectedDate || !therapist) return [];
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const dayData = therapist.availability.find(
      day => day.day.toLowerCase() === dayName
    );
    
    return dayData?.slots || [];
  };

  const getAvailableDates = () => {
    if (!therapist) return [];
    
    const dates: Date[] = [];
    const today = new Date();
    
    // Show available dates for next 2 weeks
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = format(date, 'EEEE').toLowerCase();
      if (therapist.availability.some(day => day.day.toLowerCase() === dayName)) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Therapist Not Found</h2>
        <Button asChild>
          <Link to="/therapists">Back to Therapists</Link>
        </Button>
      </div>
    );
  }

  const currentDateSlots = getCurrentDateSlots();
  const availableDates = getAvailableDates();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center mb-6 gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to={`/therapists/${therapist.id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          Book Session with {therapist.full_name}
        </h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {therapist.profile_image_url ? (
              <img
                src={therapist.profile_image_url}
                alt={therapist.full_name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-500" />
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-bold">{therapist.full_name}</h2>
              <p className="text-muted-foreground mb-2">{therapist.specialization}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  therapist.is_community_therapist 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {therapist.is_community_therapist ? 'Community Therapist' : `ksh${therapist.hourly_rate}/hr`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            {/* Session Type Selection */}
            <div>
              <h3 className="font-medium mb-3">Session Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedSessionType('video')}
                  className={`p-4 border rounded-lg flex flex-col items-center ${
                    selectedSessionType === 'video' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <Video className="h-6 w-6 mb-2" />
                  <span>Video Session</span>
                  <span className="text-sm text-muted-foreground">
                    {therapist.is_community_therapist ? 'Free' : `ksh${therapist.hourly_rate}`}
                  </span>
                </button>
                
                <button
                  onClick={() => setSelectedSessionType('chat')}
                  className={`p-4 border rounded-lg flex flex-col items-center ${
                    selectedSessionType === 'chat' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <MessageCircle className="h-6 w-6 mb-2" />
                  <span>Chat Session</span>
                  <span className="text-sm text-muted-foreground">
                    {therapist.is_community_therapist ? 'Free' : `ksh${Math.round(therapist.hourly_rate * 0.7)}`}
                  </span>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <h3 className="font-medium mb-3">Select Date</h3>
              <div className="flex flex-col gap-4">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarClock className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate || undefined}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const dayName = format(date, 'EEEE').toLowerCase();
                        return !therapist.availability.some(
                          day => day.day.toLowerCase() === dayName
                        );
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <div className="flex overflow-x-auto gap-2 pb-2">
                  {availableDates.map((date) => (
                    <button
                      key={date.toString()}
                      onClick={() => handleDateSelect(date)}
                      className={`min-w-[120px] p-3 text-center rounded-lg ${
                        selectedDate && isSameDay(selectedDate, date)
                          ? 'bg-primary text-white'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {formatDisplayDate(date)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && currentDateSlots.length > 0 && (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 font-medium mb-3">
                  <Clock className="h-4 w-4" />
                  Available Times for {formatDisplayDate(selectedDate)}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {currentDateSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <h3 className="font-medium mb-3">Additional Preferences (Optional)</h3>
              <Textarea
                placeholder="Let the therapist know if you have any specific preferences..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" asChild>
            <Link to={`/therapists/${therapist.id}`}>Cancel</Link>
          </Button>
          <Button 
  onClick={handleBookSession}
  disabled={loading || !selectedDate || !selectedTime || !user}
>
  {therapist.is_community_therapist ? 'Confirm Booking' : 'Request Session'}
</Button>
        </CardFooter>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 mt-0.5 text-primary" />
          <div>
            <h4 className="font-medium mb-1">Session Details</h4>
            <p className="text-sm text-muted-foreground">
              {selectedSessionType === 'video' ? 
                "50-minute video session via our secure platform" : 
                "30-minute text chat session"}
            </p>
            {selectedTime && (
              <p className="text-sm mt-2">
                Selected: {formatDisplayDate(selectedDate)} at {selectedTime}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;