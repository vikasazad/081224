"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Eye,
  ExternalLink,
  Plus,
  Search,
  Settings,
  X,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlatformFilter } from "./platform-filter";

export function ReputationAlerts() {
  const [platform, setPlatform] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // This would be fetched from your API based on the filters
  const alerts = [
    {
      id: "1",
      platform: "twitter",
      type: "mention",
      user: {
        name: "Alex Rivera",
        username: "alexr",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "@hotelname The service at your restaurant was terrible. Waited over an hour for food!",
      date: "2023-07-13T19:45:00Z",
      status: "new",
      keywords: ["terrible", "waited", "hour"],
    },
    {
      id: "2",
      platform: "facebook",
      type: "review",
      user: {
        name: "Jennifer Lee",
        username: "jenniferl",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Very disappointed with my stay. The room was not clean and staff was unhelpful when I complained.",
      date: "2023-07-10T14:20:00Z",
      status: "in_progress",
      keywords: ["disappointed", "not clean", "unhelpful"],
    },
    {
      id: "3",
      platform: "instagram",
      type: "comment",
      user: {
        name: "Marcus Johnson",
        username: "marcusj",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: "Food was cold and overpriced. Not worth the hype at all.",
      date: "2023-07-08T20:15:00Z",
      status: "resolved",
      keywords: ["cold", "overpriced", "not worth"],
    },
    {
      id: "4",
      platform: "google",
      type: "review",
      user: {
        name: "Sophia Chen",
        username: "sophiac",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "2 stars. Decent location but poor customer service. The manager was rude when we asked for a room change.",
      date: "2023-07-05T11:30:00Z",
      status: "new",
      keywords: ["poor", "rude", "2 stars"],
    },
    {
      id: "5",
      platform: "tripadvisor",
      type: "review",
      user: {
        name: "Robert Williams",
        username: "robertw",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Worst hotel experience ever. Noisy, dirty, and expensive. Avoid at all costs!",
      date: "2023-07-02T16:45:00Z",
      status: "in_progress",
      keywords: ["worst", "noisy", "dirty", "avoid"],
    },
  ];

  // Filter alerts based on selected platform and search query
  const filteredAlerts = alerts.filter((alert) => {
    const platformMatch = platform === "all" || alert.platform === platform;
    const searchMatch =
      searchQuery === "" ||
      alert.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return platformMatch && searchMatch;
  });

  // Get the selected alert details
  const alertDetails = selectedAlert
    ? alerts.find((a) => a.id === selectedAlert)
    : null;

  const handleResolveAlert = (id: string) => {
    // In a real app, this would update the alert status in Firestore
    console.log(`Resolving alert ${id}`);
  };

  const handleIgnoreAlert = (id: string) => {
    // In a real app, this would update the alert status in Firestore
    console.log(`Ignoring alert ${id}`);
  };

  // This would be fetched from Firestore in a real app
  const keywordSettings = [
    { id: "1", keyword: "terrible", enabled: true },
    { id: "2", keyword: "worst", enabled: true },
    { id: "3", keyword: "disappointed", enabled: true },
    { id: "4", keyword: "poor", enabled: true },
    { id: "5", keyword: "bad", enabled: true },
    { id: "6", keyword: "awful", enabled: true },
    { id: "7", keyword: "rude", enabled: true },
    { id: "8", keyword: "dirty", enabled: true },
    { id: "9", keyword: "not clean", enabled: true },
    { id: "10", keyword: "avoid", enabled: true },
  ];

  const [keywords, setKeywords] = useState(keywordSettings);
  const [newKeyword, setNewKeyword] = useState("");

  const handleToggleKeyword = (id: string) => {
    setKeywords(
      keywords.map((k) => (k.id === id ? { ...k, enabled: !k.enabled } : k))
    );
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;

    // In a real app, this would save to Firestore
    setKeywords([
      ...keywords,
      { id: `new-${Date.now()}`, keyword: newKeyword, enabled: true },
    ]);
    setNewKeyword("");
  };

  const handleDeleteKeyword = (id: string) => {
    // In a real app, this would delete from Firestore
    setKeywords(keywords.filter((k) => k.id !== id));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Reputation Alerts</CardTitle>
                <CardDescription>
                  Monitor and respond to negative feedback
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <PlatformFilter value={platform} onValueChange={setPlatform} />
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-2">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted ${
                        selectedAlert === alert.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedAlert(alert.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage
                              src={alert.user.avatar}
                              alt={alert.user.name}
                            />
                            <AvatarFallback>
                              {alert.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {alert.user.name}
                              </span>
                              {alert.status === "new" && (
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{alert.user.username}
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm">
                              {alert.content}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(alert.date), "MMM d")}
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {alert.platform}
                          </Badge>
                          {alert.status === "new" && (
                            <Badge variant="destructive" className="mt-1">
                              New Alert
                            </Badge>
                          )}
                          {alert.status === "in_progress" && (
                            <Badge variant="secondary" className="mt-1">
                              In Progress
                            </Badge>
                          )}
                          {alert.status === "resolved" && (
                            <Badge variant="outline" className="mt-1">
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="new" className="mt-4">
                <div className="space-y-2">
                  {filteredAlerts
                    .filter((alert) => alert.status === "new")
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted ${
                          selectedAlert === alert.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedAlert(alert.id)}
                      >
                        {/* Same content as above */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage
                                src={alert.user.avatar}
                                alt={alert.user.name}
                              />
                              <AvatarFallback>
                                {alert.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {alert.user.name}
                                </span>
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{alert.user.username}
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm">
                                {alert.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(alert.date), "MMM d")}
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {alert.platform}
                            </Badge>
                            <Badge variant="destructive" className="mt-1">
                              New Alert
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="in_progress" className="mt-4">
                <div className="space-y-2">
                  {filteredAlerts
                    .filter((alert) => alert.status === "in_progress")
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted ${
                          selectedAlert === alert.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedAlert(alert.id)}
                      >
                        {/* Same content as above */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage
                                src={alert.user.avatar}
                                alt={alert.user.name}
                              />
                              <AvatarFallback>
                                {alert.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {alert.user.name}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{alert.user.username}
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm">
                                {alert.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(alert.date), "MMM d")}
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {alert.platform}
                            </Badge>
                            <Badge variant="secondary" className="mt-1">
                              In Progress
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {selectedAlert ? (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={alertDetails?.user.avatar}
                      alt={alertDetails?.user.name}
                    />
                    <AvatarFallback>
                      {alertDetails?.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{alertDetails?.user.name}</CardTitle>
                    <CardDescription>
                      @{alertDetails?.user.username} • {alertDetails?.platform}{" "}
                      {alertDetails?.type}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Original
                    </a>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Mark as Seen
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Export Details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(
                    new Date(alertDetails?.date || ""),
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </div>
                <Badge
                  variant={
                    alertDetails?.status === "new"
                      ? "destructive"
                      : alertDetails?.status === "in_progress"
                      ? "secondary"
                      : "outline"
                  }
                  className="ml-auto capitalize"
                >
                  {alertDetails?.status === "new"
                    ? "New Alert"
                    : alertDetails?.status === "in_progress"
                    ? "In Progress"
                    : "Resolved"}
                </Badge>
              </div>

              <div className="mb-4 rounded-lg border p-4">
                <p>{alertDetails?.content}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {alertDetails?.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-2 font-medium">Response Notes</h3>
                <Textarea
                  placeholder="Add notes about how this alert was handled..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  onClick={() => handleResolveAlert(alertDetails?.id || "")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Resolved
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleIgnoreAlert(alertDetails?.id || "")}
                >
                  <X className="mr-2 h-4 w-4" />
                  Ignore Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-full items-center justify-center p-6">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="mb-2 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No alert selected</h3>
              <p className="text-sm text-muted-foreground">
                Select an alert from the list to view details and take action
              </p>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Alert Settings</DialogTitle>
            <DialogDescription>
              Configure keywords that trigger alerts and notification settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Alert Keywords</h3>
              <p className="text-sm text-muted-foreground">
                Add keywords that will trigger alerts when they appear in
                comments or reviews
              </p>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add new keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                />
                <Button onClick={handleAddKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-2 max-h-[200px] overflow-y-auto rounded-md border p-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="w-[100px] text-center">
                        Enabled
                      </TableHead>
                      <TableHead className="w-[80px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywords.map((keyword) => (
                      <TableRow key={keyword.id}>
                        <TableCell>{keyword.keyword}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={keyword.enabled}
                            onCheckedChange={() =>
                              handleToggleKeyword(keyword.id)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteKeyword(keyword.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Notification Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in-app-notifications">
                    In-App Notifications
                  </Label>
                  <Switch id="in-app-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch id="sms-notifications" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsSettingsOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
