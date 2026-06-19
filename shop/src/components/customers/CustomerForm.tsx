"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(7, "Enter a valid phone number"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CustomerFormProps {
  customerId?: string;
  defaultValues?: Partial<FormValues>;
}

export function CustomerForm({ customerId, defaultValues }: CustomerFormProps) {
  const router = useRouter();
  const isEditing = !!customerId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  });

  async function onSubmit(data: FormValues) {
    const url = isEditing ? `/api/customers/${customerId}` : "/api/customers";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      alert("Failed to save customer. Please try again.");
      return;
    }

    const saved = await res.json();
    router.push(`/customers/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">First Name *</label>
          <Input {...register("firstName")} placeholder="James" />
          {errors.firstName && (
            <p className="text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Last Name *</label>
          <Input {...register("lastName")} placeholder="Smith" />
          {errors.lastName && (
            <p className="text-xs text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Phone *</label>
          <Input {...register("phone")} type="tel" placeholder="(555) 000-0000" />
          {errors.phone && (
            <p className="text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input {...register("email")} type="email" placeholder="james@example.com" />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Street Address</label>
        <Input {...register("address")} placeholder="123 Main St" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-1">
          <label className="text-sm font-medium text-gray-700">City</label>
          <Input {...register("city")} placeholder="Austin" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">State</label>
          <Input {...register("state")} placeholder="TX" maxLength={2} className="uppercase" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">ZIP</label>
          <Input {...register("zip")} placeholder="78701" maxLength={10} />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <Textarea
          {...register("notes")}
          placeholder="Any internal notes about this customer…"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Create Customer"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
