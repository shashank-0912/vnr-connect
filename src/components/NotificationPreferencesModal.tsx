import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Briefcase, BookOpen, Calendar, Users } from "lucide-react";

interface NotificationPreferences {
  internship: boolean;
  resource: boolean;
  event: boolean;
  mentorship: boolean;
}

interface NotificationPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: NotificationPreferences;
  onPreferencesChange: (preferences: NotificationPreferences) => void;
}

export const NotificationPreferencesModal = ({
  open,
  onOpenChange,
  preferences,
  onPreferencesChange,
}: NotificationPreferencesModalProps) => {
  const handleToggle = (key: keyof NotificationPreferences) => {
    onPreferencesChange({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const preferenceItems = [
    {
      key: "internship" as const,
      label: "Internships",
      description: "Get notified about new internship opportunities",
      icon: Briefcase,
    },
    {
      key: "resource" as const,
      label: "Resources",
      description: "Updates on new notes, papers, and study materials",
      icon: BookOpen,
    },
    {
      key: "event" as const,
      label: "Events",
      description: "Stay updated on upcoming events and workshops",
      icon: Calendar,
    },
    {
      key: "mentorship" as const,
      label: "Mentorship",
      description: "Notifications about mentorship sessions and bookings",
      icon: Users,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>
            Choose which notifications you want to receive
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {preferenceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-start justify-between space-x-4"
              >
                <div className="flex items-start space-x-3 flex-1">
                  <Icon className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="space-y-1">
                    <Label
                      htmlFor={item.key}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={item.key}
                  checked={preferences[item.key]}
                  onCheckedChange={() => handleToggle(item.key)}
                />
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          Changes are saved automatically
        </div>
      </DialogContent>
    </Dialog>
  );
};
