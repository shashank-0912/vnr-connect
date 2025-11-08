import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Users, Trophy, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardMyQueries from "@/components/DashboardMyQueries";


interface Profile {
  name: string;
  role: string;
  reputation: number;
  branch?: string;
  year?: number;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ queries: 0, events: 0, resources: 0 });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('name, role, reputation, branch, year')
      .eq('id', user.id)
      .single();

    if (data) setProfile(data);
  };

  const loadStats = async () => {
    const [queriesRes, eventsRes, resourcesRes] = await Promise.all([
      supabase.from('queries').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('resources').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      queries: queriesRes.count || 0,
      events: eventsRes.count || 0,
      resources: resourcesRes.count || 0,
    });
  };

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-heading font-bold">Hey {profile.name.split(' ')[0]} 👋</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{profile.role}</Badge>
              {profile.branch && <Badge variant="outline">{profile.branch}</Badge>}
              {profile.year && <Badge variant="outline">Year {profile.year}</Badge>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Trophy className="h-6 w-6" />
            {profile.reputation}
          </div>
          <div className="text-sm text-muted-foreground">Reputation Points</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.queries}</div>
          <div className="text-sm text-muted-foreground">Active Queries</div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-secondary/10">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.events}</div>
          <div className="text-sm text-muted-foreground">Upcoming Events</div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.resources}</div>
          <div className="text-sm text-muted-foreground">Total Resources</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild variant="outline" size="lg" className="h-auto py-6 flex-col gap-2">
          <Link to="/app/ask-vnr">
            <MessageSquare className="h-8 w-8" />
            <span>Ask Quick</span>
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="h-auto py-6 flex-col gap-2">
          <Link to="/app/alumni">
            <Users className="h-8 w-8" />
            <span>Find Mentor</span>
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="h-auto py-6 flex-col gap-2">
          <Link to="/app/resources">
            <Calendar className="h-8 w-8" />
            <span>Browse Notes</span>
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="h-auto py-6 flex-col gap-2">
          <Link to="/app/events">
            <Trophy className="h-8 w-8" />
            <span>View Events</span>
          </Link>
        </Button>
      </div>

      {/* Featured Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading font-semibold">Today's Events</h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/events">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border bg-card/50">
              <div className="font-medium mb-1">Tech Talk: AI in Industry</div>
              <div className="text-sm text-muted-foreground">Today at 4:00 PM • Seminar Hall</div>
            </div>
            <div className="p-3 rounded-lg border bg-card/50">
              <div className="font-medium mb-1">Coding Contest</div>
              <div className="text-sm text-muted-foreground">Today at 6:00 PM • Online</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading font-semibold">Recommended Mentors</h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/alumni">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
              <Avatar>
                <AvatarFallback>RK</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">Rajesh Kumar</div>
                <div className="text-sm text-muted-foreground">SDE @ Amazon</div>
              </div>
              <Button size="sm" variant="secondary">Connect</Button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
              <Avatar>
                <AvatarFallback>PS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">Priya Sharma</div>
                <div className="text-sm text-muted-foreground">PM @ Microsoft</div>
              </div>
              <Button size="sm" variant="secondary">Connect</Button>
            </div>
          </div>
        </Card>
      </div>
      {/* Featured Sections */}
<div className="grid lg:grid-cols-2 gap-6">
  {/* ... your events and mentors cards ... */}
</div>

{/* My Queries Section */}
<Card className="p-6">
  <h3 className="text-xl font-heading font-semibold mb-4">My Queries</h3>
  <DashboardMyQueries />
</Card>

    </div>
  );
};

export default Dashboard;
