import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, MapPin, Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const VisitorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 pt-20 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Visitor Dashboard</h1>
        <p className="text-gray-500">
          Welcome, {user?.name}. You're visiting Unit {user?.unitNumber}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
              Visitor Pass Status
            </CardTitle>
            <CardDescription>Your current pass request status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
              <p className="text-amber-800 font-medium">Your visitor pass request is pending approval</p>
              <p className="text-amber-700 text-sm mt-1">
                The resident of Unit {user?.unitNumber} needs to approve your request.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm">Requested: Just now</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm">Visiting: Unit {user?.unitNumber}</span>
              </div>
              
              <div className="flex items-center">
                <Car className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm">Your vehicle information has been recorded</span>
              </div>
            </div>
            
            <Button className="w-full mt-6" variant="outline">
              Cancel Request
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Parking Rules</CardTitle>
            <CardDescription>Important information for visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 list-disc pl-5">
              <li className="text-sm">Visitor parking is only valid in designated visitor spots</li>
              <li className="text-sm">Parking in reserved resident spots may result in towing</li>
              <li className="text-sm">Your pass is only valid for the duration approved by the resident</li>
              <li className="text-sm">Keep your vehicle information updated to avoid violations</li>
              <li className="text-sm">Contact the resident if you need to extend your stay</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VisitorDashboard;
