"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  description: z.string().min(1, "Required"),
  technician: z.string().optional(),
  serviceLocation: z.string().optional(),
  scheduledAt: z.string().optional(),
  mileageIn: z.number().int().nonnegative().optional(),
  mileageOut: z.number().int().nonnegative().optional(),
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  workOrderId: string;
  defaultValues: Partial<FormValues>;
}

export function WorkOrderEditForm({ workOrderId, defaultValues }: Props) {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function onSubmit(data: FormValues) {
    const res = await fetch(`/api/work-orders/${workOrderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        mileageIn: data.mileageIn || null,
        mileageOut: data.mileageOut || null,
      }),
    });

    if (!res.ok) { alert("Failed to save changes."); return; }
    router.push(`/work-orders/${workOrderId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Customer Complaint *</label>
        <Textarea {...register("description")} rows={3} />
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Scheduled Date & Time</label>
          <Input {...register("scheduledAt")} type="datetime-local" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Service Location</label>
          <Input {...register("serviceLocation")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Technician</label>
          <Input {...register("technician")} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Mileage In</label>
            <Input {...register("mileageIn", { valueAsNumber: true })} type="number" min={0} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Mileage Out</label>
            <Input {...register("mileageOut", { valueAsNumber: true })} type="number" min={0} />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Internal Notes</label>
        <Textarea {...register("internalNotes")} rows={2} placeholder="Visible only to you" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Customer Notes</label>
        <Textarea {...register("customerNotes")} rows={2} placeholder="Notes to share with the customer" />
      </div>

      <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save Changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
