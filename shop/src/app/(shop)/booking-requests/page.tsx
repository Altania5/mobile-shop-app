import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BookingRequestsClient } from "./BookingRequestsClient";

export const metadata = { title: "Booking Requests" };

export default async function BookingRequestsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <BookingRequestsClient />;
}
