import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Car, User, Home, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

// US and Canada states/provinces
const northAmericanRegions = [
    // US States
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
    // Canadian Provinces
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'YT', label: 'Yukon' },
];

// Mock parking lots for demo
const parkingLots = [
    { id: '1', name: 'North Tower Parking' },
    { id: '2', name: 'South Tower Parking' },
    { id: '3', name: 'East Tower Parking' },
    { id: '4', name: 'West Tower Parking' },
];

const VisitorRequest = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        parkingLotId: '',
        unitToVisit: '',
        licensePlate: '',
        region: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.fullName || !formData.phone || !formData.parkingLotId ||
            !formData.unitToVisit || !formData.licensePlate || !formData.region) {
            toast({
                title: "Missing information",
                description: "Please fill in all fields to request a visitor pass.",
                variant: "destructive",
            });
            return;
        }

        // In a real app, this would send the request to your backend
        console.log('Visitor request submitted:', formData);

        toast({
            title: "Request Submitted",
            description: "Your visitor pass request has been submitted. The resident will be notified.",
        });

        // Redirect back to home page
        setTimeout(() => navigate('/'), 2000);
    };

    return (
        <div className="container mx-auto px-4 pt-20 pb-16 flex justify-center items-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <Card>
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-center">Request Visitor Pass</CardTitle>
                        <CardDescription className="text-center">
                            Fill in your information to request a visitor parking pass
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="parkingLotId" className="flex items-center gap-2">
                                    <Car className="h-4 w-4" />
                                    Parking Lot
                                </Label>
                                <Select
                                    onValueChange={(value) => handleSelectChange('parkingLotId', value)}
                                    value={formData.parkingLotId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parking lot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parkingLots.map(lot => (
                                            <SelectItem key={lot.id} value={lot.id}>
                                                {lot.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Full Name
                                </Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unitToVisit" className="flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    Unit to Visit
                                </Label>
                                <Input
                                    id="unitToVisit"
                                    name="unitToVisit"
                                    placeholder="Enter unit number to visit"
                                    value={formData.unitToVisit}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="region" className="flex items-center gap-2">
                                        Region/State
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleSelectChange('region', value)}
                                        value={formData.region}
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
                                    <Label htmlFor="licensePlate" className="flex items-center gap-2">
                                        License Plate
                                    </Label>
                                    <Input
                                        id="licensePlate"
                                        name="licensePlate"
                                        placeholder="Enter license plate"
                                        value={formData.licensePlate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full">Submit Request</Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default VisitorRequest;