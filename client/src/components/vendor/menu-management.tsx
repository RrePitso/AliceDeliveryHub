import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

interface MenuManagementProps {
  menuItems: any[];
  vendorId: string;
}

export default function MenuManagement({ menuItems, vendorId }: MenuManagementProps) {
  const defaultImage = "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200";

  return (
    <Card className="bg-surface shadow-material">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Menu Items</h2>
          <Button className="bg-primary hover:bg-primary-dark text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        {menuItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No menu items yet. Add your first item to get started!</p>
            <Button className="bg-primary hover:bg-primary-dark text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-material transition-shadow">
                <img 
                  src={item.imageUrl || defaultImage}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultImage;
                  }}
                />
                <h4 className="font-medium mb-1">{item.name}</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">${item.price}</span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-error hover:text-error">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {!item.isAvailable && (
                  <div className="mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded text-center">
                    Unavailable
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
