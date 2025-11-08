import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, MessageSquare, BookOpen, Calendar, Trophy, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-students.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full">
                <span className="text-accent font-semibold">For Students, By Students</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight">
                VNR Connect
              </h1>
              <p className="text-xl md:text-2xl text-white/90">
                Connect with alumni mentors, ace your exams, and build your career — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" variant="secondary" className="text-lg">
                  <Link to="/auth">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white/10">
                  <Link to="/app/ask-vnr">
                    Explore as Guest
                  </Link>
                </Button>
              </div>
              <div className="flex gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-accent">500+</div>
                  <div className="text-white/80">Alumni Mentors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">2000+</div>
                  <div className="text-white/80">Resources Shared</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">95%</div>
                  <div className="text-white/80">Query Response</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Students collaborating at VNR" 
                className="rounded-2xl shadow-2xl hover-lift"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground">Your complete platform for academic and career growth</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover-lift bg-card">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-3">Alumni Mentorship</h3>
              <p className="text-muted-foreground mb-4">
                Connect with 500+ alumni from top companies. Get career guidance, interview prep, and real industry insights.
              </p>
              <Button asChild variant="link" className="p-0 h-auto text-primary">
                <Link to="/app/alumni">Find a Mentor <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </Card>

            <Card className="p-8 hover-lift bg-card">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-3">Ask VNR</h3>
              <p className="text-muted-foreground mb-4">
                Get quick answers from peers and seniors. Post anonymously, upvote helpful replies, and solve problems fast.
              </p>
              <Button asChild variant="link" className="p-0 h-auto text-primary">
                <Link to="/app/ask-vnr">Ask a Question <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </Card>

            <Card className="p-8 hover-lift bg-card">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-3">Academic Hub</h3>
              <p className="text-muted-foreground mb-4">
                Access verified notes, previous papers, and important concepts. Filter by branch, semester, and subject.
              </p>
              <Button asChild variant="link" className="p-0 h-auto text-primary">
                <Link to="/app/resources">Browse Resources <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </Card>

            <Card className="p-8 hover-lift bg-card">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-3">Events & Clubs</h3>
              <p className="text-muted-foreground mb-4">
                Stay updated with hackathons, workshops, and club activities. Never miss important opportunities.
              </p>
              <Button asChild variant="link" className="p-0 h-auto text-primary">
                <Link to="/app/events">View Events <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </Card>

            <Card className="p-8 hover-lift bg-card">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <Trophy className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-3">Internships</h3>
              <p className="text-muted-foreground mb-4">
                Find internship opportunities recommended by alumni. Build skills and earn while learning.
              </p>
              <Button asChild variant="link" className="p-0 h-auto text-primary">
                <Link to="/app/internships">Find Internships <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </Card>

            <Card className="p-8 hover-lift bg-card">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-3">Reputation System</h3>
              <p className="text-muted-foreground mb-4">
                Earn points for helping others, get badges, and climb the leaderboard. Recognition that matters.
              </p>
              <Button asChild variant="link" className="p-0 h-auto text-primary">
                <Link to="/app/dashboard">View Leaderboard <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Ready to Level Up Your College Experience?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of VNR students already connecting, learning, and growing together.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg">
            <Link to="/auth">
              Sign Up with College Email <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 px-4 border-t">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading font-bold text-xl mb-4">VNR Connect</h3>
              <p className="text-muted-foreground text-sm">
                For Students, By Students<br />Guided by Alumni
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/app/ask-vnr" className="hover:text-primary">Ask VNR</Link></li>
                <li><Link to="/app/alumni" className="hover:text-primary">Alumni Network</Link></li>
                <li><Link to="/app/resources" className="hover:text-primary">Resources</Link></li>
                <li><Link to="/app/events" className="hover:text-primary">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">FAQ</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Clubs</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Tech Clubs</a></li>
                <li><a href="#" className="hover:text-primary">Cultural Clubs</a></li>
                <li><a href="#" className="hover:text-primary">Sports</a></li>
                <li><a href="#" className="hover:text-primary">Join a Club</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 VNR Connect. Built with ❤️ by students for students.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
