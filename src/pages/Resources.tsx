import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, CheckCircle, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import ResourcesSearch from "@/components/ResourcesSearch";

interface Resource {
  id: string;
  title: string;
  type: string;
  file_url?: string;
  branch: string;
  semester: number;
  subject?: string;
  verified?: boolean;
  uploaded_at?: string;
  created_at?: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // search states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // debounce search input (300ms)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    loadResources();
  }, []);

  // when base resources or filters change and when search is empty, apply local filters
  useEffect(() => {
    if (!debouncedSearch) filterResources(); // do not overwrite if search active
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, branchFilter, semesterFilter, typeFilter, debouncedSearch]);

  // run search whenever debouncedSearch changes
  useEffect(() => {
    let aborted = false;

    async function runSearch(q: string) {
      setSearchError(null);

      if (!q || q.length === 0) {
        // if search empty, show filtered resources from filters
        filterResources();
        return;
      }

      setSearchLoading(true);
      try {
        // 1) Exact matches (title OR subject)
        const { data: exactData, error: exactErr } = await supabase
          .from("resources")
          .select("id, title, subject, branch, semester, type, verified, uploaded_at, created_at")
          .ilike("title", `%${q}%`)
          .or(`subject.ilike.%${q}%`)
          .order("created_at", { ascending: false })
          .limit(12);

        if (exactErr) throw exactErr;
        if (aborted) return;

        const exactRows: Resource[] = (exactData || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          subject: r.subject ?? r.subject,
          branch: r.branch,
          semester: r.semester,
          type: r.type,
          verified: r.verified,
          uploaded_at: r.uploaded_at ?? r.created_at,
          created_at: r.created_at ?? r.uploaded_at,
        }));

        // 2) Similar matches (token search)
        const tokens = q
          .split(/\s+/)
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 5);

        let simRows: Resource[] = [];
        if (tokens.length > 0) {
          const orParts: string[] = [];
          tokens.forEach((tok) => {
            const safe = tok.replace(/%/g, "\\%");
            orParts.push(`title.ilike.%${safe}%`);
            orParts.push(`subject.ilike.%${safe}%`);
          });
          const orExpr = orParts.join(",");

          const { data: simData, error: simErr } = await supabase
            .from("resources")
            .select("id, title, subject, branch, semester, type, verified, uploaded_at, created_at")
            .or(orExpr)
            .order("created_at", { ascending: false })
            .limit(24);

          if (simErr) throw simErr;
          if (aborted) return;

          simRows = (simData || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            subject: r.subject ?? r.subject,
            branch: r.branch,
            semester: r.semester,
            type: r.type,
            verified: r.verified,
            uploaded_at: r.uploaded_at ?? r.created_at,
            created_at: r.created_at ?? r.uploaded_at,
          }));
        }

        // dedupe similar rows that are in exactRows
        const exactIds = new Set(exactRows.map((x) => x.id));
        const filteredSim = simRows.filter((s) => !exactIds.has(s.id));

        // final merged result: exact first then similar
        const merged = [...exactRows, ...filteredSim];

        setFilteredResources(merged);
      } catch (err: any) {
        console.error("Resources search error", err);
        setSearchError(err?.message || "Failed to search resources");
        setFilteredResources([]);
      } finally {
        if (!aborted) setSearchLoading(false);
      }
    }

    runSearch(debouncedSearch);
    return () => {
      aborted = true;
    };
  }, [debouncedSearch]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (branchFilter) {
      filtered = filtered.filter((r) => r.branch === branchFilter);
    }

    if (semesterFilter) {
      filtered = filtered.filter((r) => r.semester === parseInt(semesterFilter));
    }

    if (typeFilter) {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }

    setFilteredResources(filtered);
  };

  const branches = [...new Set(resources.map((r) => r.branch))];
  const semesters = [...new Set(resources.map((r) => r.semester))].sort();

  if (loading) {
    return <div>Loading resources...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Academic Resources</h1>
          <p className="text-muted-foreground">Access verified notes, papers, and study materials</p>
        </div>
        <Button size="lg">
          <Upload className="mr-2 h-5 w-5" />
          Upload Resource
        </Button>
      </div>

      {/* Top controls: filters + search */}
      <Card className="p-6">
        <div className="grid md:grid-cols-5 gap-4 items-center">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((sem) => (
                <SelectItem key={sem} value={sem.toString()}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOTES">Notes</SelectItem>
              <SelectItem value="OLD_PAPER">Previous Papers</SelectItem>
              <SelectItem value="MODEL_PAPER">Model Papers</SelectItem>
              <SelectItem value="CONCEPTS">Important Concepts</SelectItem>
              <SelectItem value="EXTRA">Extra Resources</SelectItem>
            </SelectContent>
          </Select>

          {/* Search box (powered by ResourcesSearch component) */}
<div className="col-span-2 md:col-span-2 lg:col-span-2 w-full">
  <ResourcesSearch
    initialQuery=""
    limit={12}
    onResults={(items) => {
      // If search returns nothing (cleared), show filtered list from the filters.
      if (!items || items.length === 0) {
        filterResources();
      } else {
        setFilteredResources(items);
      }
    }}
  />
</div>


          <div className="col-span-1 text-right">
            <Button
              variant="outline"
              onClick={() => {
                setBranchFilter("");
                setSemesterFilter("");
                setTypeFilter("");
                setSearchQuery("");
                setDebouncedSearch("");
                setSearchError(null);
                filterResources();
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Search info */}
      {debouncedSearch ? (
        <div className="text-sm text-slate-600">
          {searchLoading ? "Searching…" : searchError ? `Error: ${searchError}` : `Showing search results for "${debouncedSearch}"`}
        </div>
      ) : (
        <div className="text-sm text-slate-600">Showing resources — use filters or search for exact & similar matches.</div>
      )}

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="p-6 hover-lift">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                {resource.verified && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="font-heading font-semibold text-lg mb-2">{resource.title}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{resource.branch}</Badge>
                  <Badge variant="outline">Sem {resource.semester}</Badge>
                  <Badge variant="outline">{resource.type?.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{resource.subject}</p>
              </div>

              <Button variant="default" size="sm" className="w-full" onClick={() => (window.location.href = resource.file_url || `/resources/${resource.id}`)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No resources found matching your filters</p>
        </Card>
      )}
    </div>
  );
};

export default Resources;
