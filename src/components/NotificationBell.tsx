import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationDropdown } from "./NotificationDropdown";
import { Badge } from "@/components/ui/badge";

// Mock notifications data
// TODO: integrate live updates via WebSocket or push notifications later
export const mockNotifications = [
  {
    id: 1,
    userId: "demo",
    type: "internship" as const,
    message: "New internship at Google - SDE Intern",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    seen: false,
  },
  {
    id: 2,
    userId: "demo",
    type: "resource" as const,
    message: "ECE 3rd Sem notes verified by faculty",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    seen: false,
  },
  {
    id: 3,
    userId: "demo",
    type: "event" as const,
    message: "Tech Talk: AI in Healthcare - Tomorrow at 4 PM",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    seen: false,
  },
  {
    id: 4,
    userId: "demo",
    type: "internship" as const,
    message: "Microsoft hiring for Summer Internship 2025",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    seen: true,
  },
  {
    id: 5,
    userId: "demo",
    type: "resource" as const,
    message: "CSE 2nd year DAA notes uploaded",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    seen: true,
  },
];

export type Notification = typeof mockNotifications[0];

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.seen).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, seen: true }))
    );
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, seen: true } : n))
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0"
        align="end"
        sideOffset={8}
      >
        <NotificationDropdown
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onMarkAsRead={handleMarkAsRead}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
};
