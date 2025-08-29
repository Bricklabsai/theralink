
import ProfileImageUpload from "@/components/profile/ProfileImageUpload";
import FriendProfileForm from "@/components/friend/FriendProfileForm";

export default function FriendAccount() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
           <ProfileImageUpload />
        </div>
        <div className="lg:col-span-2">
           <FriendProfileForm />
        </div>
      </div>
    </div>
  );
}
