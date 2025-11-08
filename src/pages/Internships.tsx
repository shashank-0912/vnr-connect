import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ExternalLink, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Internship {
  id: string;
  title: string;
  company: string;
  link: string;
  tags: string[];
  recommended_by_alumni: boolean;
  created_at: string;
}

const Internships = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInternships();
  }, []);

  const loadInternships = async () => {
    try {
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInternships(data || []);
    } catch (error: any) {
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading internships...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Internship Opportunities</h1>
          <p className="text-muted-foreground">Find internships recommended by alumni and peers</p>
        </div>
        <Button size="lg">Post Internship</Button>
      </div>

      {/* Featured Section */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg mb-2">Alumni Recommended</h3>
            <p className="text-muted-foreground mb-4">
              These internships are personally recommended by our alumni network. Higher chances of selection!
            </p>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {internships.filter(i => i.recommended_by_alumni).length} opportunities
            </Badge>
          </div>
        </div>
      </Card>

      {/* Internships Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((internship) => (
          <Card key={internship.id} className="p-6 hover-lift">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Briefcase className="h-6 w-6 text-accent" />
                </div>
                {internship.recommended_by_alumni && (
                  <Badge variant="default" className="bg-primary">
                    <Star className="mr-1 h-3 w-3" />
                    Alumni Pick
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="font-heading font-semibold text-lg mb-2">{internship.title}</h3>
                <p className="text-muted-foreground font-medium mb-3">{internship.company}</p>
                
                {internship.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {internship.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Posted {formatDistanceToNow(new Date(internship.created_at), { addSuffix: true })}
                </p>
              </div>

              <Button variant="default" size="sm" className="w-full" asChild>
                <a href={internship.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Apply Now
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {internships.length === 0 && (
        <Card className="p-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No internships posted yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to share an opportunity!</p>
          <Button>Post First Internship</Button>
        </Card>
      )}

      {/* Skill Development Section */}
      <Card className="p-6">
        <h3 className="font-heading font-semibold text-xl mb-4">Build Your Skills</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card border">
            <h4 className="font-semibold mb-2">Web Development</h4>
            <p className="text-sm text-muted-foreground mb-3">Master React, Node.js, and full-stack development</p>
            <Button variant="link" size="sm" className="p-0 h-auto">Browse Courses →</Button>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <h4 className="font-semibold mb-2">Data Science</h4>
            <p className="text-sm text-muted-foreground mb-3">Learn Python, ML, and data analytics</p>
            <Button variant="link" size="sm" className="p-0 h-auto">Browse Courses →</Button>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <h4 className="font-semibold mb-2">Cloud & DevOps</h4>
            <p className="text-sm text-muted-foreground mb-3">AWS, Azure, Docker, and CI/CD</p>
            <Button variant="link" size="sm" className="p-0 h-auto">Browse Courses →</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Internships;
