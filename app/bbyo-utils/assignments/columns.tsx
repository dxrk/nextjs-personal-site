import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Assignment = {
  name: string;
  [key: string]: string;
};

export const columns = (numSessions: number): ColumnDef<Assignment>[] => {
  // Generate columns dynamically based on the number of sessions
  const sessionColumns = Array.from({ length: numSessions }, (_, index) => ({
    header: ({ column }: { column: any }) => {
      const sessionNumber = index + 1;
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {`Session ${sessionNumber}`}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: `session${index + 1}`, // Accessor key based on index
  }));

  // Always include a 'Name' column
  const nameColumn: ColumnDef<Assignment> = {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "name",
  };

  // Concatenate 'Name' column with session columns
  return [nameColumn, ...sessionColumns];
};
