"use client";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

interface PostEngagementTableProps {
  platform: string;
  postType: string;
  dateRange: DateRange | undefined;
}

export function PostEngagementTable({
  platform,
  postType,
}: PostEngagementTableProps) {
  // This would be fetched from your API based on the filters
  const posts = [
    {
      id: "1",
      platform: "instagram",
      type: "image",
      thumbnail: "/avatars/01.png",
      caption: "Enjoy our new summer menu with a view! #foodie #summervibes",
      date: "2023-07-15T12:00:00Z",
      likes: 245,
      comments: 32,
      shares: 18,
      saves: 27,
      reach: 1250,
      url: "https://instagram.com/p/123456",
    },
    {
      id: "2",
      platform: "facebook",
      type: "carousel",
      thumbnail: "/avatars/01.png",
      caption:
        "Take a tour of our newly renovated rooms! Book now for the holiday season.",
      date: "2023-07-12T15:30:00Z",
      likes: 189,
      comments: 45,
      shares: 32,
      saves: 0,
      reach: 2100,
      url: "https://facebook.com/posts/123456",
    },
    {
      id: "3",
      platform: "instagram",
      type: "video",
      thumbnail: "/avatars/01.png",
      caption:
        "Behind the scenes with our chef! Watch how we prepare our signature dish.",
      date: "2023-07-10T18:45:00Z",
      likes: 312,
      comments: 56,
      shares: 41,
      saves: 38,
      reach: 1850,
      url: "https://instagram.com/p/789012",
    },
    {
      id: "4",
      platform: "twitter",
      type: "image",
      thumbnail: "/avatars/01.png",
      caption:
        "We're excited to announce our weekend special! RT to win a free dinner for two.",
      date: "2023-07-08T09:15:00Z",
      likes: 156,
      comments: 28,
      shares: 87,
      saves: 0,
      reach: 3200,
      url: "https://twitter.com/status/123456",
    },
    {
      id: "5",
      platform: "youtube",
      type: "video",
      thumbnail: "/avatars/01.png",
      caption: "Hotel Tour: Experience luxury like never before",
      date: "2023-07-05T14:20:00Z",
      likes: 423,
      comments: 67,
      shares: 29,
      saves: 0,
      reach: 4500,
      url: "https://youtube.com/watch?v=123456",
    },
  ];

  // Filter posts based on selected platform and post type
  const filteredPosts = posts.filter((post) => {
    const platformMatch = platform === "all" || post.platform === platform;
    const typeMatch = postType === "all" || post.type === postType;
    return platformMatch && typeMatch;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Post</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Likes</TableHead>
            <TableHead className="text-center">Comments</TableHead>
            <TableHead className="text-center">Shares</TableHead>
            <TableHead className="text-center">Saves</TableHead>
            <TableHead className="text-center">Reach</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md">
                    <Image
                      src={post.thumbnail}
                      alt={post.caption}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="max-w-[200px] truncate">{post.caption}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {post.platform}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(post.date), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="h-3 w-3 text-rose-500" />
                  {post.likes}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <MessageSquare className="h-3 w-3 text-sky-500" />
                  {post.comments}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Share2 className="h-3 w-3 text-emerald-500" />
                  {post.shares}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Bookmark className="h-3 w-3 text-amber-500" />
                  {post.saves}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3 text-purple-500" />
                  {post.reach}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Original
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Export Data</DropdownMenuItem>
                    <DropdownMenuItem>Add to Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
