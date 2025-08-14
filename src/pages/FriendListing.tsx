import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Friend, FriendDetails, FriendWithDetails } from "@/types/friend";
import { BookingModal } from "@/components/booking/BookingModal";

const FriendListing = () => {
  const [friends, setFriends] = useState<FriendWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBooking = (friend: FriendWithDetails) => {
    setSelectedFriend(friend);
    setIsBookingModalOpen(true);
  };

  useEffect(() => {
    const fetchFriendsWithDetails = async () => {
      setLoading(true);

      try {
        // Fetch friends with their details using a join
        const { data: friendsData, error } = await supabase
          .from("profiles")
          .select(`
            *,
            friend_details:profiles (
              experience_description,
              area_of_experience,
              personal_story,
              communication_preferences
    )
          `)
          .eq("role", "friend");

        if (error) {
          throw error;
        }

        // Transform the data to match our interface
        const formattedFriends: FriendWithDetails[] = friendsData?.map(friend => ({
          ...friend,
          friend_details: Array.isArray(friend.friend_details) ? friend.friend_details[0] || null : friend.friend_details || null
        })) || [];

        setFriends(formattedFriends);
      } catch (error) {
        console.error("Error fetching friends data:", error);
      }

      setLoading(false);
    };

    fetchFriendsWithDetails();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading friends...</p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>No friends found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Available Friends</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend) => (
          <Card key={friend.id} className="p-4">
            <CardContent>
              <div className="flex flex-col items-center text-center">
                {friend.profile_image_url ? (
                  <img
                    src={friend.profile_image_url}
                    alt={friend.full_name}
                    className="w-24 h-24 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-300 mb-4" />
                )}

                <h2 className="text-xl font-semibold">{friend.full_name || 'Friend'}</h2>
                <p className="text-sm text-gray-600 mb-4">Friend profile</p>

                {friend.friend_details ? (
                  <div className="text-left mt-4">
                    <p className="text-sm font-semibold">
                      <strong>Experience Description:</strong> {friend.friend_details.experience_description || "N/A"}
                    </p>
                    <p className="text-sm font-semibold">
                      <strong>Area of Experience:</strong> {friend.friend_details.area_of_experience || "N/A"}
                    </p>
                    <p className="text-sm font-semibold">
                      <strong>Personal Story:</strong> {friend.friend_details.personal_story || "N/A"}
                    </p>
                    <p className="text-sm font-semibold">
                      <strong>Communication Preferences:</strong> {friend.friend_details.communication_preferences || "N/A"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-4">No additional details available.</p>
                )}

                <div className="flex justify-center mt-4 gap-2">
                  <Button variant="outline" asChild>
                    <Link to={`/friends/${friend.id}`}>
                      View Profile
                    </Link>
                  </Button>
                  <Button 
                    onClick={() => handleBooking(friend)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Book Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedFriend && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedFriend(null);
          }}
          therapist={{
            id: selectedFriend.id,
            full_name: selectedFriend.full_name || 'Friend',
            hourly_rate: 0, // Friends are typically free
            is_community_therapist: true, // Friends are community-based
            preferred_currency: 'KSH'
          }}
        />
      )}
    </div>
  );
};

export default FriendListing;