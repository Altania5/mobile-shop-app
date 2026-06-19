"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomerVehiclePicker } from "./CustomerVehiclePicker";

const schema = z.object({
  description: z.string().min(1, "Required — describe what the customer is reporting"),
  technician: z.string().optional(),
  serviceLocation: z.string().optional(),
  scheduledAt: z.string().optional(),
  mileageIn: z.number().int().nonnegative().optional(),
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultCustomerId?: string;
  defaultVehicleId?: string;
}

export function WorkOrderForm({ defaultCustomerId, defaultVehicleId }: Props) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? "");
  const [vehicleId, setVehicleId] = useState(defaultVehicleId ?? "");
  const [pickError, setPickError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    if (!customerId) { setPickError("Select a customer"); return; }
    if (!vehicleId) { setPickError("Select a vehicle"); return; }
    setPickError("");

    const res = await fetch("/api/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        customerId,
        vehicleId,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        mileageIn: data.mileageIn || null,
      }),
    });

    if (!res.ok) { alert("Failed to create work order."); return; }

    const wo = await res.json();
    router.push(`/work-orders/${wo.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer + Vehicle */}
      <CustomerVehiclePicker
        defaultCustomerId={defaultCustomerId}
        defaultVehicleId={defaultVehicleId}
        onCustomerChange={setCustomerId}
        onVehicleChange={setVehicleId}
      />
      {pickError && <p className="text-xs text-red-600">{pickError}</p>}

      {/* Description */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Customer Complaint / Reason for Visit *</label>
        <Textarea
          {...register("description")}
          placeholder="Customer reports engine light on, rattling noise from front brakes…"
          rows={3}
        />
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>

      {/* Schedule + Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Scheduled Date & Time</label>
          <Input {...register("scheduledAt")} type="datetime-local" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Service Location</label>
          <Input {...register("serviceLocation")} placeholder="Customer's driveway address…" />
        </div>
      </div>

      {/* Technician + Mileage */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Technician</label>
          <Input {...register("technician")} placeholder="Your name" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Mileage In</label>
          <Input
            {...register("mileageIn", { valueAsNumber: true })}
            type="number"
            min={0}
            placeholder="62500"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Internal Notes</label>
        <Textarea {...register("internalNotes")} placeholder="Notes visible only to you…" rows={2} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create Work Order"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
