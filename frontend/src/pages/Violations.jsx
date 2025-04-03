import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, Car, Clock, Calendar, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '@/config';
import { useToast } from '@/components/ui/use-toast';

const Violations = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

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

  // Fetch all violation records
  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true);
        // If there is a user ID, you can get specific user's violation records: /violations/user/:userId
        // If it's an admin interface, you can get all violation records, adjust according to actual API
        const response = await fetch('/api/violations');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Format data to ensure field names match component requirements
          const formattedViolations = data.violations.map(violation => ({
            id: violation.ticketId,
            licensePlate: violation.licensePlate,
            province: violation.province,
            vehicle: `${violation.province}-${violation.licensePlate}`,
            type: violation.reason,
            location: `Lot #${violation.lotId}`,
            date: new Date(violation.time).toLocaleDateString(),
            time: new Date(violation.time).toLocaleTimeString(),
            status: violation.status || 'pending',
            fine: '$50', // Set fine amount based on actual situation
            lotId: violation.lotId
          }));
          setViolations(formattedViolations);
        } else {
          setError(data.message || 'Failed to load violations');
        }
      } catch (err) {
        console.error('Error fetching violations:', err);
        setError('Failed to load violations data. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load violations data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, [toast]);

  // Handle record status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Adjust according to actual API
      const response = await fetch(`/api/violations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setViolations(prev => 
          prev.map(violation => 
            violation.id === id ? { ...violation, status: newStatus } : violation
          )
        );
        
        toast({
          title: "Status Updated",
          description: `Violation #${id} marked as ${newStatus}`,
        });
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating violation status:', err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update violation status",
        variant: "destructive",
      });
    }
  };

  // Filter displayed violation records
  const filteredViolations = violations.filter(violation => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      violation.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.province?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesFilter = filter === 'all' || violation.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      appealed: 'bg-blue-100 text-blue-800',
      open: 'bg-red-100 text-red-800',
      towed: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-20 pb-16 flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading violations data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <h2 className="text-red-800 font-medium flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Error Loading Data
          </h2>
          <p className="mt-1 text-red-700">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-20 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Violation Management</h1>
        <p className="text-gray-500">Track and resolve parking violations in your facility</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search violations..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            className="text-sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'pending' ? 'default' : 'outline'} 
            className="text-sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button 
            variant={filter === 'paid' ? 'default' : 'outline'} 
            className="text-sm"
            onClick={() => setFilter('paid')}
          >
            Paid
          </Button>
        </div>
      </div>

      {filteredViolations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No violations found</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredViolations.map((violation) => (
            <motion.div key={violation.id} variants={item}>
              <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
                violation.status === 'pending' ? 'border-yellow-200' : 
                violation.status === 'paid' ? 'border-green-200' : 
                violation.status === 'appealed' ? 'border-blue-200' : ''
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
                      <span className="text-sm font-medium">License Plate: {violation.province}-{violation.licensePlate}</span>
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
                      {violation.status === 'pending' && (
                        <span className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusUpdate(violation.id, 'paid')}
                          >
                            Mark as Paid
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleStatusUpdate(violation.id, 'appealed')}
                          >
                            Appeal
                          </Button>
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {filteredViolations.length > 9 && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  );
};

export default Violations;
