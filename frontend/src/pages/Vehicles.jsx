import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Car, User, Home, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';

const Vehicles = () => {
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

  const residentVehicles = [
    {
      id: 1,
      licensePlate: 'ABC123',
      make: 'Honda',
      model: 'Civic',
      color: 'White',
      owner: 'John Smith',
      unit: 'A204',
      registered: 'Jan 15, 2023',
    },
    {
      id: 2,
      licensePlate: 'DEF456',
      make: 'Toyota',
      model: 'Camry',
      color: 'Black',
      owner: 'Sarah Johnson',
      unit: 'B112',
      registered: 'Feb 28, 2023',
    },
    {
      id: 3,
      licensePlate: 'GHI789',
      make: 'Ford',
      model: 'Escape',
      color: 'Blue',
      owner: 'Michael Brown',
      unit: 'C301',
      registered: 'Mar 10, 2023',
    },
    {
      id: 4,
      licensePlate: 'JKL012',
      make: 'Chevrolet',
      model: 'Malibu',
      color: 'Silver',
      owner: 'Emma Wilson',
      unit: 'A105',
      registered: 'Apr 5, 2023',
    },
    {
      id: 5,
      licensePlate: 'MNO345',
      make: 'Nissan',
      model: 'Altima',
      color: 'Red',
      owner: 'James Taylor',
      unit: 'B215',
      registered: 'May 20, 2023',
    },
    {
      id: 6,
      licensePlate: 'PQR678',
      make: 'Hyundai',
      model: 'Sonata',
      color: 'Gray',
      owner: 'David Wilson',
      unit: 'C118',
      registered: 'Jun 12, 2023',
    },
  ];

  const frequentVisitors = [
    {
      id: 1,
      licensePlate: 'XYZ789',
      make: 'Mazda',
      model: 'CX-5',
      color: 'Gray',
      owner: 'Robert Johnson',
      visits: 12,
      lastVisit: 'Oct 8, 2023',
    },
    {
      id: 2,
      licensePlate: 'STU901',
      make: 'Subaru',
      model: 'Outback',
      color: 'Green',
      owner: 'Emily Davis',
      visits: 8,
      lastVisit: 'Oct 5, 2023',
    },
    {
      id: 3,
      licensePlate: 'VWX234',
      make: 'Kia',
      model: 'Sorento',
      color: 'Silver',
      owner: 'Daniel Martin',
      visits: 6,
      lastVisit: 'Sep 30, 2023',
    },
    {
      id: 4,
      licensePlate: 'YZA567',
      make: 'Jeep',
      model: 'Cherokee',
      color: 'Black',
      owner: 'Olivia Wilson',
      visits: 5,
      lastVisit: 'Sep 28, 2023',
    },
  ];

  return (
    <div className="container mx-auto px-4 pt-20 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vehicle Management</h1>
        <p className="text-gray-500">Register and manage vehicles in your facility</p>
      </div>

      <Tabs defaultValue="residents" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="residents">Resident Vehicles</TabsTrigger>
          <TabsTrigger value="visitors">Frequent Visitors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="residents">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search vehicles..." className="pl-10" />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Register New Vehicle
            </Button>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {residentVehicles.map((vehicle) => (
              <motion.div key={vehicle.id} variants={item}>
                <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-medium">{vehicle.licensePlate}</CardTitle>
                        <CardDescription>{vehicle.make} {vehicle.model} ({vehicle.color})</CardDescription>
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
                        <span className="text-sm">{vehicle.owner}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Home className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">Unit {vehicle.unit}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">Registered: {vehicle.registered}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {residentVehicles.length > 9 && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="visitors">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search visitors..." className="pl-10" />
            </div>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {frequentVisitors.map((visitor) => (
              <motion.div key={visitor.id} variants={item}>
                <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-medium">{visitor.licensePlate}</CardTitle>
                        <CardDescription>{visitor.make} {visitor.model} ({visitor.color})</CardDescription>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {visitor.visits} Visits
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">{visitor.owner}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">Last Visit: {visitor.lastVisit}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          Create Pass
                        </Button>
                        <Button variant="outline" size="sm">
                          View History
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Vehicles;
