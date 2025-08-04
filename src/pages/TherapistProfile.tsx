import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageCircle, 
  Star, 
  Award, 
  Languages, 
  MapPin, 
  DollarSign, 
  Check,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { startOfToday, addDays, format } from "date-fns";

// Helper to get the next date for a given day
const getNextDateForDay = (day: string) => {
  const today = startOfToday();
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const targetDayIndex = daysOfWeek.indexOf(day.toLowerCase());
  const todayIndex = today.getDay();
  const daysToAdd = (targetDayIndex - todayIndex + 7) % 7 || 7;
  return addDays(today, daysToAdd);
};


const TherapistProfile = () => {
  const { id } = useParams<{ id: string }>();
  
  interface Therapist {
    id: string;
    user_id?: string;
    full_name?: string;
    profile_image_url?: string;
    role?: string;
    location?: string;
    email?: string;
    hourly_rate?: number;
    availability?: any;
    specialization?: string;
    years_experience?: number;
    rating?: number;
    bio?: string;
    license_type?: string;
    therapy_approaches?: string[] | string;
    languages?: string[];
    session_formats?: string[] | string;
    is_verified?: boolean;
    education?: string;
  }
  
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  type Review = {
    rating: number;
    comment: string;
    created_at: string;
  };
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTherapistData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // First fetch therapist data from therapists table
        const { data: therapistData, error: therapistError } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', id)
          .single();

        if (therapistError || !therapistData) {
          throw therapistError || new Error("Therapist not found");
        }

        // Then fetch profile data from profiles table using user_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'therapist')
          .eq('id', therapistData.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // If profile fetch fails, use therapist data as fallback
          setTherapist({
            ...therapistData,
            user_id: therapistData.id,
            full_name: therapistData.bio || 'Therapist'
          });
        } else {
          // Merge profile data with therapist data
          setTherapist({
            ...therapistData,
            user_id: therapistData.id,
            full_name: profileData?.full_name || therapistData.bio || 'Therapist',
            profile_image_url: profileData?.profile_image_url || null
          });
        }

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("rating, comment, created_at")
          .eq("therapist_id", id)
          .order("created_at", { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      } catch (err) {
        toast({
          title: "Error loading therapist",
          description: "Please try again later",
          variant: "destructive",
        });
        setTherapist(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapistData();
  }, [id, toast]);

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime || !therapist) return;
    
    setBookingLoading(true);
    try {
      const { data: booking, error } = await supabase
        .from("appointments")
        .insert([{
          client_id: id || '',
          therapist_id: id || '',
          start_time: `${selectedDate}T${selectedTime}`,
          end_time: `${selectedDate}T${selectedTime}`,
          session_type: 'video',
          status: "pending"
        }])
        .select()
        .single();

      if (error) throw error;

      navigate(`/booking/${id}`, {
        state: {
          bookingId: booking.id,
          date: selectedDate,
          time: selectedTime,
          therapist: {
            id: therapist.id,
            name: therapist.full_name,
            rate: therapist.hourly_rate
          }
        }
      });

    } catch (error) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading therapist profile...</p>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm text-center max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Therapist Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the therapist you're looking for.</p>
          <Button asChild className="w-full">
            <Link to="/therapists">Back to Therapist Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:w-2/3 space-y-6">
            {/* Profile Header */}
            <Card className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                  <div className="w-full md:w-1/3 flex-shrink-0">
                    {therapist.profile_image_url ? (
                      <img
                        src={therapist.profile_image_url}
                        alt={therapist.full_name}
                        className="w-full h-48 md:h-auto aspect-square object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 md:h-auto aspect-square rounded-lg flex items-center justify-center bg-muted text-2xl sm:text-3xl font-bold">
                        {therapist.full_name
                          ? therapist.full_name
                              .split(" ")
                              .filter(n => n && n[0])
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : ""}
                      </div>
                    )}
                  </div>
                  <div className="md:w-2/3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{therapist.full_name}</h1>
                    <p className="text-base sm:text-lg text-gray-600 mb-3">{therapist.specialization || "Therapist"}</p>
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {Array.from({ length: Math.floor(therapist.rating || 5) }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="ml-1 font-medium text-sm sm:text-base">{therapist.rating || 5}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-thera-600 flex-shrink-0" />
                        <span>{therapist.years_experience || "N/A"} years experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-thera-600 flex-shrink-0" />
                        <span>{therapist.location || "Remote Available"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-thera-600 flex-shrink-0" />
                        <span>{therapist.languages?.join(', ') || "English"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-thera-600 flex-shrink-0" />
                        <span>ksh {therapist.hourly_rate ||0} per session</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Therapist Details Tabs */}
            <Card>
              <Tabs defaultValue="about">
                <div className="px-4 sm:px-6 pt-4 sm:pt-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="about" className="text-xs sm:text-sm">About</TabsTrigger>
                    <TabsTrigger value="credentials" className="text-xs sm:text-sm">Credentials</TabsTrigger>
                    <TabsTrigger value="reviews" className="text-xs sm:text-sm">Reviews</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="about" className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-4">About {therapist.full_name}</h2>
                  <p className="text-gray-700 mb-4 text-sm sm:text-base">{therapist.bio || "No bio provided."}</p>
                  <h3 className="text-base sm:text-lg font-bold mt-6 mb-3">Therapeutic Approach</h3>
                  <ul className="space-y-2">
                    {typeof therapist.therapy_approaches === "string" && therapist.therapy_approaches.length > 0
                      ? therapist.therapy_approaches.split(',').map((approach: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-sm sm:text-base">
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-mint-500 flex-shrink-0" />
                            <span>{approach.trim()}</span>
                          </li>
                        ))
                      : <span className="text-sm sm:text-base">No approach information available.</span>
                    }
                  </ul>
                </TabsContent>
                <TabsContent value="credentials" className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-4">Education & Credentials</h2>
                  <div className="space-y-4 mb-6">
                    <div className="border-l-2 border-thera-200 pl-4">
                      <p className="font-medium text-sm sm:text-base">{therapist.education || "No education info."}</p>
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-3">Certifications & Licenses</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm sm:text-base">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 text-mint-500 flex-shrink-0" />
                      <span>{therapist.license_type || "No license type provided."}</span>
                    </li>
                  </ul>
                </TabsContent>
                <TabsContent value="reviews" className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-bold">Client Reviews</h2>
                  </div>
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-sm sm:text-base">No reviews at the moment.</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-6">
                          <div className="flex items-center mb-3">
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="ml-2 text-xs sm:text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-700 mb-3 text-sm sm:text-base">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="xl:w-1/3">
            <Card className="xl:sticky xl:top-24">
              <CardContent className="p-6">
                <div className="mb-6">
  <h3 className="font-medium mb-3 text-sm text-gray-700">
    <Calendar className="h-4 w-4 inline mr-1" />
    Available Days
  </h3>
  <div className="grid grid-cols-3 gap-2">
                     {therapist.availability && Array.isArray(therapist.availability) && therapist.availability.length > 0 ? (
      therapist.availability.map((dayObj, index) => {
        // Handle both old and new availability formats
        const dayString = dayObj.day || dayObj.date || 'monday';
        const nextDate = getNextDateForDay(dayString);
        const formattedDate = format(nextDate, "yyyy-MM-dd");
        return (
          <Button
            key={`${formattedDate}-${index}`}
            variant={selectedDate === formattedDate ? "default" : "outline"}
            onClick={() => {
              setSelectedDate(formattedDate);
              setSelectedTime(null);
            }}
            className="text-xs"
          >
            {format(nextDate, "MMM d")}
          </Button>
        );
      })
    ) : (
      <span className="text-xs text-gray-500">No availability</span>
    )}
  </div>
</div>


                {selectedDate && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 text-sm text-gray-700">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Available Times
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {therapist.availability
                        ?.find((day: { date: string; slots: string[] }) => day.date === selectedDate)
                        ?.slots?.map((time: string) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className="text-xs"
                          >
                            {time}
                          </Button>
                        )) || <p className="text-gray-500 text-xs">No slots available</p>}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-thera-600 hover:bg-thera-700"
                  disabled={!selectedDate || !selectedTime || bookingLoading}
                  onClick={handleBookSession}
                  size="lg"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Book Session'
                  )}
                </Button>

                <div className="flex gap-2 mt-4">
                  <Button asChild variant="outline" className="w-1/2 text-xs">
                    <Link to={`/chat/${String(therapist.id)}`}>
                      <MessageCircle className="h-3 w-3 mr-1" /> Message
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-1/2 text-xs">
                    <Link to={`/video/${String(therapist.id)}`}>
                      <Video className="h-3 w-3 mr-1" /> Video Call
                    </Link>
                  </Button>
                </div>

                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <p className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> ksh{therapist.hourly_rate ?? "N/A"} per session
                  </p>
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 50-minute session
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfile;