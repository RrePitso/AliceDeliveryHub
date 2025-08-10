import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Car, Truck, Bike, Scooter } from 'lucide-react';

// Driver profile validation schema
const driverSchema = z.object({
  vehicleType: z.string().min(1, 'Please select your vehicle type'),
  licenseNumber: z.string().min(5, 'Please provide a valid license number'),
  currentLocation: z.string().min(5, 'Please provide your current location/area'),
});

type DriverFormData = z.infer<typeof driverSchema>;

interface DriverFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  onSuccess: () => void;
}

const vehicleTypes = [
  { value: 'bicycle', label: 'Bicycle', icon: Bike, description: 'Eco-friendly, good for short distances' },
  { value: 'scooter', label: 'Scooter/Motorcycle', icon: Scooter, description: 'Fast and efficient for city delivery' },
  { value: 'car', label: 'Car', icon: Car, description: 'Reliable for all weather conditions' },
  { value: 'truck', label: 'Truck/Van', icon: Truck, description: 'Large orders and catering deliveries' },
];

export default function DriverForm({ isOpen, onClose, editData, onSuccess }: DriverFormProps) {
  const { toast } = useToast();

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      vehicleType: editData?.vehicleType || '',
      licenseNumber: editData?.licenseNumber || '',
      currentLocation: editData?.currentLocation || '',
    },
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: DriverFormData) => {
      const endpoint = editData ? `/api/drivers/${editData.id}` : '/api/drivers';
      const method = editData ? 'PATCH' : 'POST';
      return await apiRequest(method, endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers/my'] });
      toast({
        title: editData ? 'Profile Updated' : 'Driver Profile Created',
        description: `Your driver profile has been ${editData ? 'updated' : 'created successfully'}.`,
      });
      onSuccess();
      onClose();
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
      toast({
        title: 'Error',
        description: 'Failed to save driver profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: DriverFormData) => {
    createDriverMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2" />
            {editData ? 'Update Driver Profile' : 'Complete Driver Setup'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Vehicle Type Selection */}
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleTypes.map((vehicle) => {
                        const IconComponent = vehicle.icon;
                        return (
                          <SelectItem key={vehicle.value} value={vehicle.value}>
                            <div className="flex items-center">
                              <IconComponent className="h-4 w-4 mr-2" />
                              <div>
                                <div className="font-medium">{vehicle.label}</div>
                                <div className="text-xs text-gray-500">{vehicle.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* License Number */}
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Driver's License or Vehicle Registration"
                      {...field} 
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500">
                    Required for verification and insurance purposes
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Location */}
            <FormField
              control={form.control}
              name="currentLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Area</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Downtown, North Side, City Center"
                      {...field} 
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500">
                    The area where you prefer to make deliveries
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Box */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex">
                <Car className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">Driver Benefits</h4>
                  <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
                    <li>Flexible working hours</li>
                    <li>Competitive delivery fees</li>
                    <li>Real-time order notifications</li>
                    <li>Weekly earnings summary</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createDriverMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white"
                disabled={createDriverMutation.isPending}
              >
                {createDriverMutation.isPending 
                  ? (editData ? 'Updating...' : 'Setting Up...') 
                  : (editData ? 'Update Profile' : 'Complete Setup')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}