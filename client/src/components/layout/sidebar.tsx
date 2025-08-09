interface SidebarItem {
  label: string;
  icon: string;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  return (
    <nav className="w-64 bg-surface shadow-material h-screen">
      <div className="p-4">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center p-3 rounded-lg font-medium ${
                  item.active
                    ? "text-primary bg-blue-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="material-icons mr-3">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
