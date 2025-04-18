import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Car, User, Home, Phone, Check, Calendar, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '@/config';
import { northAmericanRegions } from '../lib/regions';

const VisitorRequest = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [parkingLots, setParkingLots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submissionComplete, setSubmissionComplete] = useState(false);
    const [submissionData, setSubmissionData] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        parkingLotId: '',
        unitToVisit: '',
        licensePlate: '',
        region: '',
    });

    // Fetch parking lot list
    useEffect(() => {
        const fetchParkingLots = async () => {
            try {
                setIsLoading(true);
                
                // First get parking lot name list
                const namesResponse = await fetch(API_ENDPOINTS.getAllParkingLotNames);
                if (namesResponse.ok) {
                    const namesData = await namesResponse.json();
                    
                    if (namesData.success && namesData.parkingLots) {
                        // Note: Backend returns keys in uppercase
                        const formattedLots = namesData.parkingLots.map(lot => ({
                            id: lot.LOTID.toString(),
                            name: lot.LOTNAME || `Parking Lot ${lot.LOTID}`
                        }));
                        
                        console.log('Fetched parking lot names:', formattedLots);
                        setParkingLots(formattedLots);
                        setIsLoading(false);
                        return;
                    }
                }
                
                // If name fetch fails, fallback to basic parking lot info
                const apiUrl = API_ENDPOINTS.getAllParkingLots;
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch parking lots: ${response.status}`);
                }
                
                const text = await response.text();
                
                if (!text) {
                    throw new Error('Empty response received');
                }
                
                const data = JSON.parse(text);
                
                if (data.success && data.parkingLots) {
                    // Transform data format
                    setParkingLots(data.parkingLots.map(lot => ({
                        id: lot.lotId.toString(),
                        name: `Parking Lot ${lot.lotId}`
                    })));
                } else {
                    throw new Error(data.message || 'Failed to fetch parking lots');
                }
            } catch (error) {
                console.error('Error fetching parking lots:', error);
                toast({
                    title: "Error",
                    description: "Failed to load parking lots. Please try again later.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchParkingLots();
    }, [toast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
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

        try {
            setIsLoading(true);

            
            // Directly call the known working API endpoint
            const apiUrl = API_ENDPOINTS.register;

            
            // Build visitor data
            const visitorData = {
                name: formData.fullName,
                phone: formData.phone,
                password: formData.phone, // Use phone number as initial password
                userType: 'visitor',
                unitNumber: null, // Explicitly set to null as backend check requires
                hostInformation: `Visiting Unit ${formData.unitToVisit}`,
                role: 'user'
            };
            

            console.log('Registering visitor with data:', visitorData);
            // Step 1: Register visitor user
            const userResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(visitorData)
            });
            

            
            if (!userResponse.ok) {
                const errorText = await userResponse.text();
                console.error('User registration error:', errorText);
                console.error('Response status:', userResponse.status);
                throw new Error('Unable to create visitor account: ' + (errorText || userResponse.status));
            }
            
            const userData = await userResponse.json();
            
            if (!userData.success || !userData.user || !userData.user.ID) {
                throw new Error(userData.message || 'Visitor registration failed');
            }
            
            // Step 2: Register vehicle
            const userId = userData.user.ID;
            const now = new Date();
            
            // Do not set valid time as it needs resident approval
            const vehicleData = {
                userId: userId,
                province: formData.region,
                licensePlate: formData.licensePlate,
                lotId: formData.parkingLotId,
                // Do not set parkingUntil, to be determined by resident approval
                parkingUntil: new Date(now.getTime()).toISOString().replace('T', ' ').substring(0, 19)
            };
            
            const vehicleResponse = await fetch(API_ENDPOINTS.registerVehicle, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(vehicleData)
            });
            
            
            if (!vehicleResponse.ok) {
                const errorText = await vehicleResponse.text();
                console.error('Vehicle registration error:', errorText);
                throw new Error('Unable to register vehicle information');
            }
            
            const vehicleData2 = await vehicleResponse.json();
            
            // Save information for the success screen
            const selectedLot = parkingLots.find(lot => lot.id === formData.parkingLotId);
            setSubmissionData({
                name: formData.fullName,
                unitNumber: formData.unitToVisit,
                licensePlate: formData.licensePlate,
                region: northAmericanRegions.find(r => r.value === formData.region)?.label || formData.region,
                parkingLot: selectedLot?.name || `Parking Lot ${formData.parkingLotId}`,
                expiryDate: new Date(now).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            });
            
            setSubmissionComplete(true);
        } catch (error) {
            console.error('Submit visitor request error:', error);
            toast({
                title: "Submission Failed",
                description: error.message || "Failed to submit your visitor request. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (submissionComplete && submissionData) {
        return (
            <div className="container mx-auto px-4 pt-20 pb-16 flex justify-center items-center min-h-[80vh]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg"
                >
                    <Card>
                        <CardHeader className="space-y-2 text-center">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-green-100 p-3 text-green-600">
                                    <Check className="h-8 w-8" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">Request Submitted</CardTitle>
                            <CardDescription>
                                The resident of Unit {submissionData.unitNumber} has been notified about your visitor pass request and will need to approve it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-md bg-muted p-4">
                                <h3 className="font-medium mb-2">Visitor Information</h3>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Name:</span> {submissionData.name}</p>
                                    <p><span className="font-medium">Vehicle:</span> {submissionData.region} - {submissionData.licensePlate}</p>
                                    <p><span className="font-medium">Parking Location:</span> {submissionData.parkingLot}</p>
                                    <p className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Status:</span> Pending approval
                                    </p>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-md p-4">
                                <h3 className="font-medium mb-2 text-amber-700">Important Information</h3>
                                <p className="text-sm text-amber-700">
                                    Please keep this information for your records. Your request has been submitted to the resident who will need to approve it.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                onClick={() => navigate('/')} 
                                className="w-full"
                                variant="outline"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Return to Home
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        );
    }

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
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoading ? "Loading..." : "Select parking lot"} />
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

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Submitting..." : "Submit Request"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default VisitorRequest;