import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Briefcase, GraduationCap, Star, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Alumni {
  id: string;
  name: string;
  email: string;
  company: string | null;
  headline: string | null;
  batch: string | null;
  branch: string | null;
  reputation: number;
}

const Alumni = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAlumni();
  }, []);

  useEffect(() => {
    filterAlumni();
  }, [alumni, companyFilter, branchFilter, searchTerm]);

  const loadAlumni = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'ALUMNI')
        .order('reputation', { ascending: false });

      if (error) throw error;
      setAlumni(data || []);
    } catch (error: any) {
      toast.error("Failed to load alumni");
    } finally {
      setLoading(false);
    }
  };

  const filterAlumni = () => {
    let filtered = alumni;

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (companyFilter) {
      filtered = filtered.filter(a => a.company === companyFilter);
    }

    if (branchFilter) {
      filtered = filtered.filter(a => a.branch === branchFilter);
    }

    setFilteredAlumni(filtered);
  };

  const companies = [...new Set(alumni.map(a => a.company).filter(Boolean))];
  const branches = [...new Set(alumni.map(a => a.branch).filter(Boolean))];

  if (loading) {
    return <div>Loading alumni...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Alumni Network</h1>
        <p className="text-muted-foreground">Connect with 500+ alumni from top companies</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              {companies.map(company => (
                <SelectItem key={company} value={company!}>{company}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(branch => (
                <SelectItem key={branch} value={branch!}>{branch}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setCompanyFilter("");
              setBranchFilter("");
              setSearchTerm("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Alumni Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((person) => (
          <Card key={person.id} className="p-6 hover-lift">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {person.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2 w-full">
                <h3 className="font-heading font-semibold text-lg">{person.name}</h3>
                
                {person.headline && (
                  <p className="text-sm text-muted-foreground">{person.headline}</p>
                )}

                <div className="flex items-center justify-center gap-2 text-sm">
                  {person.company && (
                    <Badge variant="secondary" className="gap-1">
                      <Building2 className="h-3 w-3" />
                      {person.company}
                    </Badge>
                  )}
                  {person.batch && (
                    <Badge variant="outline" className="gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {person.batch}
                    </Badge>
                  )}
                </div>

                {person.branch && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {person.branch}
                  </Badge>
                )}

                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {person.reputation} reputation
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <Button variant="default" size="sm" className="flex-1">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Mentor
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Message
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredAlumni.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No alumni found matching your filters</p>
        </Card>
      )}
    </div>
  );
};

export default Alumni;
