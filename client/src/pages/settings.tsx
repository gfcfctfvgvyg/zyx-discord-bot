import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  LogOut,
  ExternalLink,
  Shield,
  Bot,
  Zap,
} from "lucide-react";
import { SiDiscord } from "react-icons/si";

export default function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Removed premature auth check - handled by App.tsx router

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-settings-title">
          Settings
        </h1>
        <p className="text-muted-foreground" data-testid="text-settings-subtitle">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
        <Card data-testid="card-profile">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={user?.profileImageUrl || undefined} 
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-lg font-semibold" data-testid="text-user-name">{displayName}</p>
                <p className="text-sm text-muted-foreground" data-testid="text-user-email">{user?.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-xs text-muted-foreground">Your current plan</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Zap className="mr-1 h-3 w-3" />
                  Free
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-xs text-muted-foreground">When you joined</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-bot-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Bot className="h-5 w-5" />
              Bot Information
            </CardTitle>
            <CardDescription>
              Details about Zyx
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Z
                </span>
              </div>
              <div>
                <p className="font-semibold">Zyx Bot</p>
                <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              </div>
              <Badge variant="secondary" className="ml-auto bg-chart-2/10 text-chart-2 border-chart-2/20">
                Online
              </Badge>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild data-testid="button-support-server">
                <a href="https://discord.gg" target="_blank" rel="noopener noreferrer">
                  <SiDiscord className="mr-2 h-4 w-4" />
                  Join Support Server
                  <ExternalLink className="ml-auto h-4 w-4" />
                </a>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild data-testid="button-invite-bot">
                <a href="/api/login">
                  <Bot className="mr-2 h-4 w-4" />
                  Add to Another Server
                  <ExternalLink className="ml-auto h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-security">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <SiDiscord className="h-5 w-5 text-[#5865F2]" />
                <div>
                  <p className="text-sm font-medium">Connected Account</p>
                  <p className="text-xs text-muted-foreground">Signed in with your account</p>
                </div>
              </div>
              <Badge variant="outline" className="text-chart-2 border-chart-2/50">
                Connected
              </Badge>
            </div>

            <Button 
              variant="outline" 
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" 
              asChild
              data-testid="button-logout"
            >
              <a href="/api/logout">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
