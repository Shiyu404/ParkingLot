import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Calendar, Car, Users } from 'lucide-react';
import VisitorPassForm from '@/components/visitors/VisitorPassForm';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Visitors = () => {
    const [selectedTab, setSelectedTab] = useState('users');

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

    const visitorPasses = [
        {
            id: 1,
            visitorName: 'John Smith',
            licensePlate: 'ABC123',
            vehicle: 'Honda Civic (White)',
            validFrom: 'Oct 10, 2023',
            validTo: 'Oct 12, 2023',
            status: 'active',
        },
        {
            id: 2,
            visitorName: 'Sarah Johnson',
            licensePlate: 'XYZ789',
            vehicle: 'Toyota Camry (Black)',
            validFrom: 'Oct 8, 2023',
            validTo: 'Oct 15, 2023',
            status: 'active',
        },
        {
            id: 3,
            visitorName: 'Michael Brown',
            licensePlate: 'DEF456',
            vehicle: 'Ford Focus (Blue)',
            validFrom: 'Oct 5, 2023',
            validTo: 'Oct 7, 2023',
            status: 'expired',
        },
        {
            id: 4,
            visitorName: 'Emma Wilson',
            licensePlate: 'GHI789',
            vehicle: 'Chevrolet Malibu (Silver)',
            validFrom: 'Oct 1, 2023',
            validTo: 'Oct 3, 2023',
            status: 'expired',
        },
        {
            id: 5,
            visitorName: 'James Taylor',
            licensePlate: 'JKL012',
            vehicle: 'Nissan Altima (Red)',
            validFrom: 'Sep 28, 2023',
            validTo: 'Sep 30, 2023',
            status: 'expired',
        },
    ];

    const users = [
        { id: 1, name: 'John Smith', unit: '101', role: 'resident', email: 'john.smith@example.com', phone: '555-123-4567' },
        { id: 2, name: 'Sarah Johnson', unit: '205', role: 'resident', email: 'sarah.j@example.com', phone: '555-234-5678' },
        { id: 3, name: 'Michael Brown', unit: '310', role: 'resident', email: 'michael.brown@example.com', phone: '555-345-6789' },
        { id: 4, name: 'Emma Wilson', unit: '422', role: 'resident', email: 'emma.wilson@example.com', phone: '555-456-7890' },
        { id: 5, name: 'James Taylor', unit: 'N/A', role: 'visitor', email: 'james.t@example.com', phone: '555-567-8901' },
    ];

    const renderManagePasses = () => (
        <Card>
            <CardHeader>
                <CardTitle>Manage Resident Passes</CardTitle>
                <CardDescription>
                    Adjust monthly visitor pass allocation for residents
                </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
    );

    return (
        <div className="container mx-auto px-4 pt-20 pb-16">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">User Management</h1>
                <p className="text-gray-500">Manage users and visitor passes for your facility</p>
            </div>

            <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="mb-8">
                <TabsList className="mb-6">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="passes">Visitor Passes</TabsTrigger>
                    <TabsTrigger value="manage">Manage Passes</TabsTrigger>
                    <TabsTrigger value="create">Create New Pass</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Search users..." className="pl-10" />
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New User
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <div className="overflow-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="pb-2 text-left font-medium text-sm">Name</th>
                                        <th className="pb-2 text-left font-medium text-sm">Unit</th>
                                        <th className="pb-2 text-left font-medium text-sm">Role</th>
                                        <th className="pb-2 text-left font-medium text-sm">Email</th>
                                        <th className="pb-2 text-left font-medium text-sm">Phone</th>
                                        <th className="pb-2 text-left font-medium text-sm">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b last:border-0">
                                            <td className="py-3 text-sm">{user.name}</td>
                                            <td className="py-3 text-sm">{user.unit}</td>
                                            <td className="py-3 text-sm capitalize">{user.role}</td>
                                            <td className="py-3 text-sm">{user.email}</td>
                                            <td className="py-3 text-sm">{user.phone}</td>
                                            <td className="py-3 text-sm">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm">Edit</Button>
                                                    {user.role === 'resident' && (
                                                        <Button variant="outline" size="sm">Passes</Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="manage">
                    {renderManagePasses()}
                </TabsContent>

                <TabsContent value="passes">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Search passes..." className="pl-10" />
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Visitor Pass
                        </Button>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {visitorPasses.map((pass) => (
                            <motion.div key={pass.id} variants={item}>
                                <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
                                    pass.status === 'expired' ? 'border-gray-200 opacity-75' : 'border-primary/20'
                                }`}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl font-medium">{pass.visitorName}</CardTitle>
                                                <CardDescription>{pass.vehicle}</CardDescription>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                pass.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                        {pass.status === 'active' ? 'Active' : 'Expired'}
                      </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <Car className="h-4 w-4 text-gray-500 mr-2" />
                                                <span className="text-sm font-medium">License: {pass.licensePlate}</span>
                                            </div>

                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                                <span className="text-sm">
                          Valid: {pass.validFrom} - {pass.validTo}
                        </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                <Button variant="outline" size="sm">
                                                    Extend
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {visitorPasses.length > 9 && (
                        <div className="mt-8 flex justify-center">
                            <Button variant="outline">Load More</Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="create">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Visitor Pass</CardTitle>
                            <CardDescription>
                                Fill out the form below to create a new visitor pass for your guest.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VisitorPassForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Visitors;