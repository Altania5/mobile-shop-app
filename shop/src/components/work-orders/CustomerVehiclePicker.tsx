"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { formatPhone } from "@/lib/utils";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicles: Vehicle[];
}

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  licensePlate: string | null;
}

interface Props {
  defaultCustomerId?: string;
  defaultVehicleId?: string;
  onCustomerChange: (customerId: string) => void;
  onVehicleChange: (vehicleId: string) => void;
}

export function CustomerVehiclePicker({
  defaultCustomerId,
  defaultVehicleId,
  onCustomerChange,
  onVehicleChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [vehicleId, setVehicleId] = useState(defaultVehicleId ?? "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Load default customer on mount
  useEffect(() => {
    if (defaultCustomerId) {
      fetch(`/api/customers/${defaultCustomerId}`)
        .then((r) => r.json())
        .then((c: Customer) => {
          setSelected(c);
          onCustomerChange(c.id);
          if (defaultVehicleId) {
            setVehicleId(defaultVehicleId);
            onVehicleChange(defaultVehicleId);
          }
        });
    }
  }, []);

  // Search customers
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/customers?q=${encodeURIComponent(query)}&limit=8`)
        .then((r) => r.json())
        .then((data) => setResults(data.customers ?? []));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function pickCustomer(c: Customer) {
    setSelected(c);
    setQuery("");
    setResults([]);
    setOpen(false);
    const firstVehicle = c.vehicles?.[0]?.id ?? "";
    setVehicleId(firstVehicle);
    onCustomerChange(c.id);
    onVehicleChange(firstVehicle);
  }

  function clear() {
    setSelected(null);
    setVehicleId("");
    setQuery("");
    onCustomerChange("");
    onVehicleChange("");
  }

  return (
    <div className="space-y-4">
      {/* Customer search */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Customer *</label>
        {selected ? (
          <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
            <div>
              <span className="font-medium text-gray-900">
                {selected.firstName} {selected.lastName}
              </span>
              <span className="ml-2 text-sm text-gray-500">{formatPhone(selected.phone)}</span>
            </div>
            <button type="button" onClick={clear} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div ref={ref} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Search by name or phone…"
              className="pl-9"
            />
            {open && results.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                {results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => pickCustomer(c)}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <span className="font-medium">
                        {c.lastName}, {c.firstName}
                      </span>
                      <span className="text-gray-400">{formatPhone(c.phone)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Vehicle picker */}
      {selected && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Vehicle *</label>
          {selected.vehicles?.length === 0 ? (
            <p className="text-sm text-red-600">
              This customer has no vehicles on file.{" "}
              <a href={`/customers/${selected.id}/vehicles/new`} className="underline">
                Add one first.
              </a>
            </p>
          ) : (
            <Select
              value={vehicleId}
              onChange={(e) => {
                setVehicleId(e.target.value);
                onVehicleChange(e.target.value);
              }}
            >
              <option value="">Select a vehicle…</option>
              {selected.vehicles?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model}
                  {v.trim ? ` ${v.trim}` : ""}
                  {v.licensePlate ? ` · ${v.licensePlate.toUpperCase()}` : ""}
                </option>
              ))}
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
