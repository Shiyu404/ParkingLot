import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Car, User, Home, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function Vehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Animation config
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  // Fetch all vehicles
  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.getAllVehicles);
      
      if (response.data.success && response.data.vehicles) {
        setVehicles(response.data.vehicles);
      } else {
        setVehicles([]);
        alert("No vehicles found");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      alert("Failed to retrieve vehicle data");
    } finally {
      setLoading(false);
    }
  }

  // Delete vehicle
  async function handleDelete() {
    if (!vehicleToDelete) return;
    
    try {
      const response = await axios.delete(
        API_ENDPOINTS.deleteVehicle(vehicleToDelete.province, vehicleToDelete.licensePlate)
      );
      
      if (response.data.success) {
        setVehicles(prevVehicles => 
          prevVehicles.filter(v => 
            v.province !== vehicleToDelete.province || 
            v.licensePlate !== vehicleToDelete.licensePlate
          )
        );
        alert("Vehicle successfully removed");
      } else {
        alert("Failed to delete vehicle: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Error occurred while deleting vehicle");
    } finally {
      setShowDeleteDialog(false);
      setVehicleToDelete(null);
    }
  }

  // Filter vehicles
  const filteredVehicles = searchTerm 
    ? vehicles.filter(vehicle => 
        (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.province && vehicle.province.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.userName && vehicle.userName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : vehicles;

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vehicle Management</h1>
          <p className="text-gray-500">Register and manage vehicles in your facility</p>
        </div>
        <div className="text-center py-16">Loading vehicle data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-20 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vehicle Management</h1>
        <p className="text-gray-500">Register and manage vehicles in your facility</p>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search vehicles..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register New Vehicle
          </Button>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16">
            {searchTerm ? "No matching vehicles found" : "No registered vehicles"}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredVehicles.map((vehicle) => (
              <motion.div key={`${vehicle.province}-${vehicle.licensePlate}`} variants={item}>
                <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-medium">{vehicle.licensePlate}</CardTitle>
                        <CardDescription>{vehicle.province}</CardDescription>
                      </div>
                      <div className="p-2 rounded-full bg-primary/10">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">{vehicle.userName || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Home className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">Unit {vehicle.unitNumber || '-'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">Valid until: {new Date(vehicle.parkingUntil).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setVehicleToDelete(vehicle);
                            setShowDeleteDialog(true);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredVehicles.length > 9 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline">Load More</Button>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this vehicle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the vehicle from the system.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Vehicles;
