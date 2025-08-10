import { useState } from "react";
import { User, Store, Truck } from "lucide-react";

const roles = [
  {
    key: "customer",
    label: "Customer",
    description: "Browse restaurants and order food",
    icon: <User className="h-6 w-6 text-primary" />,
    color: "bg-primary bg-opacity-10",
  },
  {
    key: "vendor",
    label: "Vendor",
    description: "Manage menus and track orders",
    icon: <Store className="h-6 w-6 text-success" />,
    color: "bg-success bg-opacity-10",
  },
  {
    key: "driver",
    label: "Driver",
    description: "Accept deliveries and earn money",
    icon: <Truck className="h-6 w-6 text-warning" />,
    color: "bg-warning bg-opacity-10",
  },
];

export default function RoleSelect({
  onSelect,
  defaultRole = "customer",
}: {
  onSelect: (role: string) => void;
  defaultRole?: string;
}) {
  const [role, setRole] = useState(defaultRole);

  return (
    <div>
      <label className="block font-semibold mb-2 text-lg text-gray-800">
        Choose your role to get started:
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {roles.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`transition border rounded-lg p-5 text-center shadow hover:shadow-lg focus:outline-none ${
              role === r.key
                ? `${r.color} border-primary ring ring-primary`
                : "bg-white"
            }`}
            onClick={() => setRole(r.key)}
          >
            <div
              className={`rounded-full mx-auto mb-4 flex items-center justify-center w-12 h-12 ${r.color}`}
            >
              {r.icon}
            </div>
            <h3 className="font-semibold text-lg mb-1">{r.label}</h3>
            <p className="text-sm text-gray-600">{r.description}</p>
          </button>
        ))}
      </div>
      <div className="text-center">
        <button
          type="button"
          className="bg-primary text-white px-8 py-3 rounded font-bold shadow hover:bg-primary-dark transition"
          onClick={() => onSelect(role)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
