"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { api, setNavigationState } from "@/lib/api";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const params = useParams();
  const [fetchedGroupId, setFetchedGroupId] = useState<string | null>(null);

  // Get IDs directly from URL params - no API calls needed for breadcrumb navigation
  const groupId = params.groupId as string;
  const setId = params.setId as string;

  // Reset navigation state when component mounts
  useEffect(() => {
    setNavigationState(false);
  }, [pathname]);

  // Fetch groupId from flashcard set if we're on study page and don't have groupId
  useEffect(() => {
    const fetchGroupIdFromSet = async () => {
      if (pathname.startsWith("/study/") && setId && !groupId) {
        // Debug logging removed for production("Breadcrumb: Fetching groupId for study page");
        try {
          const flashcardSet = await api<{ groupId: string }>(`/api/flashcard-sets/${setId}`, {
            skipAuthRedirect: true
          });
          // Debug logging removed for production("Breadcrumb: Successfully fetched groupId:", flashcardSet.groupId);
          setFetchedGroupId(flashcardSet.groupId);
        } catch {
          // Silently fail - breadcrumb will work without groupId
          // Debug logging removed for production("Breadcrumb: Could not fetch groupId");
        }
      }
    };

    fetchGroupIdFromSet();
  }, [pathname, setId, groupId]);

  // Build breadcrumb items based on current path
  const buildBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    // Always start with Groups
    items.push({
      label: "Groups",
      href: "/groups"
    });

    // Use groupId directly from URL params, or fetch it if we're on study page
    const effectiveGroupId = groupId || fetchedGroupId;
    

    // Only add Flashcard Sets if we have a valid groupId
    if ((pathname.startsWith("/groups/") || pathname.startsWith("/study/") || pathname.startsWith("/sets/")) && effectiveGroupId && effectiveGroupId !== "undefined") {
      // We're in a group's flashcard sets page, study page, or sets page
      items.push({
        label: "Flashcard Sets",
        href: `/groups/${effectiveGroupId}`,
        isCurrentPage: pathname.startsWith("/groups/") && !pathname.includes("/sets/") && !pathname.includes("/study/")
      });
    }

    if (pathname.startsWith("/sets/") && setId) {
      // We're in individual flashcards page - 3 levels
      items.push({
        label: "Flashcards",
        isCurrentPage: true
      });
    }

    if (pathname.startsWith("/study/") && setId && setId !== "undefined") {
      // Study page - 4 levels deep, use ellipsis
      items.push({
        label: "Flashcards",
        href: `/sets/${setId}`
      });
      items.push({
        label: "Study",
        isCurrentPage: true
      });
    }

    return items;
  };

  const breadcrumbItems = buildBreadcrumbItems();

  // If we have more than 3 items, use ellipsis
  const shouldUseEllipsis = breadcrumbItems.length > 3;
  
  
  const renderBreadcrumbItems = () => {
    if (!shouldUseEllipsis) {
      // Normal breadcrumb - show all items
      return breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <BreadcrumbSeparator />}
          <BreadcrumbItem>
            {item.isCurrentPage ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink 
                href={item.href}
                onClick={() => setNavigationState(true)}
              >
                {item.label}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        </React.Fragment>
      ));
    } else {
      // Use ellipsis for 4+ levels
      const firstItem = breadcrumbItems[0];
      const middleItems = breadcrumbItems.slice(1, -1);
      const lastItem = breadcrumbItems[breadcrumbItems.length - 1];

      return (
        <>
          {/* First item */}
          <BreadcrumbItem>
            <BreadcrumbLink 
              href={firstItem.href}
              onClick={() => setNavigationState(true)}
            >
              {firstItem.label}
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          {/* Ellipsis with dropdown for middle items */}
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <BreadcrumbEllipsis className="size-4" />
                <span className="sr-only">Toggle menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {middleItems.map((item, index) => (
                  <DropdownMenuItem key={index} asChild>
                    <BreadcrumbLink 
                      href={item.href}
                      onClick={() => setNavigationState(true)}
                    >
                      {item.label}
                    </BreadcrumbLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          {/* Last item */}
          <BreadcrumbItem>
            {lastItem.isCurrentPage ? (
              <BreadcrumbPage>{lastItem.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink 
                href={lastItem.href}
                onClick={() => setNavigationState(true)}
              >
                {lastItem.label}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        </>
      );
    }
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {renderBreadcrumbItems()}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
