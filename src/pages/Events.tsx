import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Users, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format, isFuture, isPast } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  organizer: string;
  eligibility: string | null;
  link: string | null;
  tags: string[];
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      const allEvents = data || [];
      const now = new Date();

      setUpcomingEvents(allEvents.filter(e => isFuture(new Date(e.date))));
      setPastEvents(allEvents.filter(e => isPast(new Date(e.date))));
      setEvents(allEvents);
    } catch (error: any) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const displayedEvents = showPast ? pastEvents : upcomingEvents;

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Events & Activities</h1>
          <p className="text-muted-foreground">Stay updated with college events and opportunities</p>
        </div>
        <Button size="lg">Create Event</Button>
      </div>

      {/* Toggle */}
      <div className="flex gap-2">
        <Button
          variant={!showPast ? "default" : "outline"}
          onClick={() => setShowPast(false)}
        >
          Upcoming ({upcomingEvents.length})
        </Button>
        <Button
          variant={showPast ? "default" : "outline"}
          onClick={() => setShowPast(true)}
        >
          Past ({pastEvents.length})
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {displayedEvents.map((event) => (
          <Card key={event.id} className="p-6 hover-lift">
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading font-semibold text-xl">{event.title}</h3>
                  {event.tags.length > 0 && (
                    <Badge variant="secondary">{event.tags[0]}</Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(new Date(event.date), "PPP 'at' p")}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Organized by {event.organizer}</span>
                </div>

                {event.eligibility && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.eligibility}</span>
                  </div>
                )}
              </div>

              {event.tags.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.slice(1).map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}

              {event.link && (
                <Button variant="default" size="sm" className="w-full" asChild>
                  <a href={event.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </a>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {displayedEvents.length === 0 && (
        <Card className="p-12 text-center">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            No {showPast ? 'past' : 'upcoming'} events
          </h3>
          <p className="text-muted-foreground">
            {showPast ? 'No events have occurred yet' : 'Check back soon for new events!'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default Events;
