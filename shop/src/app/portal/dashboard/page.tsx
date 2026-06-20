import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PortalDashboard } from "@/components/portal/PortalDashboard";

export const metadata = { title: "My Account — Hard Work Mobile" };
export const dynamic = "force-dynamic";

const WO_STATUS: Record<string, string> = {
  PENDING: "Pending",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Complete",
  INVOICED: "Complete",
  PAID: "Complete",
  CANCELLED: "Cancelled",
};

const BR_STATUS: Record<string, string> = {
  NEW: "Submitted",
  CONTACTED: "Contacted",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CONVERTED: "Confirmed",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

export default async function PortalDashboardPage() {
  const session = await auth();
  const u = session?.user as { id?: string; name?: string; userType?: string } | undefined;
  if (!u?.id || u.userType !== "customer") redirect("/portal/login");

  const customer = await prisma.customer.findUnique({
    where: { id: u.id },
    include: {
      vehicles: { orderBy: { createdAt: "desc" } },
      workOrders: { orderBy: { createdAt: "desc" }, include: { vehicle: true } },
      invoices: { orderBy: { createdAt: "desc" }, include: { workOrder: { select: { description: true } } } },
      bookingRequests: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!customer) redirect("/portal/login");

  const jobs = customer.workOrders
    .filter((w) => w.status !== "CANCELLED")
    .map((w) => ({
      id: w.id,
      number: w.number,
      service: w.description,
      vehicle: `${w.vehicle.year} ${w.vehicle.make} ${w.vehicle.model}`,
      status: WO_STATUS[w.status] ?? w.status,
      scheduledAt: w.scheduledAt?.toISOString() ?? null,
      completedAt: w.completedAt?.toISOString() ?? null,
      createdAt: w.createdAt.toISOString(),
    }));

  const vehicles = customer.vehicles.map((v) => ({
    id: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
    vin: v.vin,
    color: v.color,
    mileage: v.mileage,
  }));

  const invoices = customer.invoices
    .filter((i) => i.status !== "DRAFT" && i.status !== "VOID")
    .map((i) => ({
      id: i.id,
      number: i.number,
      service: i.workOrder?.description ?? "",
      total: i.total,
      status: i.status,
      squareInvoiceUrl: i.squareInvoiceUrl,
      paidAt: i.paidAt?.toISOString() ?? null,
      sentAt: i.sentAt?.toISOString() ?? null,
    }));

  const requests = customer.bookingRequests.map((b) => ({
    id: b.id,
    service: b.service === "Other" ? `Other — ${b.serviceOther ?? ""}` : b.service,
    vehicle: `${b.vehicleYear} ${b.vehicleMake} ${b.vehicleModel}`,
    status: BR_STATUS[b.status] ?? b.status,
    preferredDate: b.preferredDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <PortalDashboard
      firstName={customer.firstName}
      jobs={jobs}
      vehicles={vehicles}
      invoices={invoices}
      requests={requests}
    />
  );
}
