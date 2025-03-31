
import React, { useState } from 'react';
import { Car, Users, AlertTriangle, Ticket, ArrowUpRight, ArrowDownRight, MapPin, Search, FileText } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import OccupancyChart from '@/components/dashboard/OccupancyChart';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

// Mock parking lots
const parkingLots = [
    { id: '1', name: 'North Tower Parking', totalSpaces: 150, availableSpaces: 45 },
    { id: '2', name: 'South Tower Parking', totalSpaces: 120, availableSpaces: 32 },
    { id: '3', name: 'East Tower Parking', totalSpaces: 80, availableSpaces: 18 },
    { id: '4', name: 'West Tower Parking', totalSpaces: 100, availableSpaces: 27 },
];

// North American regions
const northAmericanRegions = [
    // A subset of US states and Canadian provinces
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
    { value: 'ON', label: 'Ontario' },
    { value: 'BC', label: 'British Columbia' },
    // Add more as needed
];

const Dashboard = () => {
    const { toast } = useToast();
    const [selectedParkingLot, setSelectedParkingLot] = useState(parkingLots[0].id);
    const [plateToCheck, setPlateToCheck] = useState('');
    const [plateRegion, setPlateRegion] = useState('');
    const [plateCheckResult, setPlateCheckResult] = useState(null);
    const [ticketReason, setTicketReason] = useState('No Valid Visitor Pass');

    const activeParkingLot = parkingLots.find(lot => lot.id === selectedParkingLot) || parkingLots[0];

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

    const stats = [
        {
            title: 'Total Spaces',
            value: activeParkingLot.totalSpaces.toString(),
            change: '+0',
            isIncrease: true,
            icon: <Car className="h-5 w-5" />,
            progress: Math.round((activeParkingLot.totalSpaces - activeParkingLot.availableSpaces) / activeParkingLot.totalSpaces * 100)
        },
        {
            title: 'Available Spaces',
            value: activeParkingLot.availableSpaces.toString(),
            change: '-3',
            isIncrease: false,
            icon: <MapPin className="h-5 w-5" />,
            progress: Math.round(activeParkingLot.availableSpaces / activeParkingLot.totalSpaces * 100)
        },
        {
            title: 'Active Visitor Passes',
            value: '28',
            change: '+2',
            isIncrease: true,
            icon: <Ticket className="h-5 w-5" />,
            progress: 35
        },
        {
            title: 'Open Violations',
            value: '12',
            change: '-1',
            isIncrease: false,
            icon: <AlertTriangle className="h-5 w-5" />,
            progress: 15
        },
    ];

    const recentActivity = [
        { id: 1, type: 'Visitor Pass', description: 'New pass for John Smith', time: '10 minutes ago', status: 'success' },
        { id: 2, type: 'Violation', description: 'Unauthorized vehicle in spot A12', time: '25 minutes ago', status: 'warning' },
        { id: 3, type: 'Vehicle Registration', description: 'New vehicle registered by Apt 204', time: '1 hour ago', status: 'info' },
        { id: 4, type: 'Visitor Pass', description: 'Pass extended for Sarah Johnson', time: '2 hours ago', status: 'success' },
        { id: 5, type: 'Violation', description: 'Expired visitor pass in spot B8', time: '3 hours ago', status: 'warning' },
    ];

    const currentVehicles = [
        { licensePlate: 'ABC123', unitNumber: '101', visitorName: 'John Smith', passType: '8 hour', remaining: '6h 23m' },
        { licensePlate: 'DEF456', unitNumber: '205', visitorName: 'Sarah Johnson', passType: '24 hour', remaining: '21h 15m' },
        { licensePlate: 'GHI789', unitNumber: '310', visitorName: 'Mike Brown', passType: 'Weekend', remaining: '1d 4h' },
        { licensePlate: 'JKL012', unitNumber: '422', visitorName: 'Emma Wilson', passType: '8 hour', remaining: '2h 45m' },
    ];

    const handleParkingLotChange = (value) => {
        setSelectedParkingLot(value);
        // In a real app, this would fetch data for the selected parking lot
        toast({
            title: "Parking Lot Changed",
            description: `Switched to ${parkingLots.find(lot => lot.id === value)?.name}`,
        });
    };

    const checkLicensePlate = () => {
        if (!plateToCheck || !plateRegion) {
            toast({
                title: "Missing information",
                description: "Please enter both license plate and region",
                variant: "destructive",
            });
            return;
        }

        // In a real app, this would check against your backend database
        // For demo, we'll randomly determine if the plate is valid
        const isValid = Math.random() > 0.5;

        setPlateCheckResult({
            valid: isValid,
            message: isValid
                ? `Vehicle with plate ${plateRegion}-${plateToCheck} has a valid visitor pass`
                : `No valid pass found for vehicle with plate ${plateRegion}-${plateToCheck}`
        });
    };

    const issueTicket = () => {
        if (!plateCheckResult || plateCheckResult.valid) return;

        // In a real app, this would create a ticket in your backend
        toast({
            title: "Ticket Issued",
            description: `Ticket issued for ${plateRegion}-${plateToCheck} for ${ticketReason}`,
        });

        // Reset form
        setPlateToCheck('');
        setPlateRegion('');
        setPlateCheckResult(null);
        setTicketReason('No Valid Visitor Pass');
    };

    const renderLicensePlateVerification = () => (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Search className="mr-2 h-5 w-5" />
                    License Plate Verification
                </CardTitle>
                <CardDescription>Check if a vehicle has a valid pass</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <Label htmlFor="region">Region/State</Label>
                            <Select
                                onValueChange={setPlateRegion}
                                value={plateRegion}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {northAmericanRegions.map(region => (
                                        <SelectItem key={region.value} value={region.value}>
                                            {region.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="license-plate">License Plate</Label>
                            <div className="flex mt-1">
                                <Input
                                    id="license-plate"
                                    placeholder="Enter plate number"
                                    value={plateToCheck}
                                    onChange={(e) => setPlateToCheck(e.target.value)}
                                />
                                <Button
                                    className="ml-2"
                                    onClick={checkLicensePlate}
                                >
                                    Check
                                </Button>
                            </div>
                        </div>
                    </div>

                    {plateCheckResult && (
                        <div className={`p-4 rounded-lg ${
                            plateCheckResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                            <div className="flex items-start">
                                <div className={`p-1 rounded-full ${
                                    plateCheckResult.valid ? 'bg-green-100' : 'bg-red-100'
                                } mr-3`}>
                                    {plateCheckResult.valid ? (
                                        <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className={plateCheckResult.valid ? 'text-green-800' : 'text-red-800'}>
                                        {plateCheckResult.message}
                                    </p>

                                    {!plateCheckResult.valid && (
                                        <div className="mt-4">
                                            <Label htmlFor="ticket-reason">Violation Reason:</Label>
                                            <Select
                                                defaultValue="No Valid Visitor Pass"
                                                onValueChange={setTicketReason}
                                                value={ticketReason}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="No Valid Visitor Pass">No Valid Visitor Pass</SelectItem>
                                                    <SelectItem value="Expired Pass">Expired Pass</SelectItem>
                                                    <SelectItem value="Unauthorized Parking Area">Unauthorized Parking Area</SelectItem>
                                                    <SelectItem value="Blocked Access">Blocked Access</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                className="w-full mt-4"
                                                variant="destructive"
                                                onClick={issueTicket}
                                            >
                                                Issue Ticket
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const renderManagementFunctions = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Generate Report
                    </CardTitle>
                    <CardDescription>Create parking usage and violation reports</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label>Report Type</Label>
                            <Select defaultValue="occupancy">
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="occupancy">Parking Occupancy</SelectItem>
                                    <SelectItem value="violations">Parking Violations</SelectItem>
                                    <SelectItem value="visitors">Visitor Passes</SelectItem>
                                    <SelectItem value="revenue">Revenue Report</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" className="mt-1" />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input type="date" className="mt-1" />
                            </div>
                        </div>

                        <Button className="w-full">
                            Generate Report
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog>
                <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Ticket className="mr-2 h-5 w-5" />
                                Manage Passes
                            </CardTitle>
                            <CardDescription>Adjust resident pass allocations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">
                                    Set the number of visitor passes that residents receive each month.
                                    You can update passes for all residents or adjust for individual units.
                                </p>
                                <Button className="w-full">Open Pass Management</Button>
                            </div>
                        </CardContent>
                    </Card>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Resident Passes</DialogTitle>
                        <DialogDescription>
                            Adjust monthly visitor pass allocation for residents
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="bulk" className="w-full">
                        <TabsList className="grid grid-cols-2 mb-4">
                            <TabsTrigger value="bulk">Bulk Update</TabsTrigger>
                            <TabsTrigger value="individual">Individual Update</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bulk">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Pass Type</Label>
                                        <Select defaultValue="8hour">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="8hour">8-Hour Passes</SelectItem>
                                                <SelectItem value="24hour">24-Hour Passes</SelectItem>
                                                <SelectItem value="weekend">Weekend Passes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Number of Passes</Label>
                                        <Input type="number" defaultValue="5" min="0" max="10" />
                                    </div>
                                </div>
                                <Button className="w-full">Update All Residents</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="individual">
                            <div className="space-y-4">
                                <div>
                                    <Label>Unit Number</Label>
                                    <Input placeholder="Enter unit number" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Pass Type</Label>
                                        <Select defaultValue="8hour">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="8hour">8-Hour Passes</SelectItem>
                                                <SelectItem value="24hour">24-Hour Passes</SelectItem>
                                                <SelectItem value="weekend">Weekend Passes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Number of Passes</Label>
                                        <Input type="number" defaultValue="5" min="0" max="10" />
                                    </div>
                                </div>
                                <Button className="w-full">Update Resident</Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );

    return (
        <div className="container mx-auto px-4 pt-20 pb-16">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-500">Monitor and manage your parking facilities</p>
                </div>

                <div className="mt-4 md:mt-0 w-full md:w-64">
                    <Select
                        value={selectedParkingLot}
                        onValueChange={handleParkingLotChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select parking lot" />
                        </SelectTrigger>
                        <SelectContent>
                            {parkingLots.map(lot => (
                                <SelectItem key={lot.id} value={lot.id}>{lot.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {stats.map((stat, index) => (
                    <motion.div key={index} variants={item}>
                        <DashboardCard
                            title={stat.title}
                            icon={stat.icon}
                            className={stat.title === 'Open Violations' ? 'border-orange-200' : ''}
                        >
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-3xl font-bold">{stat.value}</span>
                                <span className={`flex items-center text-sm ${stat.isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.isIncrease ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                                    {stat.change}
                </span>
                            </div>
                            <Progress value={stat.progress} className="h-2" />
                        </DashboardCard>
                    </motion.div>
                ))}
            </motion.div>

            {renderLicensePlateVerification()}

            {renderManagementFunctions()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <DashboardCard
                        title="Parking Occupancy"
                        description="24-hour trend"
                    >
                        <OccupancyChart />
                    </DashboardCard>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <DashboardCard
                        title="Recent Activity"
                        description="Latest updates and events"
                    >
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b last:border-0 border-gray-100">
                                    <div className={`w-2 h-2 mt-2 rounded-full ${
                                        activity.status === 'success' ? 'bg-green-500' :
                                            activity.status === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                    }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{activity.description}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" className="w-full text-primary justify-center mt-2">
                                View All Activity
                            </Button>
                        </div>
                    </DashboardCard>
                </motion.div>
            </div>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Car className="mr-2 h-5 w-5" />
                            Active Visitor Vehicles
                        </CardTitle>
                        <CardDescription>Current vehicles using visitor passes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b">
                                    <th className="pb-2 text-left font-medium text-sm">License</th>
                                    <th className="pb-2 text-left font-medium text-sm">Unit</th>
                                    <th className="pb-2 text-left font-medium text-sm">Visitor</th>
                                    <th className="pb-2 text-left font-medium text-sm">Pass Type</th>
                                    <th className="pb-2 text-left font-medium text-sm">Remaining</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentVehicles.map((vehicle, idx) => (
                                    <tr key={idx} className="border-b last:border-0">
                                        <td className="py-3 text-sm">{vehicle.licensePlate}</td>
                                        <td className="py-3 text-sm">{vehicle.unitNumber}</td>
                                        <td className="py-3 text-sm">{vehicle.visitorName}</td>
                                        <td className="py-3 text-sm">{vehicle.passType}</td>
                                        <td className="py-3 text-sm">{vehicle.remaining}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full text-primary justify-center mt-4">
                            View All Vehicles
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            Recent Violations
                        </CardTitle>
                        <CardDescription>Latest parking violations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { spot: 'A12', type: 'Unauthorized', time: '25 minutes ago', plate: 'CA-ABC123' },
                                { spot: 'B08', type: 'Expired Pass', time: '3 hours ago', plate: 'NY-DEF456' },
                                { spot: 'C23', type: 'Unauthorized', time: '5 hours ago', plate: 'TX-GHI789' },
                                { spot: 'A07', type: 'Improper Parking', time: 'Yesterday', plate: 'ON-JKL012' },
                                { spot: 'B19', type: 'Expired Pass', time: 'Yesterday', plate: 'BC-MNO345' },
                            ].map((violation, index) => (
                                <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-0 border-gray-100">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">Spot {violation.spot}: {violation.type}</p>
                                        <p className="text-xs text-gray-500">{violation.time} - Plate: {violation.plate}</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" className="w-full text-primary justify-center mt-2">
                                View All Violations
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Dashboard;
