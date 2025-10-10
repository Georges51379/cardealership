import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Eye, Loader2 } from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Badge } from '@/components/ui/badge';

interface Car {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  image_hover_url: string | null;
  doors: number | null;
  speed: string | null;
  year: number | null;
  passengers: number | null;
  engine: string | null;
  transmission: string | null;
  category: string | null;
  mileage: number | null;
  color: string | null;
  status: string;
}

export default function CarsManagement() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const emptyForm: Partial<Car> = {
    name: '',
    description: '',
    price: 0,
    image_url: '',
    image_hover_url: '',
    doors: 4,
    speed: '',
    year: new Date().getFullYear(),
    passengers: 5,
    engine: '',
    transmission: 'Automatic',
    category: 'Luxury',
    mileage: 0,
    color: '',
    status: 'active',
  };

  const [formData, setFormData] = useState<Partial<Car>>(emptyForm);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCar) {
        const { error } = await supabase
          .from('cars')
          .update(formData)
          .eq('id', editingCar.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Car updated successfully' });
      } else {
        const { error } = await supabase
          .from('cars')
          .insert([formData as any]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Car added successfully' });
      }

      setIsDialogOpen(false);
      setEditingCar(null);
      setFormData(emptyForm);
      fetchCars();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (car: Car) => {
    try {
      const newStatus = car.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('cars')
        .update({ status: newStatus })
        .eq('id', car.id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: `Car ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      });
      fetchCars();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (car: Car) => {
    setEditingCar(car);
    setFormData(car);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingCar(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cars Management</h1>
          <p className="text-muted-foreground mt-1">Manage your car inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Car
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCar ? 'Edit Car' : 'Add New Car'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <ImageUploader
                label="Main Image"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                path="cars"
              />

              <ImageUploader
                label="Hover Image"
                value={formData.image_hover_url || ''}
                onChange={(url) => setFormData({ ...formData, image_hover_url: url })}
                path="cars"
              />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category || ''}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage || ''}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doors">Doors</Label>
                  <Input
                    id="doors"
                    type="number"
                    value={formData.doors || ''}
                    onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passengers">Passengers</Label>
                  <Input
                    id="passengers"
                    type="number"
                    value={formData.passengers || ''}
                    onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speed">Top Speed</Label>
                  <Input
                    id="speed"
                    value={formData.speed || ''}
                    onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                    placeholder="e.g., 250 km/h"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="engine">Engine</Label>
                  <Input
                    id="engine"
                    value={formData.engine || ''}
                    onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                    placeholder="e.g., V8 5.0L"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select
                    value={formData.transmission || ''}
                    onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color || ''}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingCar ? 'Update' : 'Add'} Car
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Card key={car.id}>
            <CardHeader>
              <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                {car.image_url ? (
                  <img src={car.image_url} alt={car.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{car.name}</CardTitle>
                  <Badge variant={car.status === 'active' ? 'default' : 'secondary'}>
                    {car.status}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-primary mt-2">${car.price.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {car.category} • {car.year} • {car.mileage?.toLocaleString()} km
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(car)}>
                  <Pencil className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant={car.status === 'active' ? 'secondary' : 'default'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStatusToggle(car)}
                >
                  {car.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cars.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No cars found. Add your first car to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}