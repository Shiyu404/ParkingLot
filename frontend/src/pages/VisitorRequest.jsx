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

// US and Canada states/provinces
const northAmericanRegions = [
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
    { value: 'WY', label: 'Wyoming' }
];

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

    // 获取停车场列表
    useEffect(() => {
        const fetchParkingLots = async () => {
            try {
                setIsLoading(true);
                const apiUrl = API_ENDPOINTS.getAllParkingLots; // 使用API_ENDPOINTS
 
                
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
                    // 转换数据格式
                    setParkingLots(data.parkingLots.map(lot => ({
                        id: lot.lotId.toString(),
                        name: lot.lotName
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

            
            // 直接调用已知可用的API端点
            const apiUrl = API_ENDPOINTS.register;

            
            // 构建访客数据
            const visitorData = {
                name: formData.fullName,
                phone: formData.phone,
                password: formData.phone, // 使用电话号码作为初始密码
                userType: 'visitor',
                unitNumber: null, // 显式设置为null，因为后端检查需要
                hostInformation: `Visiting Unit ${formData.unitToVisit}`,
                role: 'user'
            };
            

            console.log('Registering visitor with data:', visitorData);
            // 第一步：注册访客用户
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
            
            if (!userData.success || !userData.user || !userData.user.id) {
                throw new Error(userData.message || 'Visitor registration failed');
            }
            
            // 第二步：注册车辆
            const userId = userData.user.id;
            const now = new Date();
            
            // 不设置有效时间，因为需要等待住户审批
            const vehicleData = {
                userId: userId,
                province: formData.region,
                licensePlate: formData.licensePlate,
                lotId: formData.parkingLotId,
                // 不设置 parkingUntil，由住户审批时确定
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