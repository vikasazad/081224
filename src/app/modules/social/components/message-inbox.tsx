"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search,
  Flag,
  CheckCircle,
  MessageSquare,
  Send,
  Instagram,
  Facebook,
  Twitter,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { PlatformFilter } from "./platform-filter";
import { QuickReplyTemplates } from "./quick-reply-templates";
import { FcGoogle } from "react-icons/fc";

export function MessageInbox() {
  const [platform, setPlatform] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [messages, setMessages] = useState([
    {
      id: "1",
      platform: "instagram",
      type: "comment",
      user: {
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "",
      },
      content:
        "The food was amazing! Will definitely be back soon. Do you take reservations for large groups?",
      date: "2023-07-15T14:32:00Z",
      status: "unread",
    },
    {
      id: "2",
      platform: "facebook",
      type: "message",
      user: {
        name: "Michael Chen",
        username: "michaelc",
        avatar: "",
      },
      content:
        "Hi, I'm planning to visit next weekend. Do you have any special events going on?",
      date: "2023-07-14T10:15:00Z",
      status: "replied",
    },
    {
      id: "3",
      platform: "twitter",
      type: "mention",
      user: {
        name: "Alex Rivera",
        username: "alexr",
        avatar: "",
      },
      content:
        "@hotelname The service at your restaurant was terrible. Waited over an hour for food!",
      date: "2023-07-13T19:45:00Z",
      status: "flagged",
    },
    {
      id: "4",
      platform: "instagram",
      type: "direct",
      user: {
        name: "Emily Wilson",
        username: "emilyw",
        avatar: "",
      },
      content:
        "Hello! I left my jacket in your restaurant last night. Is there any way I could get it back?",
      date: "2023-07-12T22:10:00Z",
      status: "unread",
    },
    {
      id: "5",
      platform: "facebook",
      type: "review",
      user: {
        name: "David Thompson",
        username: "davidt",
        avatar: "",
      },
      content:
        "5 stars! The hotel room was beautiful and the staff was incredibly helpful. Will definitely recommend to friends!",
      date: "2023-07-11T16:30:00Z",
      status: "replied",
    },
    {
      id: "6",
      platform: "googlemaps",
      type: "review",
      user: {
        name: "John Doe",
        username: "johndoe",
        avatar: "",
      },
      content:
        "5 stars! The hotel room was beautiful and the staff was incredibly helpful. Will definitely recommend to friends! Will definitely recommend to friends!",
      date: "2023-07-09T16:30:00Z",
      status: "unread",
    },
    {
      id: "7",
      platform: "googlemaps",
      type: "review",
      user: {
        name: "Jane Johnson",
        username: "janejane",
        avatar: "",
      },
      content:
        "4 stars! The hotel room was beautiful and the staff was incredibly helpful. Will definitely recommend to friends!",
      date: "2023-07-10T16:30:00Z",
      status: "replied",
    },
  ]);

  // Fetch Google Maps reviews on component mount
  useEffect(() => {
    const fetchGoogleReviews = async () => {
      console.log("fetching google reviews");
      try {
        const response = await fetch("/api/google-reviews");
        if (response.ok) {
          const data = await response.json();
          if (data.reviews && data.reviews.length > 0) {
            // Append Google reviews to existing messages
            console.log("data", data);
            const formattedReviews: any[] = [];

            data?.reviews?.forEach((review: any) => {
              const username = review.authorAttribution.displayName
                .replace(/\s+/g, "")
                .toLowerCase();

              // Extract unique review ID from the name field
              // Format: "places/{placeId}/reviews/{reviewId}"
              const reviewId = review.name.split("/").pop();

              formattedReviews.push({
                id: reviewId, // Use unique review ID from name field
                platform: "googlemaps",
                type: "review",
                user: {
                  name: review.authorAttribution.displayName,
                  username: username,
                  avatar: review.authorAttribution.photoUri,
                },
                content: `${review.rating} stars! ${review.text.text}`,
                date: review.publishTime,
                status: "unread",
                rating: review.rating,
                googleMapsUri: review.googleMapsUri,
                flagContentUri: review.flagContentUri,
              });
            });

            setMessages((prevMessages) => {
              // Get existing message IDs to avoid duplicates
              const existingIds = new Set(prevMessages.map((msg) => msg.id));

              // Only add reviews that don't already exist
              const newReviews = formattedReviews.filter(
                (review) => !existingIds.has(review.id)
              );

              return [...prevMessages, ...newReviews];
            });
          }
        } else {
          const error = await response.json();
          console.error("Failed to fetch Google reviews:", error);
        }
      } catch (error) {
        console.error("Error fetching Google reviews:", error);
      }
    };

    fetchGoogleReviews();
  }, []);

  // Filter messages based on selected platform, status, and search query
  const filteredMessages = messages.filter((message) => {
    const platformMatch = platform === "all" || message.platform === platform;
    const statusMatch =
      statusFilter === "all" || message.status === statusFilter;
    const searchMatch =
      searchQuery === "" ||
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return platformMatch && statusMatch && searchMatch;
  });

  // Get the selected message details
  const messageDetails = selectedMessage
    ? messages.find((m) => m.id === selectedMessage)
    : null;

  const handleReply = () => {
    if (!replyText.trim()) return;
    // In a real app, this would send the reply to the API
    console.log(`Replying to message ${selectedMessage}: ${replyText}`);
    setReplyText("");
    // Update message status to replied
  };

  const handleQuickReplySelect = (template: string) => {
    setReplyText(template);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Message Inbox</CardTitle>
            <CardDescription>
              Manage comments and messages from all platforms
            </CardDescription>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
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

            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setStatusFilter}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="flagged">Flagged</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-2">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted ${
                        selectedMessage === message.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedMessage(message.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage
                              src={message.user.avatar}
                              alt={message.user.name}
                            />
                            <AvatarFallback>
                              {message.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {message.user.name}
                              </span>
                              {message.status === "unread" && (
                                <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{message.user.username}
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm">
                              {message.content}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(message.date), "MMM d")}
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {message.platform}
                          </Badge>
                          {message.status === "flagged" && (
                            <Badge variant="destructive" className="mt-1">
                              Flagged
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="unread" className="mt-4">
                <div className="space-y-2">
                  {filteredMessages
                    .filter((message) => message.status === "unread")
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted ${
                          selectedMessage === message.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedMessage(message.id)}
                      >
                        {/* Same content as above */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage
                                src={message.user.avatar}
                                alt={message.user.name}
                              />
                              <AvatarFallback>
                                {message.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {message.user.name}
                                </span>
                                <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{message.user.username}
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm">
                                {message.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(message.date), "MMM d")}
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {message.platform}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="flagged" className="mt-4">
                <div className="space-y-2">
                  {filteredMessages
                    .filter((message) => message.status === "flagged")
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted ${
                          selectedMessage === message.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedMessage(message.id)}
                      >
                        {/* Same content as above */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage
                                src={message.user.avatar}
                                alt={message.user.name}
                              />
                              <AvatarFallback>
                                {message.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {message.user.name}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{message.user.username}
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm">
                                {message.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(message.date), "MMM d")}
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {message.platform}
                            </Badge>
                            <Badge variant="destructive" className="mt-1">
                              Flagged
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
        {selectedMessage ? (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={messageDetails?.user.avatar}
                      alt={messageDetails?.user.name}
                    />
                    <AvatarFallback>
                      {messageDetails?.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{messageDetails?.user.name}</CardTitle>
                    <CardDescription>
                      @{messageDetails?.user.username} •{" "}
                      {messageDetails?.platform}{" "}
                      {messageDetails?.type === "direct"
                        ? "message"
                        : messageDetails?.type}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Read
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Flag className="mr-2 h-4 w-4" />
                        Flag Message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Tag className="mr-2 h-4 w-4" />
                        Add Tag
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Export Conversation</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {messageDetails?.platform === "instagram" && (
                    <Instagram className="h-4 w-4" />
                  )}
                  {messageDetails?.platform === "facebook" && (
                    <Facebook className="h-4 w-4" />
                  )}
                  {messageDetails?.platform === "twitter" && (
                    <Twitter className="h-4 w-4" />
                  )}
                  {messageDetails?.platform === "googlemaps" && (
                    <FcGoogle className="h-4 w-4" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(
                    new Date(messageDetails?.date || ""),
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </div>
              </div>

              <div className="mb-6 rounded-lg border p-4">
                <p>{messageDetails?.content}</p>
              </div>

              <div className="space-y-4">
                <QuickReplyTemplates onSelect={handleQuickReplySelect} />

                <div className="flex flex-col gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleReply}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-full items-center justify-center p-6">
            <div className="flex flex-col items-center text-center">
              <MessageSquare className="mb-2 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No message selected</h3>
              <p className="text-sm text-muted-foreground">
                Select a message from the inbox to view and reply
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
