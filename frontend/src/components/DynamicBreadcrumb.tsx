"use client";

import { useParams, usePathname } from "next/navigation";
import { useGroups } from "@/hooks/useGroups";
import { useSingleSet } from "@/hooks/useSingleSet";
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
  const { items: groups } = useGroups();

  // Find current group and set information
  const groupId = params.groupId as string;
  const setId = params.setId as string;
  
  const currentGroup = groups.find(group => group.groupId === groupId);
  
  // Fetch set data if we have a setId (for sets or study pages)
  const { item: currentSet } = useSingleSet(setId);

  // Build breadcrumb items based on current path
  const buildBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    // Always start with Groups
    items.push({
      label: "Groups",
      href: "/groups"
    });

    // Determine the groupId - either from params or from set data
    const effectiveGroupId = groupId || currentSet?.groupId;
    
    // Debug logging
    console.log("DynamicBreadcrumb Debug:", {
      pathname,
      groupId,
      setId,
      currentSet: currentSet ? { id: currentSet.id, groupId: currentSet.groupId } : null,
      effectiveGroupId
    });

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

    console.log("DynamicBreadcrumb Items:", items);
    return items;
  };

  const breadcrumbItems = buildBreadcrumbItems();

  // If we have more than 3 items, use ellipsis
  const shouldUseEllipsis = breadcrumbItems.length > 3;
  
  const renderBreadcrumbItems = () => {
    if (!shouldUseEllipsis) {
      // Normal breadcrumb - show all items
      return breadcrumbItems.map((item, index) => (
        <>
          {index > 0 && <BreadcrumbSeparator />}
          <BreadcrumbItem key={index}>
            {item.isCurrentPage ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        </>
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
            <BreadcrumbLink href={firstItem.href}>{firstItem.label}</BreadcrumbLink>
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
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
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
              <BreadcrumbLink href={lastItem.href}>{lastItem.label}</BreadcrumbLink>
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
