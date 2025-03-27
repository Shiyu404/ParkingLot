import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, Car, Clock, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Violations = () => {
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

  const violations = [
    {
      id: 1,
      licensePlate: 'ABC123',
      vehicle: 'Honda Civic (White)',
      type: 'Unauthorized Parking',
      location: 'Spot A12',
      date: 'Oct 10, 2023',
      time: '2:30 PM',
      status: 'open',
      fine: '$50',
    },
    {
      id: 2,
      licensePlate: 'DEF456',
      vehicle: 'Toyota Camry (Black)',
      type: 'Expired Visitor Pass',
      location: 'Spot B08',
      date: 'Oct 9, 2023',
      time: '4:15 PM',
      status: 'open',
      fine: '$30',
    },
    {
      id: 3,
      licensePlate: 'GHI789',
      vehicle: 'Ford Escape (Blue)',
      type: 'Unauthorized Parking',
      location: 'Spot C23',
      date: 'Oct 8, 2023',
      time: '1:45 PM',
      status: 'pending',
      fine: '$50',
    },
    {
      id: 4,
      licensePlate: 'JKL012',
      vehicle: 'Chevrolet Malibu (Silver)',
      type: 'Improper Parking',
      location: 'Spot A07',
      date: 'Oct 7, 2023',
      time: '11:20 AM',
      status: 'resolved',
      fine: '$25',
    },
    {
      id: 5,
      licensePlate: 'MNO345',
      vehicle: 'Nissan Altima (Red)',
      type: 'Expired Visitor Pass',
      location: 'Spot B19',
      date: 'Oct 6, 2023',
      time: '3:10 PM',
      status: 'resolved',
      fine: '$30',
    },
    {
      id: 6,
      licensePlate: 'PQR678',
      vehicle: 'Hyundai Sonata (Gray)',
      type: 'Blocking Access',
      location: 'Fire Lane',
      date: 'Oct 5, 2023',
      time: '5:40 PM',
      status: 'towed',
      fine: '$100',
    },
  ];

  const getStatusColor = (status) => {
    const statusColors = {
      open: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      towed: 'bg-purple-100 text-purple-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Violation Management</h1>
        <p className="text-gray-500">Track and resolve parking violations in your facility</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search violations..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm">
            All Violations
          </Button>
          <Button variant="outline" className="text-sm">
            Open
          </Button>
          <Button variant="outline" className="text-sm">
            Resolved
          </Button>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {violations.map((violation) => (
          <motion.div key={violation.id} variants={item}>
            <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
              violation.status === 'open' ? 'border-red-200' : 
              violation.status === 'pending' ? 'border-yellow-200' : 
              violation.status === 'towed' ? 'border-purple-200' : ''
            }`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-medium">{violation.type}</CardTitle>
                    <CardDescription>{violation.vehicle}</CardDescription>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(violation.status)}`}>
                    {violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Car className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">License: {violation.licensePlate}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">{violation.location}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">{violation.date}</span>
                    <Clock className="h-4 w-4 text-gray-500 ml-4 mr-2" />
                    <span className="text-sm">{violation.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-semibold">Fine: {violation.fine}</span>
                    {(violation.status === 'open' || violation.status === 'pending') && (
                      <span className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Resolve
                        </Button>
                        {violation.status === 'open' && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Tow
                          </Button>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {violations.length > 9 && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  );
};

export default Violations;
