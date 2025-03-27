import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Ticket, Calendar, Plus, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

// North American regions
const northAmericanRegions = [
  // US States
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'CA', label: 'California' },
  // Add more states as needed
  // Canadian Provinces
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'ON', label: 'Ontario' },
  { value: 'QC', label: 'Quebec' },
  // Add more provinces as needed
];

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [licensePlate, setLicensePlate] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [selectedPassType, setSelectedPassType] = useState('');
  
  // Mock data - in a real app this would come from your backend
  const residentVehicles = [
    { id: 1, licensePlate: 'ABC123', make: 'Honda', model: 'Civic', color: 'White' },
    { id: 2, licensePlate: 'DEF456', make: 'Toyota', model: 'Camry', color: 'Black' },
  ];
  
  const visitorPasses = [
    { id: 1, type: '8 hour', remaining: 3, total: 5 },
    { id: 2, type: '24 hour', remaining: 2, total: 3 },
    { id: 3, type: 'Weekend', remaining: 1, total: 1 },
  ];
  
  const activeVisitors = [
    { id: 1, plate: 'GHI789', visitorName: 'John Smith', timeRemaining: '6 hours 23 min', passType: '8 hour' },
    { id: 2, plate: 'JKL012', visitorName: 'Sarah Johnson', timeRemaining: '23 hours 45 min', passType: '24 hour' },
  ];
  
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

  const handleUsePass = () => {
    if (!licensePlate || !regionCode || !selectedPassType) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would communicate with your backend
    console.log('Using pass for:', { licensePlate, regionCode, passType: selectedPassType });
    
    toast({
      title: "Pass Used Successfully",
      description: `Created a ${selectedPassType} pass for plate ${regionCode}-${licensePlate}`,
    });
    
    // Reset form
    setLicensePlate('');
    setRegionCode('');
    setSelectedPassType('');
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resident Dashboard</h1>
        <p className="text-gray-500">
          Welcome, {user?.name} (Unit {user?.unitNumber})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {visitorPasses.map((passType) => (
          <Card key={passType.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ticket className="mr-2 h-5 w-5" />
                {passType.type} Passes
              </CardTitle>
              <CardDescription>Available visitor passes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {passType.remaining}/{passType.total}
              </div>
              <p className="text-sm text-gray-500 mb-4">Available passes</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Use a {passType.type} Pass
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create {passType.type} Visitor Pass</DialogTitle>
                    <DialogDescription>
                      Enter vehicle information to create a visitor pass
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="region">Region/State</Label>
                        <Select 
                          onValueChange={setRegionCode}
                          value={regionCode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {northAmericanRegions.map(region => (
                              <SelectItem key={region.value} value={region.value}>
                                {region.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license-plate">License Plate</Label>
                        <Input 
                          id="license-plate" 
                          placeholder="Enter plate number" 
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUsePass}>Create Pass</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Active Visitor Passes
          </CardTitle>
          <CardDescription>Current active visitor passes</CardDescription>
        </CardHeader>
        <CardContent>
          {activeVisitors.length > 0 ? (
            <div className="space-y-4">
              {activeVisitors.map((visitor) => (
                <div key={visitor.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{visitor.visitorName}</p>
                    <p className="text-sm text-gray-500">Plate: {visitor.plate}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-primary mr-1" />
                      <span className="text-xs">{visitor.timeRemaining} remaining ({visitor.passType})</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Revoke</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No active visitor passes</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Recent Pass Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { visitor: 'John Smith', date: 'Oct 10, 2023', plate: 'XYZ789', passType: '8 hour' },
              { visitor: 'Sarah Johnson', date: 'Oct 8, 2023', plate: 'ABC123', passType: '24 hour' },
              { visitor: 'Michael Brown', date: 'Oct 5, 2023', plate: 'DEF456', passType: 'Weekend' },
            ].map((pass, index) => (
              <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-0 border-gray-100">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{pass.visitor} - {pass.plate}</p>
                  <p className="text-xs text-gray-500">{pass.date} ({pass.passType})</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidentDashboard;
