import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Ban,
  UserX,
  VolumeX,
  AlertTriangle,
  Hash,
  Settings2,
  Save,
  Check,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Server, ModSettings } from "@shared/schema";
import { useState } from "react";

export default function Moderation() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [settings, setSettings] = useState<Partial<ModSettings>>({
    banEnabled: true,
    kickEnabled: true,
    muteEnabled: true,
    warnEnabled: true,
    modRoles: [],
    logChannelId: "",
  });

  // Removed premature auth check - handled by App.tsx router

  const { data: servers, isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
    enabled: isAuthenticated,
  });

  const { data: modSettings, isLoading: settingsLoading } = useQuery<ModSettings>({
    queryKey: ["/api/servers", selectedServer, "mod-settings"],
    enabled: !!selectedServer && isAuthenticated,
  });

  useEffect(() => {
    if (modSettings) {
      setSettings({
        banEnabled: modSettings.banEnabled ?? true,
        kickEnabled: modSettings.kickEnabled ?? true,
        muteEnabled: modSettings.muteEnabled ?? true,
        warnEnabled: modSettings.warnEnabled ?? true,
        modRoles: modSettings.modRoles ?? [],
        logChannelId: modSettings.logChannelId ?? "",
      });
      setHasChanges(false);
    }
  }, [modSettings]);

  useEffect(() => {
    if (servers && servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ModSettings>) => {
      await apiRequest("PATCH", `/api/servers/${selectedServer}/mod-settings`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", selectedServer, "mod-settings"] });
      setHasChanges(false);
      toast({
        title: "Settings saved",
        description: "Moderation settings have been updated.",
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

  if (isLoading || serversLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-12 w-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-moderation-title">
            Moderation Settings
          </h1>
          <p className="text-muted-foreground" data-testid="text-moderation-subtitle">
            Configure moderation commands and logging for your server
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
            <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-lg font-medium">No server selected</p>
            <p className="text-muted-foreground mt-2">
              Select a server above to configure moderation settings
            </p>
          </CardContent>
        </Card>
      ) : settingsLoading ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="card-command-toggles">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Settings2 className="h-5 w-5" />
                  Command Toggles
                </CardTitle>
                <CardDescription>
                  Enable or disable individual moderation commands
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid="toggle-ban">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Ban className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">/ban</Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently ban users from the server
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.banEnabled}
                    onCheckedChange={(v) => updateSetting("banEnabled", v)}
                    data-testid="switch-ban"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid="toggle-kick">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                      <UserX className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">/kick</Label>
                      <p className="text-sm text-muted-foreground">
                        Remove users from the server (they can rejoin)
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.kickEnabled}
                    onCheckedChange={(v) => updateSetting("kickEnabled", v)}
                    data-testid="switch-kick"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid="toggle-mute">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                      <VolumeX className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">/mute</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily prevent users from sending messages
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.muteEnabled}
                    onCheckedChange={(v) => updateSetting("muteEnabled", v)}
                    data-testid="switch-mute"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid="toggle-warn">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">/warn</Label>
                      <p className="text-sm text-muted-foreground">
                        Issue warnings to users for rule violations
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.warnEnabled}
                    onCheckedChange={(v) => updateSetting("warnEnabled", v)}
                    data-testid="switch-warn"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card data-testid="card-log-channel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Hash className="h-5 w-5" />
                  Log Channel
                </CardTitle>
                <CardDescription>
                  Where moderation actions are logged
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logChannel">Channel ID</Label>
                  <Input
                    id="logChannel"
                    placeholder="Enter channel ID"
                    value={settings.logChannelId ?? ""}
                    onChange={(e) => updateSetting("logChannelId", e.target.value)}
                    data-testid="input-log-channel"
                  />
                  <p className="text-xs text-muted-foreground">
                    Right-click a channel and copy its ID
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-mod-roles">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Shield className="h-5 w-5" />
                  Mod Roles
                </CardTitle>
                <CardDescription>
                  Roles that can use moderation commands
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modRoles">Role IDs (comma-separated)</Label>
                  <Input
                    id="modRoles"
                    placeholder="123456789, 987654321"
                    value={settings.modRoles?.join(", ") ?? ""}
                    onChange={(e) => updateSetting("modRoles", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    data-testid="input-mod-roles"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter Discord role IDs separated by commas
                  </p>
                </div>

                {settings.modRoles && settings.modRoles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {settings.modRoles.map((role, i) => (
                      <Badge key={i} variant="secondary" className="font-mono text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
