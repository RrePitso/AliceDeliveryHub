import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

interface AppBarProps {
  title: string;
  userRole?: string;
  actions?: React.ReactNode;
}

export default function AppBar({ title, userRole, actions }: AppBarProps) {
  return (
    <header className="bg-surface shadow-material border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">{title}</h1>
            {userRole && (
              <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {userRole}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {actions}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
