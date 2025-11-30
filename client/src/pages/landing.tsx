import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZyxLogo } from "@/components/zyx-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Shield,
  MessageSquare,
  BarChart3,
  Zap,
  Users,
  Clock,
  ChevronRight,
  Terminal,
  Bot
} from "lucide-react";
import { SiDiscord } from "react-icons/si";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-8">
          <ZyxLogo size="md" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-header-login">
              <a href="https://discord.com/oauth2/authorize?client_id=1444747223505047604&permissions=8&scope=bot%20applications.commands" target="_blank" rel="noopener noreferrer">
                <SiDiscord className="mr-2 h-4 w-4" />
                Add to Discord
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50" />

          <div className="relative max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-8">
                <Badge variant="secondary" className="px-4 py-1.5" data-testid="badge-hero">
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  Powerful Discord Moderation
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-hero-title">
                  Supercharge your Discord server with{" "}
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Zyx
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-lg" data-testid="text-hero-description">
                  The ultimate bot for moderation, tickets, and server management.
                  Keep your community safe and organized with powerful slash commands.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="px-8" asChild data-testid="button-hero-add">
                    <a href="https://discord.com/oauth2/authorize?client_id=1444747223505047604&permissions=8&scope=bot%20applications.commands" target="_blank" rel="noopener noreferrer">
                      <SiDiscord className="mr-2 h-5 w-5" />
                      Add to Discord
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="px-8" asChild data-testid="button-hero-learn">
                    <a href="https://discord.com/oauth2/authorize?client_id=1444747223505047604&permissions=8&scope=bot%20applications.commands">
                      Learn More
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-4">
                  <div className="space-y-1" data-testid="stat-servers">
                    <div className="text-2xl md:text-3xl font-bold text-foreground">10K+</div>
                    <div className="text-sm text-muted-foreground">Servers</div>
                  </div>
                  <div className="space-y-1" data-testid="stat-commands">
                    <div className="text-2xl md:text-3xl font-bold text-foreground">1M+</div>
                    <div className="text-sm text-muted-foreground">Commands</div>
                  </div>
                  <div className="space-y-1" data-testid="stat-users">
                    <div className="text-2xl md:text-3xl font-bold text-foreground">500K+</div>
                    <div className="text-sm text-muted-foreground">Users</div>
                  </div>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl" />
                <Card className="relative border-2" data-testid="card-hero-preview">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold">Zyx</div>
                          <div className="text-xs text-muted-foreground">Bot</div>
                        </div>
                        <Badge variant="secondary" className="ml-auto">Online</Badge>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2">
                        <div className="text-muted-foreground"># moderation-logs</div>
                        <div className="flex items-start gap-2">
                          <Terminal className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <span className="text-primary">/ban</span>
                            <span className="text-muted-foreground"> @spammer reason:Spamming</span>
                          </div>
                        </div>
                        <div className="border-l-4 border-destructive/50 pl-3 py-2 bg-destructive/10 rounded-r">
                          <div className="font-semibold text-destructive">User Banned</div>
                          <div className="text-xs text-muted-foreground">spammer#0001 was banned by Mod</div>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2">
                        <div className="flex items-start gap-2">
                          <Terminal className="h-4 w-4 text-chart-2 mt-1 flex-shrink-0" />
                          <div>
                            <span className="text-chart-2">/ticket create</span>
                            <span className="text-muted-foreground"> subject:Help needed</span>
                          </div>
                        </div>
                        <div className="border-l-4 border-chart-2/50 pl-3 py-2 bg-chart-2/10 rounded-r">
                          <div className="font-semibold text-chart-2">Ticket Created</div>
                          <div className="text-xs text-muted-foreground">Ticket #1234 opened</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-features-title">
                Powerful Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg" data-testid="text-features-description">
                Everything you need to manage your Discord server effectively
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover-elevate active-elevate-2 transition-all duration-300" data-testid="card-feature-moderation">
                <CardContent className="p-8 space-y-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Moderation Tools</h3>
                  <p className="text-muted-foreground">
                    Ban, kick, mute, and warn users with powerful slash commands. Keep detailed logs of all actions.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate active-elevate-2 transition-all duration-300" data-testid="card-feature-tickets">
                <CardContent className="p-8 space-y-4">
                  <div className="h-14 w-14 rounded-xl bg-chart-2/10 flex items-center justify-center">
                    <MessageSquare className="h-7 w-7 text-chart-2" />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Ticket System</h3>
                  <p className="text-muted-foreground">
                    Organize support requests with a complete ticket system. Create, manage, and close tickets easily.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate active-elevate-2 transition-all duration-300" data-testid="card-feature-analytics">
                <CardContent className="p-8 space-y-4">
                  <div className="h-14 w-14 rounded-xl bg-chart-3/10 flex items-center justify-center">
                    <BarChart3 className="h-7 w-7 text-chart-3" />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Server Analytics</h3>
                  <p className="text-muted-foreground">
                    Track moderation actions, ticket statistics, and member activity from your dashboard.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-commands-title">
                Slash Commands
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Intuitive commands that are easy to use and remember
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card data-testid="card-commands-moderation">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Moderation Commands</h3>
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <code className="text-primary">/ban</code>
                      <span className="text-muted-foreground">@user [reason]</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <code className="text-primary">/kick</code>
                      <span className="text-muted-foreground">@user [reason]</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <code className="text-primary">/mute</code>
                      <span className="text-muted-foreground">@user [duration] [reason]</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <code className="text-primary">/warn</code>
                      <span className="text-muted-foreground">@user [reason]</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-commands-tickets">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="h-6 w-6 text-chart-2" />
                    <h3 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Ticket Commands</h3>
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <code className="text-chart-2">/ticket create</code>
                      <span className="text-muted-foreground">[subject]</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <code className="text-chart-2">/ticket close</code>
                      <span className="text-muted-foreground">[reason]</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <code className="text-chart-2">/ticket add</code>
                      <span className="text-muted-foreground">@user</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <code className="text-chart-2">/ticket remove</code>
                      <span className="text-muted-foreground">@user</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3" data-testid="trust-uptime">
                <div className="h-14 w-14 rounded-xl bg-chart-2/10 flex items-center justify-center mx-auto">
                  <Clock className="h-7 w-7 text-chart-2" />
                </div>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>99.9% Uptime</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade reliability so your bot is always online
                </p>
              </div>

              <div className="space-y-3" data-testid="trust-fast">
                <div className="h-14 w-14 rounded-xl bg-chart-4/10 flex items-center justify-center mx-auto">
                  <Zap className="h-7 w-7 text-chart-4" />
                </div>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Commands execute instantly with minimal latency
                </p>
              </div>

              <div className="space-y-3" data-testid="trust-community">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Community Driven</h3>
                <p className="text-muted-foreground">
                  Built with feedback from thousands of server owners
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-cta-title">
              Ready to upgrade your server?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of Discord communities using Zyx to keep their servers safe and organized.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="px-8" asChild data-testid="button-cta-add">
                <a href="https://discord.com/oauth2/authorize?client_id=1444747223505047604&permissions=8&scope=bot%20applications.commands" target="_blank" rel="noopener noreferrer">
                  <SiDiscord className="mr-2 h-5 w-5" />
                  Add to Discord
                </a>
              </Button>
              <Button size="lg" variant="outline" className="px-8" asChild data-testid="button-cta-support">
                <a href="https://discord.com/oauth2/authorize?client_id=1444747223505047604&permissions=8&scope=bot%20applications.commands">
                  Join Support Server
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <ZyxLogo size="sm" />
            <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
              Made with care for Discord communities
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}