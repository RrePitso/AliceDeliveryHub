import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock, Star, ShoppingBag, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/components/customer/cart-context';
import RestaurantCard from '@/components/customer/restaurant-card';
import MenuModal from '@/components/customer/menu-modal';
import CartSidebar from '@/components/customer/cart-sidebar';
import type { Vendor } from '@shared/schema';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { getTotalItems, openCart, isOpen, closeCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['/api/vendors'],
  });

  // Filter vendors based on search and cuisine
  const filteredVendors = vendors.filter((vendor: Vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || vendor.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  const cuisineTypes = Array.from(new Set(vendors.map((vendor: Vendor) => vendor.cuisine)));

  const handleRestaurantClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsMenuModalOpen(true);
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">DeliveryHub</h1>
              <Badge variant="outline" className="ml-3 text-xs">Customer</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={openCart} className="relative">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Cart
                {getTotalItems() > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.firstName || 'Customer'}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h2>
          <p className="text-gray-600">Discover amazing restaurants and order your favorite meals.</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search restaurants or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="all">All Cuisines</option>
              {cuisineTypes.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredVendors.length} restaurants available</span>
            {searchQuery && (
              <span>Searching for "{searchQuery}"</span>
            )}
          </div>
        </div>

        {/* Restaurant Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                  : 'No restaurants are currently available in your area.'
                }
              </p>
            </div>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCuisine('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor: Vendor) => (
              <div key={vendor.id} onClick={() => handleRestaurantClick(vendor)}>
                <RestaurantCard vendor={vendor} />
              </div>
            ))}
          </div>
        )}

        {/* Popular Categories */}
        {!searchQuery && cuisineTypes.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Cuisines</h3>
            <div className="flex flex-wrap gap-2">
              {cuisineTypes.slice(0, 8).map(cuisine => (
                <Button
                  key={cuisine}
                  variant={selectedCuisine === cuisine ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCuisine(cuisine)}
                  className="text-sm"
                >
                  {cuisine}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Menu Modal */}
      <MenuModal
        vendor={selectedVendor}
        isOpen={isMenuModalOpen}
        onClose={() => {
          setIsMenuModalOpen(false);
          setSelectedVendor(null);
        }}
      />

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isOpen} onClose={closeCart} />
    </div>
  );
}