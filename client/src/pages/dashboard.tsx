import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  MessageSquare,
  Shield,
  Clock,
  ArrowUpRight,
  Ban,
  UserX,
  VolumeX,
  AlertTriangle,
  Ticket,
  Plus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Server, ModAction, Ticket as TicketType } from "@shared/schema";

interface DashboardStats {
  totalServers: number;
  totalMembers: number;
  openTickets: number;
  modActionsToday: number;
}

interface RecentActivity {
  modActions: ModAction[];
  tickets: TicketType[];
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  loading = false,
  testId
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: string;
  loading?: boolean;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
            )}
            {trend && !loading && (
              <p className="text-xs text-chart-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const actionIcons = {
  ban: Ban,
  kick: UserX,
  mute: VolumeX,
  warn: AlertTriangle,
};

const actionColors = {
  ban: "bg-destructive/10 text-destructive",
  kick: "bg-chart-4/10 text-chart-4",
  mute: "bg-chart-3/10 text-chart-3",
  warn: "bg-chart-4/10 text-chart-4",
};

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Removed premature auth check - handled by App.tsx router

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: activity, isLoading: activityLoading } = useQuery<RecentActivity>({
    queryKey: ["/api/dashboard/activity"],
    enabled: isAuthenticated,
  });

  const { data: servers, isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
          Welcome back! Here's an overview of your servers.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Servers"
          value={stats?.totalServers ?? 0}
          icon={Users}
          loading={statsLoading}
          testId="stat-total-servers"
        />
        <StatCard
          title="Total Members"
          value={stats?.totalMembers ?? 0}
          icon={Users}
          loading={statsLoading}
          testId="stat-total-members"
        />
        <StatCard
          title="Open Tickets"
          value={stats?.openTickets ?? 0}
          icon={MessageSquare}
          loading={statsLoading}
          testId="stat-open-tickets"
        />
        <StatCard
          title="Mod Actions Today"
          value={stats?.modActionsToday ?? 0}
          icon={Shield}
          loading={statsLoading}
          testId="stat-mod-actions"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Recent Activity</CardTitle>
              <CardDescription>Latest moderation actions across your servers</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity?.modActions && activity.modActions.length > 0 ? (
                <div className="space-y-4">
                  {activity.modActions.slice(0, 5).map((action) => {
                    const Icon = actionIcons[action.actionType as keyof typeof actionIcons] || Shield;
                    const colorClass = actionColors[action.actionType as keyof typeof actionColors] || "bg-muted text-muted-foreground";
                    
                    return (
                      <div key={action.id} className="flex items-center gap-4" data-testid={`activity-${action.id}`}>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            <span className="capitalize">{action.actionType}</span>
                            {" - "}
                            <span className="text-muted-foreground">{action.targetName}</span>
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            by {action.moderatorName} {action.reason ? `• ${action.reason}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {action.createdAt ? new Date(String(action.createdAt)).toLocaleDateString() : "Recent"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent moderation actions</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Actions from your servers will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-open-tickets">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Open Tickets</CardTitle>
                <CardDescription>Tickets awaiting response</CardDescription>
              </div>
              <Badge variant="secondary" className="h-6">
                {activity?.tickets?.filter(t => t.status === "open").length ?? 0} open
              </Badge>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : activity?.tickets && activity.tickets.filter(t => t.status === "open").length > 0 ? (
                <div className="space-y-3">
                  {activity.tickets.filter(t => t.status === "open").slice(0, 5).map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                      data-testid={`ticket-${ticket.id}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-chart-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {ticket.subject || `Ticket from ${ticket.creatorName}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created by {ticket.creatorName}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-chart-2 border-chart-2/50">
                        Open
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No open tickets</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    All caught up! No pending support requests.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" data-testid="button-add-server">
                <Plus className="mr-2 h-4 w-4" />
                Add New Server
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild data-testid="button-mod-settings">
                <a href="/dashboard/moderation">
                  <Shield className="mr-2 h-4 w-4" />
                  Moderation Settings
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild data-testid="button-ticket-settings">
                <a href="/dashboard/tickets">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ticket Settings
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-servers">
            <CardHeader>
              <CardTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Your Servers</CardTitle>
              <CardDescription>Servers where Zyx is active</CardDescription>
            </CardHeader>
            <CardContent>
              {serversLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14" />
                  ))}
                </div>
              ) : servers && servers.length > 0 ? (
                <div className="space-y-3">
                  {servers.slice(0, 5).map((server) => (
                    <div 
                      key={server.id} 
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover-elevate"
                      data-testid={`server-${server.id}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {server.iconUrl ? (
                          <img 
                            src={server.iconUrl} 
                            alt={server.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {server.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{server.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {server.memberCount?.toLocaleString() ?? 0} members
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No servers yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Add Zyx to a server to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
