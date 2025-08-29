
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const notificationSettings = [
  {
    label: "Email Notifications",
    description: "Receive notifications about your account via email.",
    key: "email_notifications",
  },
  {
    label: "SMS Notifications",
    description: "Receive notifications via text message.",
    key: "sms_notifications",
  },
];

const appearanceSettings = [
    {
        label: "Dark Mode",
        description: "Enable dark mode for the application.",
        key: "dark_mode",
    }
];

export default function FriendSettings() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    dark_mode: false,
  });

  const handleToggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof settings] }));
  };

  const handleSave = () => {
    // Here you would typically save the settings to your backend
    console.log("Saving settings:", settings);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationSettings.map((setting) => (
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4" key={setting.key}>
              <div className="space-y-0.5">
                <Label htmlFor={setting.key} className="text-base font-medium">
                  {setting.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                    {setting.description}
                </p>
              </div>
              <Switch
                id={setting.key}
                checked={settings[setting.key as keyof typeof settings]}
                onCheckedChange={() => handleToggle(setting.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {appearanceSettings.map((setting) => (
             <div className="flex items-center justify-between space-x-2 rounded-lg border p-4" key={setting.key}>
                <div className="space-y-0.5">
                    <Label htmlFor={setting.key} className="text-base font-medium">
                        {setting.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {setting.description}
                    </p>
                </div>
                <Switch
                    id={setting.key}
                    checked={settings[setting.key as keyof typeof settings]}
                    onCheckedChange={() => handleToggle(setting.key)}
                />
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
