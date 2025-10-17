// /frontend/src/app/groups/[groupId]/manage/page.tsx
"use client";

import * as React from "react";
import { useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, ArrowLeft, Loader2, MailPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


type Role = "OWNER" | "ADMIN" | "MEMBER";

type Member = {
  membershipId: string;
  userId: string;
  name?: string;
  email: string;
  role: Role;
  joinedAt?: string;
};

type GroupData = {
  id: string;
  name: string;
  description?: string;
  currentUserGroupRole?: Role;
};

type Me = {
  id: string;
  email: string;
  name?: string;
};

export default function GroupManagementPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = React.useState<GroupData | null>(null);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [me, setMe] = React.useState<Me | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviting, setInviting] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);

  const [removeId, setRemoveId] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState(false);

  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Load group, members, and current user
  React.useEffect(() => {
    let cancel = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [groupRes, membersRes] = await Promise.all([
          api<GroupData>(`/api/groups/${groupId}`, { method: "GET" }),
          api<Member[]>(`/api/groups/${groupId}/members`, { method: "GET" }),
        ]);

        let meRes: Me | null = null;
        try {
          meRes = await api<Me>("/api/me", { method: "GET" });
        } catch {
          meRes = null;
        }

        if (!cancel) {
          setGroup(groupRes);
          setMembers(membersRes);
          setMe(meRes);
        }
      } catch (e: unknown) {
        if (!cancel) setError(e instanceof Error ? e.message : "Failed to load group management");
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    if (groupId) load();
    return () => {
      cancel = true;
    };
  }, [groupId]);

  // Get current user's role from group data (preferred) or fallback to members list
  const myRole: Role | null = React.useMemo(() => {
    // First try to get role from group data
    if (group?.currentUserGroupRole) {
      return group.currentUserGroupRole;
    }
    
    // Fallback: derive from members list
    if (!members.length) return null;
    if (me?.id) {
      const mineById = members.find((m) => m.userId === me.id);
      if (mineById) return mineById.role;
    }
    if (me?.email) {
      const mineByEmail = members.find(
        (m) => m.email?.toLowerCase() === me.email.toLowerCase()
      );
      if (mineByEmail) return mineByEmail.role;
    }
    return null;
  }, [group?.currentUserGroupRole, members, me]);

  const canInvite = myRole === "OWNER" || myRole === "ADMIN";
  const canRemove = useCallback((target: Member): boolean => {
    if (!myRole) return false;
    if (myRole === "OWNER") {
      // OWNER can remove anyone except themselves (optional guard)
      return target.role !== "OWNER" || target.userId !== me?.id;
    }
    if (myRole === "ADMIN") {
      // ADMIN can remove MEMBERs only
      return target.role === "MEMBER";
    }
    return false;
  }, [myRole, me?.id]);

  // Column definitions for the members table
  const columns: ColumnDef<Member>[] = React.useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="noShadow"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Member
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const member = row.original;
        const isMe = (me?.id && member.userId === me.id) || 
                     (me?.email && member.email?.toLowerCase() === me.email.toLowerCase());
        
        return (
          <div className="min-w-0">
            <div className="font-semibold leading-tight">
              {member.name || member.email.split("@")[0]}
              {isMe ? (
                <span className="ml-2 inline-flex items-center rounded-base border-2 border-border bg-main px-1.5 py-0.5 text-[11px] font-semibold text-main-foreground shadow-shadow">
                  You
                </span>
              ) : null}
            </div>
            {member.joinedAt && (
              <div className="text-xs text-foreground/70 font-medium">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="noShadow"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as Role;
        return <RolePill role={role} />;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const member = row.original;
        const isMe = (me?.id && member.userId === me.id) || 
                     (me?.email && member.email?.toLowerCase() === me.email.toLowerCase());
        const canRemoveThis = canRemove(member) && !isMe;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="noShadow" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(member.email)}
              >
                Copy email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setRemoveId(member.membershipId)}
                disabled={!canRemoveThis}
                className="text-red-600"
              >
                Remove member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [me, canRemove]);

  // Table configuration
  const table = useReactTable({
    data: members,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  async function reloadMembers() {
    try {
      const data = await api<Member[]>(`/api/groups/${groupId}/members`, {
        method: "GET",
      });
      setMembers(data);
    } catch (e) {
      console.error(e);
    }
  }

  // Invite flow (fixed: single request + proper finally)
  async function onInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setInviteError("Please enter an email.");
      return;
    }
    setInviteError(null);
    setInviting(true);
    try {
      await api<void>(`/api/groups/${groupId}/members/invite`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      setInviteOpen(false);
      setInviteEmail("");
      await reloadMembers();
    } catch (e: unknown) {
      setInviteError(e instanceof Error ? e.message : "Failed to invite member");
    } finally {
      setInviting(false);
    }
  }

  // Remove flow
  async function confirmRemove() {
    if (!removeId) return;
    setRemoving(true);
    try {
      await api<void>(`/api/groups/${groupId}/members/${removeId}`, {
        method: "DELETE",
      });
      setRemoveId(null);
      await reloadMembers();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to remove member");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <RequireAuth>
      <main className="relative isolate pt-14">
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-background" />
        <div
          className="
            absolute inset-0 -z-10 pointer-events-none
            bg-[linear-gradient(to_right,var(--grid-line)_2px,transparent_2px),linear-gradient(to_bottom,var(--grid-line)_2px,transparent_2px)]
            [background-size:var(--grid-size)_var(--grid-size)]
          "
        />

        <section className="min-h-[calc(100vh-3.5rem)] px-4 py-8 relative z-0">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="neutral"
                  className="border-2 border-border shadow-shadow"
                >
                  <Link href={`/groups/${groupId}`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Group
                  </Link>
                </Button>

                <div>
                  <h1 className="font-bold text-3xl">Group Management</h1>
                  <p className="text-foreground/70 font-medium">
                    Manage members and permissions
                  </p>
                </div>
              </div>

              <Button
                className="font-semibold bg-main text-main-foreground border-2 border-border shadow-shadow"
                onClick={() => setInviteOpen(true)}
                disabled={!canInvite}
                title={!canInvite ? "Only owner/admins can invite" : undefined}
              >
                <MailPlus className="w-5 h-5 mr-2" />
                Invite Member
              </Button>
            </div>

            {/* Loading/Error */}
            {loading && (
              <Card className="mb-6 border-2 border-border shadow-shadow bg-secondary-background">
                <CardHeader className="animate-pulse">
                  <div className="h-5 w-40 bg-foreground/10 rounded" />
                  <div className="mt-2 h-4 w-72 bg-foreground/10 rounded" />
                </CardHeader>
                <CardContent className="animate-pulse">
                  <div className="h-10 w-full bg-foreground/10 rounded mb-3" />
                  <div className="h-10 w-full bg-foreground/10 rounded" />
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="mb-6 border-2 border-border shadow-shadow bg-secondary-background">
                <CardHeader>
                  <CardTitle className="text-red-600">Error</CardTitle>
                  <CardDescription className="font-medium">
                    {error}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Group info */}
            {!loading && !error && group && (
              <Card className="mb-6 border-2 border-border shadow-shadow bg-secondary-background">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <CardTitle className="font-semibold">{group.name}</CardTitle>
                  </div>
                  <span className="inline-flex items-center rounded-base border-2 border-border bg-background px-2 py-1 text-xs font-semibold shadow-shadow">
                    Your role:&nbsp;
                    <span className="uppercase">{myRole ?? "UNKNOWN"}</span>
                  </span>
                </CardHeader>
                {group.description && (
                  <CardContent>
                    <CardDescription className="font-medium">
                      {group.description}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Members list */}
            {!loading && !error && (
              <Card className="border-2 border-border shadow-shadow bg-secondary-background">
                <CardHeader>
                  <CardTitle className="font-semibold">Members</CardTitle>
                  <CardDescription className="font-medium">
                    {members.length} member{members.length === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="w-full font-base text-main-foreground">
                    <div className="flex items-center py-4">
                      <Input
                        placeholder="Filter emails..."
                        value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                          table.getColumn("email")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="noShadow" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                              return (
                                <DropdownMenuCheckboxItem
                                  key={column.id}
                                  className="capitalize"
                                  checked={column.getIsVisible()}
                                  onCheckedChange={(value) =>
                                    column.toggleVisibility(!!value)
                                  }
                                >
                                  {column.id}
                                </DropdownMenuCheckboxItem>
                              )
                            })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div>
                      <Table>
                        <TableHeader className="font-heading">
                          {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                              className="bg-secondary-background text-foreground"
                              key={headerGroup.id}
                            >
                              {headerGroup.headers.map((header) => {
                                return (
                                  <TableHead className="text-foreground" key={header.id}>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext(),
                                        )}
                                  </TableHead>
                                )
                              })}
                            </TableRow>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                              <TableRow
                                className="bg-secondary-background text-foreground data-[state=selected]:bg-main data-[state=selected]:text-main-foreground"
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <TableCell className="px-4 py-2" key={cell.id}>
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                              >
                                No results.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-end space-x-2 py-4">
                      <div className="text-foreground flex-1 text-sm">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="noShadow"
                          size="sm"
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="noShadow"
                          size="sm"
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="rounded-base border-2 border-border shadow-shadow">
          <DialogHeader>
            <DialogTitle className="font-semibold">Invite member</DialogTitle>
            <DialogDescription className="font-medium">
              Send an invitation to join this group.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onInvite} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-email" className="font-medium">
                Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="name@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>

            {inviteError && (
              <p className="text-sm font-medium text-red-600">{inviteError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="neutral"
                className="border-2 border-border shadow-shadow font-medium"
                onClick={() => setInviteOpen(false)}
                disabled={inviting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="border-2 border-border shadow-shadow font-semibold"
                disabled={inviting}
              >
                {inviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Invite"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <Dialog open={!!removeId} onOpenChange={(open) => !open && setRemoveId(null)}>
        <DialogContent className="rounded-base border-2 border-border shadow-shadow">
          <DialogHeader>
            <DialogTitle className="font-semibold">Remove member?</DialogTitle>
            <DialogDescription className="font-medium">
              This will remove the member from the group. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="neutral"
              className="border-2 border-border shadow-shadow font-medium"
              onClick={() => setRemoveId(null)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              className="border-2 border-border shadow-shadow font-semibold bg-red-500 text-white hover:brightness-95"
              onClick={confirmRemove}
              disabled={removing}
            >
              {removing ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RequireAuth>
  );
}

/* ===== Presentational helpers ===== */

function RolePill({ role }: { role: Role }) {
  const label = role === "OWNER" ? "Owner" : role === "ADMIN" ? "Admin" : "Member";
  const tone =
    role === "OWNER"
      ? "bg-main text-main-foreground"
      : role === "ADMIN"
      ? "bg-background"
      : "bg-secondary-background";

  return (
    <span
      className={[
        "inline-flex items-center rounded-base border-2 border-border px-2 py-0.5 text-xs font-semibold shadow-shadow uppercase",
        tone,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
