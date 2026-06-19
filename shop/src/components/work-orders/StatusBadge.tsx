import { Badge } from "@/components/ui/badge";
import { WorkOrderStatus } from "@/generated/prisma";

const config: Record<WorkOrderStatus, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" }> = {
  PENDING:     { label: "Pending",     variant: "warning" },
  SCHEDULED:   { label: "Scheduled",   variant: "info" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  COMPLETED:   { label: "Completed",   variant: "success" },
  INVOICED:    { label: "Invoiced",    variant: "default" },
  PAID:        { label: "Paid",        variant: "success" },
  CANCELLED:   { label: "Cancelled",   variant: "destructive" },
};

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
