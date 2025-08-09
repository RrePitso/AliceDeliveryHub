import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";

interface DeliveryCardProps {
  delivery: {
    id: string;
    vendor?: { name: string; address?: string };
    deliveryAddress: string;
    deliveryFee: string;
    estimatedDeliveryTime?: string;
  };
  onAccept: () => void;
  isAccepting: boolean;
}

export default function DeliveryCard({ delivery, onAccept, isAccepting }: DeliveryCardProps) {
  return (
    <div className="bg-surface rounded-lg shadow-material p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium">{delivery.vendor?.name || "Restaurant"}</h3>
          <p className="text-sm text-gray-600">{delivery.vendor?.address || "Restaurant address"}</p>
        </div>
        <span className="px-3 py-1 bg-secondary text-white text-sm rounded-full">
          ${delivery.deliveryFee}
        </span>
      </div>
      
      <div className="border-l-2 border-gray-200 pl-4 mb-3">
        <div className="flex items-center mb-2">
          <MapPin className="h-4 w-4 text-primary mr-2" />
          <span className="text-sm">{delivery.deliveryAddress}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-600">
            {delivery.estimatedDeliveryTime || "15 min • 2.3 miles"}
          </span>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          className="flex-1 bg-primary hover:bg-primary-dark text-white"
          onClick={onAccept}
          disabled={isAccepting}
        >
          {isAccepting ? "Accepting..." : "Accept"}
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          disabled={isAccepting}
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
