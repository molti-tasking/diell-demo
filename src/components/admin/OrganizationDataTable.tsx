"use client";

import { Organization } from "@/actions/organization";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserEmail } from "@/lib/hooks/query";
import { TrashIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import {
  ArrowUpDown,
  CheckIcon,
  CircleDashedIcon,
  LinkIcon,
  MailIcon,
  MoreHorizontal,
  SettingsIcon,
  VerifiedIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import * as React from "react";
import { ConfirmDeleteOrganizationDialog } from "../dashboard/ConfirmDeleteOrganizationsDialog";
import { Checkbox } from "../ui/checkbox";
import { CreateInvitationLinkDialog } from "./CreateInvitationLinkDialog";
import { CreateInviteDialog } from "./CreateInviteDialog";
import { VerifyOrganizationDialog } from "./VerifyOrganizationDialog";

export const OrganizationDataTable = ({ data }: { data: Organization[] }) => {
  const t = useTranslations();
  const columns: ColumnDef<Organization>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
        accessorKey: "name" as keyof Organization,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },

      {
        accessorKey: "users" as keyof Organization,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {t("amount-of-users")}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const userList: string[] =
            row.getValue("users" as keyof Organization) ?? [];
          return <div className="text-center">{userList.length}</div>;
        },
      },
      {
        accessorKey: "verified",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {t("verification")}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const verified = row.original.organization_verified?.verified;
          return (
            <div className="flex flex-row items-center justify-center gap-2">
              {verified ? (
                <VerifiedIcon color="white" fill="green" size={"2rem"} />
              ) : (
                <>
                  <CircleDashedIcon color="orange" />
                  <span>{t("not-verified")}</span>
                </>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "created_at" as keyof Organization,
        sortType: "datetime",
        cell: ({ cell }) => {
          const val = cell.getValue() as string;
          return dayjs(val).format("DD.MM.YYYY HH:mm");
        },
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Erstellt am
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "created_by" as keyof Organization,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Erstellt von
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ cell }) => {
          const val = cell.getValue() as string;
          return <CreatedByCell userId={val} />;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <Link href={`/dashboard/${row.original.id}`} target="_blank">
                    View
                  </Link>
                </DropdownMenuItem>

                <CreateInviteDialog
                  organizationId={row.original.id!}
                  organizationName={row.original.name!}
                >
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <MailIcon className="mr-2 h-4 w-4" />
                    {t("invite-user")}
                  </DropdownMenuItem>
                </CreateInviteDialog>

                <VerifyOrganizationDialog
                  verified={row.original.organization_verified?.verified}
                  organizationId={row.original.id!}
                >
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <CheckIcon className="mr-2 h-4 w-4" />
                    {t("verify-organization")}
                  </DropdownMenuItem>
                </VerifyOrganizationDialog>

                <CreateInvitationLinkDialog organizationId={row.original.id!}>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    {t("create-invitation-link")}
                  </DropdownMenuItem>
                </CreateInvitationLinkDialog>

                <ConfirmDeleteOrganizationDialog
                  organizationId={row.original.id!}
                >
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <TrashIcon />
                    {t("delete")}
                  </DropdownMenuItem>
                </ConfirmDeleteOrganizationDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t]
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    state: {
      sorting,
      columnFilters,
    },
  });

  const selectedRows = table.getSelectedRowModel();

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={t("filter-organizations")}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
                  {t("no-results")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {!!selectedRows.rows.length ? (
          <>
            <div className="flex-1 text-sm text-muted-foreground">
              {selectedRows.rows.length} of {table.getRowCount()} total entries
              selected.
            </div>
            <Button
              variant={"destructive"}
              onClick={() =>
                alert(
                  "Diese Funktion ist aus Sicherheitsgründen nicht implementiert.\n\nThis feature is not implemented for security reasons."
                )
              }
            >
              Delete {selectedRows.rows.length} organizations
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} row(s)
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {t("previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {t("next")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CreatedByCell = ({ userId }: { userId: string }) => {
  const { data } = useUserEmail(userId);
  console.log(data, userId);
  return <span>{data?.data?.[0] ? data.data[0].email : userId}</span>;
};
