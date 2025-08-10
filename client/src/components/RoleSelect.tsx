import { useState } from "react";

export default function RoleSelect({ onSelect, defaultRole = "customer" }) {
  const [role, setRole] = useState(defaultRole);

  return (
    <div className="mb-6">
      <label className="block font-semibold mb-2">Choose your role:</label>
      <div className="grid grid-cols-2 gap-3 mb-2">
        {["customer", "vendor", "driver"].map(r => (
          <button
            key={r}
            type="button"
            className={`py-2 px-4 rounded border ${role === r ? "bg-primary text-white" : "bg-white text-gray-700"}`}
            onClick={() => setRole(r)}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>
      <button
        className="bg-success text-white px-4 py-2 rounded"
        type="button"
        onClick={() => onSelect(role)}
      >
        Continue
      </button>
    </div>
  );
}
