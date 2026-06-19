"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const currentYear = new Date().getFullYear();

const schema = z.object({
  year: z.number().int().min(1900).max(currentYear + 2),
  make: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  trim: z.string().optional(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  color: z.string().optional(),
  mileage: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface VehicleFormProps {
  customerId: string;
  vehicleId?: string;
  defaultValues?: Partial<FormValues>;
  onSuccess?: (vehicleId: string) => void;
}

const years = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear + 1 - i);

export function VehicleForm({ customerId, vehicleId, defaultValues, onSuccess }: VehicleFormProps) {
  const router = useRouter();
  const isEditing = !!vehicleId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { year: currentYear, ...defaultValues },
  });

  async function onSubmit(data: FormValues) {
    const url = isEditing
      ? `/api/vehicles/${vehicleId}`
      : `/api/customers/${customerId}/vehicles`;
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      alert("Failed to save vehicle. Please try again.");
      return;
    }

    const saved = await res.json();
    if (onSuccess) {
      onSuccess(saved.id);
    } else {
      router.push(`/customers/${customerId}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Year / Make / Model */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Year *</label>
          <Select {...register("year", { valueAsNumber: true })}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
          {errors.year && <p className="text-xs text-red-600">{errors.year.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Make *</label>
          <Input {...register("make")} placeholder="Toyota" />
          {errors.make && <p className="text-xs text-red-600">{errors.make.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Model *</label>
          <Input {...register("model")} placeholder="Camry" />
          {errors.model && <p className="text-xs text-red-600">{errors.model.message}</p>}
        </div>
      </div>

      {/* Trim / Color */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Trim / Package</label>
          <Input {...register("trim")} placeholder="SE, XLE, Sport…" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Color</label>
          <Input {...register("color")} placeholder="Silver" />
        </div>
      </div>

      {/* VIN / License */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">VIN</label>
          <Input
            {...register("vin")}
            placeholder="1HGCM82633A004352"
            maxLength={17}
            className="font-mono uppercase"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">License Plate</label>
          <Input {...register("licensePlate")} placeholder="ABC1234" className="uppercase" />
        </div>
      </div>

      {/* Mileage */}
      <div className="space-y-1 max-w-[160px]">
        <label className="text-sm font-medium text-gray-700">Mileage</label>
        <Input
          {...register("mileage", { valueAsNumber: true })}
          type="number"
          min={0}
          placeholder="45000"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <Textarea {...register("notes")} placeholder="Known issues, service history notes…" rows={3} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Add Vehicle"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
