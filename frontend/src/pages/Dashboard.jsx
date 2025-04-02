import React, { useState, useEffect } from 'react';
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
import { API_ENDPOINTS } from '@/config';

// North American regions
const northAmericanRegions = [
    // 加拿大省份
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
    
    // 美国州
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

const Dashboard = () => {
    const { toast } = useToast();
    const [parkingLots, setParkingLots] = useState([]);
    const [selectedParkingLot, setSelectedParkingLot] = useState(null);
    const [plateToCheck, setPlateToCheck] = useState('');
    const [plateRegion, setPlateRegion] = useState('');
    const [plateCheckResult, setPlateCheckResult] = useState(null);
    const [ticketReason, setTicketReason] = useState('No Valid Visitor Pass');
    const [activeParkingLot, setActiveParkingLot] = useState(null);
    const [currentVehicles, setCurrentVehicles] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState([]);

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

    // 获取停车场列表 - 整合了两个fetchParkingLots函数
    useEffect(() => {
        const fetchParkingLots = async () => {
            try {
                setIsLoading(true);
                
                try {
                    const response = await fetch(API_ENDPOINTS.getAllParkingLots);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch parking lots: ${response.status}`);
                    }
                    
                    const text = await response.text();
                    console.log('Parking lots API response:', text);
                    
                    if (!text) {
                        throw new Error('Empty response received');
                    }
                    
                    const data = JSON.parse(text);
                    
                    if (data.success && data.parkingLots) {
                        // 使用API返回的完整字段
                        const lotsWithNames = data.parkingLots.map(lot => {
                            return {
                                id: lot.lotId.toString(),
                                name: lot.lotName || `Parking Lot ${lot.lotId}`, // 使用API返回的lotName
                                address: lot.address || '',
                                totalSpaces: lot.totalSpaces || 0,
                                availableSpaces: lot.availableSpaces || 0,
                                occupiedSpaces: lot.totalSpaces - lot.availableSpaces || 0,
                                capacity: lot.totalSpaces,
                                currentRemain: lot.availableSpaces,
                                currentOccupancy: lot.totalSpaces - lot.availableSpaces,
                                vehicles: lot.vehicles || []
                            };
                        });
                        
                        console.log('Formatted parking lots:', lotsWithNames);
                        setParkingLots(lotsWithNames);
                        
                        // 如果有停车场，设置第一个为默认选择
                        if (lotsWithNames.length > 0) {
                            setSelectedParkingLot(lotsWithNames[0].id);
                            setActiveParkingLot(lotsWithNames[0]);
                            await fetchParkingLotDetails(lotsWithNames[0].id);
                        }
                        
                        return; // 成功获取数据，退出函数
                    } else {
                        throw new Error(data.message || 'Failed to fetch parking lots');
                    }
                } catch (error) {
                    console.error("Error fetching parking lots from API:", error);
                    toast({
                        title: "Error",
                        description: "Failed to load parking lots. Please try again later.",
                        variant: "destructive",
                    });
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

    // 当选择停车场变化时，获取该停车场详细信息
    useEffect(() => {
        if (selectedParkingLot) {
            fetchParkingLotDetails(selectedParkingLot);
        }
    }, [selectedParkingLot]);

    // 获取停车场详细信息
    const fetchParkingLotDetails = async (lotId) => {
        try {
            const response = await fetch(API_ENDPOINTS.getParkingLotById(lotId));
            if (!response.ok) {
                throw new Error(`Failed to fetch parking lot details: ${response.status}`);
            }
            
            const text = await response.text();
            console.log('Parking lot details API response:', text);
            
            if (!text) {
                throw new Error('Empty response received');
            }
            
            const data = JSON.parse(text);
            
            if (data.success && data.parkingLots) {
                const lot = data.parkingLots;
                console.log('API returned lot details:', lot);
                
                const currentLot = parkingLots.find(l => l.id === lotId);
                
                // 设置当前停车场信息
                setActiveParkingLot(currentLot);
                
                // 更新统计信息，使用API返回的字段
                setStats([
                    {
                        title: 'Total Spaces',
                        value: (lot.totalSpaces || 0).toString(),
                        change: '+0',
                        isIncrease: true,
                        icon: 'car',
                        progress: Math.round((lot.totalSpaces - lot.availableSpaces) / (lot.totalSpaces || 1) * 100)
                    },
                    {
                        title: 'Available Spaces',
                        value: (lot.availableSpaces || 0).toString(),
                        change: '0',
                        isIncrease: true,
                        icon: 'map-pin',
                        progress: Math.round((lot.availableSpaces || 0) / (lot.totalSpaces || 1) * 100)
                    },
                    {
                        title: 'Active Visitor Passes',
                        value: (lot.vehicles ? lot.vehicles.length : 0).toString(),
                        change: '0',
                        isIncrease: true,
                        icon: 'ticket',
                        progress: Math.round((lot.vehicles ? lot.vehicles.length : 0) / (lot.totalSpaces || 1) * 100)
                    },
                    {
                        title: 'Open Violations',
                        value: '0', // 这里需要另外的API来获取违规数量
                        change: '0',
                        isIncrease: false,
                        icon: 'alert-triangle',
                        progress: 0
                    },
                ]);
                
                // 转换车辆信息为表格格式
                if (lot.vehicles && lot.vehicles.length > 0) {
                    // 这里需要另外API来获取更多车辆信息，包括访客名称、单元号等
                    // 暂时使用模拟数据格式
                    const formattedVehicles = lot.vehicles.map((vehicle, index) => {
                        // 从停车时间计算剩余时间
                        const parkingUntil = new Date(vehicle.parkingUntil);
                        const now = new Date();
                        const diff = parkingUntil - now;
                        
                        let remaining = '';
                        if (diff > 0) {
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            if (hours >= 24) {
                                const days = Math.floor(hours / 24);
                                remaining = `${days}d ${hours % 24}h`;
                            } else {
                                remaining = `${hours}h ${minutes}m`;
                            }
                        } else {
                            remaining = 'Expired';
                        }
                        
                        return {
                            licensePlate: vehicle.licensePlate,
                            province: vehicle.province,
                            unitNumber: '---', // 需要额外API获取
                            visitorName: '---', // 需要额外API获取
                            passType: diff > 24 * 60 * 60 * 1000 ? 'Weekend' : '24 hour',
                            remaining: remaining
                        };
                    });
                    
                    setCurrentVehicles(formattedVehicles);
                } else {
                    setCurrentVehicles([]);
                }
                
                // 获取最近活动
                await fetchRecentActivity(lotId);
            }
        } catch (error) {
            console.error("Error fetching parking lot details:", error);
            toast({
                title: "Error",
                description: "Failed to load parking lot details",
                variant: "destructive",
            });
        }
    };

    // 获取最近活动记录
    const fetchRecentActivity = async (lotId) => {
        // 这里应该有一个获取最近活动的API
        // 暂时使用模拟数据
        setRecentActivity([
            { id: 1, type: 'Visitor Pass', description: 'New pass for John Smith', time: '10 minutes ago', status: 'success' },
            { id: 2, type: 'Violation', description: 'Unauthorized vehicle in spot A12', time: '25 minutes ago', status: 'warning' },
            { id: 3, type: 'Vehicle Registration', description: 'New vehicle registered by Apt 204', time: '1 hour ago', status: 'info' },
            { id: 4, type: 'Visitor Pass', description: 'Pass extended for Sarah Johnson', time: '2 hours ago', status: 'success' },
            { id: 5, type: 'Violation', description: 'Expired visitor pass in spot B8', time: '3 hours ago', status: 'warning' },
        ]);
    };

    const handleParkingLotChange = (value) => {
        setSelectedParkingLot(value);
        const selected = parkingLots.find(lot => lot.id === value);
        toast({
            title: "Parking Lot Changed",
            description: `Switched to ${selected?.name || 'Unknown Parking Lot'}`,
        });
    };

    const checkLicensePlate = async () => {
        if (!plateToCheck || !plateRegion) {
            toast({
                title: "Missing information",
                description: "Please enter both license plate and region",
                variant: "destructive",
            });
            return;
        }

        try {
            setPlateCheckResult({
                valid: false,
                message: `Checking vehicle with plate ${plateRegion}-${plateToCheck}...`
            });

            const cleanedPlateNumber = plateToCheck.trim().replace(/\s+/g, '');

            // 使用API_ENDPOINTS配置
            const apiUrl = API_ENDPOINTS.verifyVehicle(cleanedPlateNumber, plateRegion, selectedParkingLot);
            
            console.log('【调试】调用API URL:', apiUrl);
            console.log('【调试】车牌参数:', {
                plate: cleanedPlateNumber,
                region: plateRegion,
                lotId: selectedParkingLot
            });
            console.log('【调试】请求的完整URL:', window.location.origin + apiUrl);

            // 使用完整的错误处理流程
            try {
                console.log('【调试】发送请求前...');
                const response = await fetch(apiUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Debug': 'true'  // 添加调试头
                    }
                });
                console.log('【调试】收到响应状态:', response.status);
                console.log('【调试】响应头:', JSON.stringify([...response.headers.entries()]));
                
                // 获取响应文本
                const responseText = await response.text();
                console.log('【调试】响应文本:', responseText);
                
                // 如果响应不是200 OK，抛出错误
                if (!response.ok) {
                    throw new Error(`Server error (${response.status}): ${responseText}`);
                }
                
                // 尝试解析JSON
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (error) {
                    console.error('【调试】JSON解析错误:', error);
                    throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
                }
                
                console.log('【调试】解析后的数据:', data);
                
                // 处理成功响应
                if (data.success) {
                    const vehicle = data.vehicle;
                    const parkingUntil = new Date(vehicle.parkingUntil);
                    const now = new Date();
                    
                    console.log('【调试】车辆信息:', vehicle);
                    console.log('【调试】停车截止时间:', parkingUntil);
                    console.log('【调试】当前时间:', now);
                    
                    if (parkingUntil > now) {
                        setPlateCheckResult({
                            valid: true,
                            message: `Vehicle with plate ${plateRegion}-${cleanedPlateNumber} has a valid visitor pass until ${parkingUntil.toLocaleString()}`,
                            vehicle: vehicle
                        });
                    } else {
                        setPlateCheckResult({
                            valid: false,
                            message: `Vehicle with plate ${plateRegion}-${cleanedPlateNumber} has an expired visitor pass (expired at ${parkingUntil.toLocaleString()})`,
                            vehicle: vehicle,
                            reason: 'Expired Pass'
                        });
                        setTicketReason('Expired Pass');
                    }
                } else {
                    setPlateCheckResult({
                        valid: false,
                        message: data.message || `No valid pass found for vehicle with plate ${plateRegion}-${cleanedPlateNumber}`,
                        reason: 'No Valid Visitor Pass'
                    });
                    setTicketReason('No Valid Visitor Pass');
                }
            } catch (fetchError) {
                console.error('【调试】请求错误:', fetchError);
                    
                // 如果是服务器问题，显示模拟数据
                console.log('【调试】使用模拟数据');
                
                // 模拟响应
                const mockVehicle = {
                    id: 1,
                    licensePlate: cleanedPlateNumber,
                    province: plateRegion,
                    lotId: selectedParkingLot,
                    parkingUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2小时后
                };
                
                setPlateCheckResult({
                    valid: true,
                    message: `【测试模式】车牌 ${plateRegion}-${cleanedPlateNumber} 有效访客通行证，到期时间：${mockVehicle.parkingUntil.toLocaleString()}`,
                    vehicle: mockVehicle
                });
                
                toast({
                    title: "测试模式",
                    description: "接口调用失败，使用模拟数据进行测试。请检查服务器日志。",
                    variant: "warning",
                });
            }
        } catch (error) {
            console.error("【调试】主函数错误:", error);
            toast({
                title: "Error",
                description: "Failed to verify license plate: " + error.message,
                variant: "destructive",
            });
            setPlateCheckResult(null);
        }
    };

    const issueTicket = async () => {
        if (!plateCheckResult || plateCheckResult.valid) return;

        try {
            const cleanedPlateNumber = plateToCheck.trim().replace(/\s+/g, '');

            const response = await fetch(API_ENDPOINTS.createViolation, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    province: plateRegion,
                    licensePlate: cleanedPlateNumber,
                    reason: ticketReason,
                    lotId: selectedParkingLot,
                    vehicleId: plateCheckResult.vehicle ? plateCheckResult.vehicle.id : null
                })
            });

            const responseText = await response.text();
            console.log('Response status:', response.status);
            console.log('Response text:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
            }

            if (data.success) {
                toast({
                    title: "Ticket Issued",
                    description: `Ticket #${data.ticketId} issued for ${plateRegion}-${cleanedPlateNumber} for ${ticketReason}`,
                });

                setPlateToCheck('');
                setPlateRegion('');
                setPlateCheckResult(null);
                setTicketReason('No Valid Visitor Pass');

                if (selectedParkingLot) {
                    fetchParkingLotDetails(selectedParkingLot);
                }
            } else {
                throw new Error(data.message || 'Failed to issue ticket');
            }
        } catch (error) {
            console.error("Error issuing ticket:", error);
            toast({
                title: "Error",
                description: "Failed to issue ticket: " + error.message,
                variant: "destructive",
            });
        }
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
                    {parkingLots.length > 0 ? (
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
                    ) : (
                        <div className="text-center py-2 border rounded-md text-gray-500">
                            Loading parking lots...
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-lg text-gray-500">Loading dashboard data...</p>
                </div>
            ) : (
                <>
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
                                {currentVehicles.length > 0 ? (
                                    <div className="overflow-auto">
                                        <table className="w-full">
                                            <thead>
                                            <tr className="border-b">
                                                <th className="pb-2 text-left font-medium text-sm">License</th>
                                                <th className="pb-2 text-left font-medium text-sm">Region</th>
                                                <th className="pb-2 text-left font-medium text-sm">Unit</th>
                                                <th className="pb-2 text-left font-medium text-sm">Pass Type</th>
                                                <th className="pb-2 text-left font-medium text-sm">Remaining</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {currentVehicles.map((vehicle, idx) => (
                                                <tr key={idx} className="border-b last:border-0">
                                                    <td className="py-3 text-sm">{vehicle.licensePlate}</td>
                                                    <td className="py-3 text-sm">{vehicle.province}</td>
                                                    <td className="py-3 text-sm">{vehicle.unitNumber}</td>
                                                    <td className="py-3 text-sm">{vehicle.passType}</td>
                                                    <td className="py-3 text-sm">{vehicle.remaining}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No active visitor vehicles in this parking lot
                                    </div>
                                )}
                                <Button variant="ghost" size="sm" className="w-full text-primary justify-center mt-4">
                                    View All Vehicles
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
