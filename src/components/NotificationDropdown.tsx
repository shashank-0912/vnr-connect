import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Briefcase, BookOpen, Calendar, Users } from "lucide-react";
import { NotificationPreferencesModal } from "./NotificationPreferencesModal";
import { Notification } from "./NotificationBell";
import { formatDistanceToNow } from "date-fns";

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onMarkAsRead: (id: number) => void;
  onClose: () => void;
}

export const NotificationDropdown = ({
  notifications,
  onMarkAllRead,
  onMarkAsRead,
  onClose,
}: NotificationDropdownProps) => {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    // TODO: persist notification preferences in DB after backend setup
    const saved = localStorage.getItem("notificationPreferences");
    return saved
      ? JSON.parse(saved)
      : {
          internship: true,
          resource: true,
          event: true,
          mentorship: true,
        };
  });

  const handlePreferencesChange = (newPreferences: typeof preferences) => {
    setPreferences(newPreferences);
    localStorage.setItem("notificationPreferences", JSON.stringify(newPreferences));
  };

  const filteredNotifications = notifications.filter(
    (n) => preferences[n.type]
  );

  const getNotificationsByType = (type: string) =>
    filteredNotifications.filter((n) => n.type === type);

  const renderNotificationItem = (notification: Notification) => (
    <div
      key={notification.id}
      className={`p-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer ${
        !notification.seen ? "bg-primary/5" : ""
      }`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <p className="text-sm font-medium">{notification.message}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
      </p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="p-8 text-center text-muted-foreground">
      <p>No new updates 🎉</p>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Notifications</h3>
        {filteredNotifications.some((n) => !n.seen) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            className="text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b px-4">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          {preferences.internship && (
            <TabsTrigger value="internship" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              Internships
            </TabsTrigger>
          )}
          {preferences.resource && (
            <TabsTrigger value="resource" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Resources
            </TabsTrigger>
          )}
          {preferences.event && (
            <TabsTrigger value="event" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Events
            </TabsTrigger>
          )}
          {preferences.mentorship && (
            <TabsTrigger value="mentorship" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Mentorship
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="h-[320px]">
          <TabsContent value="all" className="m-0">
            {filteredNotifications.length > 0
              ? filteredNotifications.map(renderNotificationItem)
              : renderEmptyState()}
          </TabsContent>

          <TabsContent value="internship" className="m-0">
            {getNotificationsByType("internship").length > 0
              ? getNotificationsByType("internship").map(renderNotificationItem)
              : renderEmptyState()}
          </TabsContent>

          <TabsContent value="resource" className="m-0">
            {getNotificationsByType("resource").length > 0
              ? getNotificationsByType("resource").map(renderNotificationItem)
              : renderEmptyState()}
          </TabsContent>

          <TabsContent value="event" className="m-0">
            {getNotificationsByType("event").length > 0
              ? getNotificationsByType("event").map(renderNotificationItem)
              : renderEmptyState()}
          </TabsContent>

          <TabsContent value="mentorship" className="m-0">
            {getNotificationsByType("mentorship").length > 0
              ? getNotificationsByType("mentorship").map(renderNotificationItem)
              : renderEmptyState()}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer */}
      <div className="p-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setPreferencesOpen(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Preferences
        </Button>
      </div>

      <NotificationPreferencesModal
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        preferences={preferences}
        onPreferencesChange={handlePreferencesChange}
      />
    </div>
  );
};
