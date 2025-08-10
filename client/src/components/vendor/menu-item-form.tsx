import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { ChefHat, ImageIcon } from 'lucide-react';
import { useState } from 'react';

// Menu item validation schema
const menuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Please specify a price').regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price'),
  category: z.string().min(1, 'Please select a category'),
  imageUrl: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
  isAvailable: z.boolean().optional(),
  preparationTime: z.string().min(1, 'Please specify preparation time'),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  vendorId: string;
  onSuccess: () => void;
}

const categories = [
  'Appetizers',
  'Main Course',
  'Desserts',
  'Beverages',
  'Soups',
  'Salads',
  'Pasta',
  'Pizza',
  'Sandwiches',
  'Burgers',
  'Seafood',
  'Vegetarian',
  'Vegan',
  'Breakfast',
  'Sides',
];

const preparationTimes = [
  '5-10 mins',
  '10-15 mins',
  '15-20 mins',
  '20-25 mins',
  '25-30 mins',
  '30+ mins',
];

export default function MenuItemForm({ isOpen, onClose, editData, vendorId, onSuccess }: MenuItemFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string>(editData?.imageUrl || '');

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: editData?.name || '',
      description: editData?.description || '',
      price: editData?.price?.toString() || '',
      category: editData?.category || '',
      imageUrl: editData?.imageUrl || '',
      isAvailable: editData?.isAvailable ?? true,
      preparationTime: editData?.preparationTime || '',
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const endpoint = editData ? `/api/menu-items/${editData.id}` : '/api/menu-items';
      const method = editData ? 'PUT' : 'POST';
      
      const payload = {
        ...data,
        vendorId,
        price: parseFloat(data.price),
        isAvailable: data.isAvailable ?? true,
      };
      
      return await apiRequest(method, endpoint, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items', vendorId] });
      toast({
        title: editData ? 'Menu Item Updated' : 'Menu Item Added',
        description: `${form.getValues('name')} has been ${editData ? 'updated' : 'added to your menu'}.`,
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
        description: 'Failed to save menu item. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: MenuItemFormData) => {
    createMenuItemMutation.mutate(data);
  };

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url);
    form.setValue('imageUrl', url);
  };

  const defaultImage = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ChefHat className="h-5 w-5 mr-2" />
            {editData ? 'Edit Menu Item' : 'Add New Menu Item'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Preview */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={imagePreview || defaultImage}
                  alt="Menu item preview"
                  className="w-60 h-40 object-cover rounded-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultImage;
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Margherita Pizza" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="12.99"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preparationTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prep Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {preparationTimes.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Available</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Is this item currently available for orders?
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Description and Image */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the dish, ingredients, and any special features..."
                          className="resize-none h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/food-image.jpg"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleImageUrlChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        Paste a URL to an appetizing image of your dish
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex">
                <ChefHat className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800">Menu Tips</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Great menu items have mouth-watering photos, clear descriptions of ingredients, 
                    and accurate pricing. Consider dietary restrictions and popular trends.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createMenuItemMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white"
                disabled={createMenuItemMutation.isPending}
              >
                {createMenuItemMutation.isPending 
                  ? (editData ? 'Updating...' : 'Adding...') 
                  : (editData ? 'Update Item' : 'Add to Menu')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}