import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Store, User, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">DeliveryHub</h1>
          <p className="text-xl text-white/90 mb-8">Multi-Vendor Delivery Management System</p>
          
          <Card className="bg-surface shadow-material-lg">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-primary bg-opacity-10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Customers</h3>
                  <p className="text-sm text-gray-600">Browse restaurants and order food</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-success bg-opacity-10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Store className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">Vendors</h3>
                  <p className="text-sm text-gray-600">Manage menus and track orders</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-warning bg-opacity-10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Truck className="h-8 w-8 text-warning" />
                  </div>
                  <h3 className="font-semibold mb-2">Drivers</h3>
                  <p className="text-sm text-gray-600">Accept deliveries and earn money</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-secondary bg-opacity-10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2">Admins</h3>
                  <p className="text-sm text-gray-600">Manage the entire platform</p>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8"
                >
                  Sign In to Get Started
                </Button>
                <p className="text-sm text-gray-600 mt-4">
                  New to DeliveryHub? Sign up during the login process
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
