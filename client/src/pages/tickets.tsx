import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  FolderOpen,
  Users,
  MessageCircle,
  Save,
  Check,
  Ticket,
  Settings2,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Server, TicketSettings, Ticket as TicketType } from "@shared/schema";

export default function Tickets() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [settings, setSettings] = useState<Partial<TicketSettings>>({
    enabled: true,
    categoryId: "",
    supportRoles: [],
    welcomeMessage: "Thank you for creating a ticket! Support will be with you shortly.",
  });

  // Removed premature auth check - handled by App.tsx router

  const { data: servers, isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
    enabled: isAuthenticated,
  });

  const { data: ticketSettings, isLoading: settingsLoading } = useQuery<TicketSettings>({
    queryKey: ["/api/servers", selectedServer, "ticket-settings"],
    enabled: !!selectedServer && isAuthenticated,
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery<TicketType[]>({
    queryKey: ["/api/servers", selectedServer, "tickets"],
    enabled: !!selectedServer && isAuthenticated,
  });

  useEffect(() => {
    if (ticketSettings) {
      setSettings({
        enabled: ticketSettings.enabled ?? true,
        categoryId: ticketSettings.categoryId ?? "",
        supportRoles: ticketSettings.supportRoles ?? [],
        welcomeMessage: ticketSettings.welcomeMessage ?? "Thank you for creating a ticket! Support will be with you shortly.",
      });
      setHasChanges(false);
    }
  }, [ticketSettings]);

  useEffect(() => {
    if (servers && servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<TicketSettings>) => {
      await apiRequest("PATCH", `/api/servers/${selectedServer}/ticket-settings`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", selectedServer, "ticket-settings"] });
      setHasChanges(false);
      toast({
        title: "Settings saved",
        description: "Ticket settings have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const openTickets = tickets?.filter(t => t.status === "open") ?? [];
  const closedTickets = tickets?.filter(t => t.status === "closed") ?? [];

  if (isLoading || serversLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-12 w-64" />
        <div className="space-y-6">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-tickets-title">
            Ticket Settings
          </h1>
          <p className="text-muted-foreground" data-testid="text-tickets-subtitle">
            Configure your server's ticket system
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || saveMutation.isPending}
          data-testid="button-save-settings"
        >
          {saveMutation.isPending ? (
            <>Saving...</>
          ) : hasChanges ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Label>Server:</Label>
        <Select value={selectedServer ?? ""} onValueChange={setSelectedServer}>
          <SelectTrigger className="w-64" data-testid="select-server">
            <SelectValue placeholder="Select a server" />
          </SelectTrigger>
          <SelectContent>
            {servers?.map((server) => (
              <SelectItem key={server.id} value={server.id} data-testid={`server-option-${server.id}`}>
                {server.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedServer ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-lg font-medium">No server selected</p>
            <p className="text-muted-foreground mt-2">
              Select a server above to configure ticket settings
            </p>
          </CardContent>
        </Card>
      ) : settingsLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card data-testid="stat-tickets-open">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Open Tickets</p>
                    <p className="text-3xl font-bold text-chart-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {ticketsLoading ? <Skeleton className="h-8 w-12" /> : openTickets.length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-chart-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-tickets-closed">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Closed Tickets</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {ticketsLoading ? <Skeleton className="h-8 w-12" /> : closedTickets.length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-tickets-total">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Tickets</p>
                    <p className="text-3xl font-bold text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {ticketsLoading ? <Skeleton className="h-8 w-12" /> : (tickets?.length ?? 0)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card data-testid="card-ticket-settings">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Settings2 className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure how tickets work on your server
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid="toggle-tickets">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Ticket System</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable the ticket system
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(v) => updateSetting("enabled", v)}
                    data-testid="switch-tickets"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="categoryId">Ticket Category ID</Label>
                  </div>
                  <Input
                    id="categoryId"
                    placeholder="Enter category ID"
                    value={settings.categoryId ?? ""}
                    onChange={(e) => updateSetting("categoryId", e.target.value)}
                    data-testid="input-category-id"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ticket channels will be created in this category
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="supportRoles">Support Role IDs</Label>
                  </div>
                  <Input
                    id="supportRoles"
                    placeholder="123456789, 987654321"
                    value={settings.supportRoles?.join(", ") ?? ""}
                    onChange={(e) => updateSetting("supportRoles", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    data-testid="input-support-roles"
                  />
                  <p className="text-xs text-muted-foreground">
                    These roles will be pinged when tickets are created
                  </p>

                  {settings.supportRoles && settings.supportRoles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {settings.supportRoles.map((role, i) => (
                        <Badge key={i} variant="secondary" className="font-mono text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-welcome-message">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <MessageCircle className="h-5 w-5" />
                  Welcome Message
                </CardTitle>
                <CardDescription>
                  The message sent when a ticket is created
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your welcome message..."
                  rows={6}
                  value={settings.welcomeMessage ?? ""}
                  onChange={(e) => updateSetting("welcomeMessage", e.target.value)}
                  className="resize-none"
                  data-testid="textarea-welcome-message"
                />
                <p className="text-xs text-muted-foreground">
                  This message will be sent automatically when a user creates a ticket
                </p>

                <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-chart-2">
                  <p className="text-sm font-medium mb-1">Preview</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.welcomeMessage || "No message set"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-recent-tickets">
            <CardHeader>
              <CardTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Recent Tickets</CardTitle>
              <CardDescription>Latest tickets from your server</CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.slice(0, 10).map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                      data-testid={`ticket-row-${ticket.id}`}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        ticket.status === "open" 
                          ? "bg-chart-2/10" 
                          : "bg-muted"
                      }`}>
                        <Ticket className={`h-5 w-5 ${
                          ticket.status === "open" 
                            ? "text-chart-2" 
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {ticket.subject || `Ticket from ${ticket.creatorName}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created by {ticket.creatorName} • {ticket.createdAt ? new Date(String(ticket.createdAt)).toLocaleDateString() : "Recent"}
                        </p>
                      </div>
                      <Badge 
                        variant={ticket.status === "open" ? "default" : "secondary"}
                        className={ticket.status === "open" ? "bg-chart-2 hover:bg-chart-2/80" : ""}
                      >
                        {ticket.status === "open" ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-lg font-medium">No tickets yet</p>
                  <p className="text-muted-foreground mt-2">
                    Tickets will appear here once users create them
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
