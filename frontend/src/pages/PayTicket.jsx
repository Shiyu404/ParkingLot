import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Car, Receipt, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '@/config';

// North American regions
const northAmericanRegions = [
    // US States
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'CA', label: 'California' },
    // Add more as needed
    // Canadian Provinces
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'ON', label: 'Ontario' },
    { value: 'QC', label: 'Quebec' },
    // Add more as needed
];

const PayTicket = () => {
    const { toast } = useToast();

    // State for citation number search
    const [citationNumber, setCitationNumber] = useState('');

    // State for license plate search
    const [licensePlate, setLicensePlate] = useState('');
    const [regionCode, setRegionCode] = useState('');

    // State for payment info
    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        cardName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
    });

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Found ticket data
    const [foundTicket, setFoundTicket] = useState(null);

    const handleFindByCitation = async () => {
        if (!citationNumber) {
            toast({
                title: "Missing information",
                description: "Please enter a citation number",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Fetching citation:', citationNumber);
            // 尝试两种URL格式
            let response;
            try {
                // 首先尝试使用config.js中定义的API端点
                response = await fetch(API_ENDPOINTS.getViolationById(citationNumber));
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            } catch (err) {
                console.log('First API attempt failed, trying direct URL...');
                // 如果失败，直接尝试不带/api前缀的URL
                response = await fetch(`/violations/${citationNumber}`);
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }
            
            const data = await response.json();
            
            if (data.success && data.violation) {
                // Format the violation data for display
                const violation = data.violation;
                setFoundTicket({
                    id: violation.ticketId,
                    amount: 50.00, // You may need to set this based on violation type
                    date: new Date(violation.time).toLocaleDateString(),
                    location: `Parking Lot #${violation.lotId}`,
                    violation: violation.reason,
                    licensePlate: `${violation.province}-${violation.licensePlate}`,
                    province: violation.province,
                    status: violation.status,
                    lotId: violation.lotId
                });
            } else {
                toast({
                    title: "No ticket found",
                    description: "We couldn't find a ticket with that citation number",
                    variant: "destructive",
                });
                setFoundTicket(null);
            }
        } catch (err) {
            console.error('Error finding ticket:', err);
            setError(err.message);
            toast({
                title: "Error",
                description: "Failed to search for the ticket. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFindByPlate = async () => {
        if (!licensePlate || !regionCode) {
            toast({
                title: "Missing information",
                description: "Please enter both license plate and region",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Searching plate:', licensePlate, 'region:', regionCode);
            // 尝试两种URL格式
            let response;
            try {
                // 首先尝试使用config.js中定义的API端点
                response = await fetch(API_ENDPOINTS.findViolationsByPlate(licensePlate, regionCode));
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            } catch (err) {
                console.log('First API attempt failed, trying direct URL...');
                // 如果失败，直接尝试不带/api前缀的URL
                response = await fetch(`/violations/search?plate=${encodeURIComponent(licensePlate)}&region=${encodeURIComponent(regionCode)}`);
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }
            
            const data = await response.json();
            
            if (data.success && data.violations && data.violations.length > 0) {
                // Get the first unpaid violation
                const pendingViolation = data.violations.find(v => v.status === 'pending') || data.violations[0];
                
                setFoundTicket({
                    id: pendingViolation.ticketId,
                    amount: 50.00, // You may need to set this based on violation type
                    date: new Date(pendingViolation.time).toLocaleDateString(),
                    location: `Parking Lot #${pendingViolation.lotId}`,
                    violation: pendingViolation.reason,
                    licensePlate: `${pendingViolation.province}-${pendingViolation.licensePlate}`,
                    province: pendingViolation.province,
                    status: pendingViolation.status,
                    lotId: pendingViolation.lotId
                });
            } else {
                toast({
                    title: "No ticket found",
                    description: "We couldn't find any pending tickets for this license plate",
                    variant: "destructive",
                });
                setFoundTicket(null);
            }
        } catch (err) {
            console.error('Error finding ticket by plate:', err);
            setError(err.message);
            toast({
                title: "Error",
                description: "Failed to search for the ticket. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!foundTicket) {
            toast({
                title: "Missing information",
                description: "Please search for a ticket first",
                variant: "destructive",
            });
            return;
        }

        if (foundTicket.status === 'paid') {
            toast({
                title: "Already paid",
                description: "This ticket has already been paid",
                variant: "destructive",
            });
            return;
        }

        if (!paymentInfo.cardNumber || !paymentInfo.cardName ||
            !paymentInfo.expiryMonth || !paymentInfo.expiryYear || !paymentInfo.cvv) {
            toast({
                title: "Missing payment information",
                description: "Please fill in all payment details",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Use a default user ID for guest payments
            const userId = 1; // You may need to adjust this based on your system
            
            // 确保lotId和ticketId是数值类型
            const lotIdNum = parseInt(foundTicket.lotId, 10);
            const ticketIdNum = parseInt(foundTicket.id, 10);
            
            // 确保amount是数值类型
            const amountNum = parseFloat(foundTicket.amount);
            
            // 打印请求数据用于调试
            console.log('Payment request data:', {
                amount: amountNum,
                paymentMethod: 'Credit Card',
                cardNumber: paymentInfo.cardNumber,
                userId: userId,
                lotId: lotIdNum,
                ticketId: ticketIdNum
            });
            
            // 尝试直接路径
            let response; 
            try {
                response = await fetch('/payments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: amountNum,
                        paymentMethod: 'Credit Card',
                        cardNumber: paymentInfo.cardNumber,
                        userId: userId,
                        lotId: lotIdNum,
                        ticketId: ticketIdNum
                    }),
                });
                
                if (!response.ok) {
                    throw new Error('First attempt failed');
                }
            } catch (firstError) {
                console.log('First API attempt failed, trying with /api prefix...');
                
                response = await fetch('/api/payments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: amountNum,
                        paymentMethod: 'Credit Card',
                        cardNumber: paymentInfo.cardNumber,
                        userId: userId,
                        lotId: lotIdNum,
                        ticketId: ticketIdNum
                    }),
                });
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }
            
            // 处理响应
            const data = await response.json();
            
            if (data.success) {
                toast({
                    title: "Payment Successful",
                    description: `Paid $${foundTicket.amount.toFixed(2)} for citation #${foundTicket.id}`,
                });

                // Reset form
                setCitationNumber('');
                setLicensePlate('');
                setRegionCode('');
                setPaymentInfo({
                    cardNumber: '',
                    cardName: '',
                    expiryMonth: '',
                    expiryYear: '',
                    cvv: '',
                });
                setFoundTicket(null);
            } else {
                throw new Error(data.message || 'Payment failed');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message);
            toast({
                title: "Payment Failed",
                description: err.message || "There was an error processing your payment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="container mx-auto px-4 pt-20 pb-16">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Pay Parking Ticket</h1>
                <p className="text-gray-500">
                    Search for and pay outstanding parking tickets
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Find Your Ticket</CardTitle>
                            <CardDescription>Search by citation number or license plate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="citation">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="citation">Citation Number</TabsTrigger>
                                    <TabsTrigger value="plate">License Plate</TabsTrigger>
                                </TabsList>

                                <TabsContent value="citation" className="space-y-4">
                                    <div>
                                        <Label htmlFor="citation-number">Citation Number</Label>
                                        <div className="flex mt-2">
                                            <Input
                                                id="citation-number"
                                                placeholder="Enter citation number"
                                                value={citationNumber}
                                                onChange={(e) => setCitationNumber(e.target.value)}
                                                disabled={loading}
                                            />
                                            <Button
                                                className="ml-2"
                                                onClick={handleFindByCitation}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Searching...
                                                    </>
                                                ) : "Search"}
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="plate" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="region">Region/State</Label>
                                            <Select
                                                onValueChange={setRegionCode}
                                                value={regionCode}
                                                disabled={loading}
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
                                        <div>
                                            <Label htmlFor="license-plate">License Plate</Label>
                                            <Input
                                                id="license-plate"
                                                placeholder="Enter plate number"
                                                value={licensePlate}
                                                onChange={(e) => setLicensePlate(e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        className="w-full" 
                                        onClick={handleFindByPlate}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Searching...
                                            </>
                                        ) : "Search"}
                                    </Button>
                                </TabsContent>
                            </Tabs>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        {error}
                                    </div>
                                </div>
                            )}

                            {/* Ticket Information */}
                            {foundTicket && (
                                <div className="mt-6 p-4 border rounded-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-medium">Citation #{foundTicket.id}</h3>
                                            <p className="text-sm text-gray-500">Issued on {foundTicket.date}</p>
                                        </div>
                                        <div className="text-xl font-bold">${foundTicket.amount.toFixed(2)}</div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex">
                                            <Car className="h-4 w-4 text-gray-500 mr-2" />
                                            <span>License Plate: {foundTicket.licensePlate}</span>
                                        </div>
                                        <div className="flex">
                                            <AlertCircle className="h-4 w-4 text-gray-500 mr-2" />
                                            <span>Violation: {foundTicket.violation}</span>
                                        </div>
                                        <div className="flex">
                                            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                            <span>Location: {foundTicket.location}</span>
                                        </div>
                                        <div className="flex">
                                            <Receipt className="h-4 w-4 text-gray-500 mr-2" />
                                            <span>Status: 
                                                <span className={`ml-1 ${
                                                    foundTicket.status === 'paid' 
                                                    ? 'text-green-600 font-medium'
                                                    : 'text-yellow-600 font-medium'
                                                }`}>
                                                    {foundTicket.status === 'paid' ? 'Paid' : 'Pending Payment'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                            <CardDescription>Enter your credit card details to pay the ticket</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="card-number">Card Number</Label>
                                    <Input
                                        id="card-number"
                                        name="cardNumber"
                                        placeholder="XXXX XXXX XXXX XXXX"
                                        value={paymentInfo.cardNumber}
                                        onChange={handleInputChange}
                                        disabled={loading || !foundTicket || foundTicket?.status === 'paid'}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="card-name">Cardholder Name</Label>
                                    <Input
                                        id="card-name"
                                        name="cardName"
                                        placeholder="Name on card"
                                        value={paymentInfo.cardName}
                                        onChange={handleInputChange}
                                        disabled={loading || !foundTicket || foundTicket?.status === 'paid'}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="expire-month">Month</Label>
                                        <Select
                                            name="expiryMonth"
                                            value={paymentInfo.expiryMonth}
                                            onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, expiryMonth: value }))}
                                            disabled={loading || !foundTicket || foundTicket?.status === 'paid'}
                                        >
                                            <SelectTrigger id="expire-month">
                                                <SelectValue placeholder="MM" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const month = i + 1;
                                                    return (
                                                        <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                                            {month.toString().padStart(2, '0')}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="expire-year">Year</Label>
                                        <Select
                                            name="expiryYear"
                                            value={paymentInfo.expiryYear}
                                            onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, expiryYear: value }))}
                                            disabled={loading || !foundTicket || foundTicket?.status === 'paid'}
                                        >
                                            <SelectTrigger id="expire-year">
                                                <SelectValue placeholder="YY" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 10 }, (_, i) => {
                                                    const year = new Date().getFullYear() + i;
                                                    return (
                                                        <SelectItem key={year} value={year.toString().substring(2)}>
                                                            {year.toString().substring(2)}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="cvv">CVV</Label>
                                        <Input
                                            id="cvv"
                                            name="cvv"
                                            placeholder="XXX"
                                            maxLength={4}
                                            value={paymentInfo.cvv}
                                            onChange={handleInputChange}
                                            disabled={loading || !foundTicket || foundTicket?.status === 'paid'}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-4"
                                    onClick={handlePayment}
                                    disabled={loading || !foundTicket || foundTicket?.status === 'paid'}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            {foundTicket?.status === 'paid' 
                                                ? 'Already Paid' 
                                                : `Pay $${foundTicket ? foundTicket.amount.toFixed(2) : '0.00'}`
                                            }
                                        </>
                                    )}
                                </Button>

                                {!foundTicket && (
                                    <p className="text-center text-gray-500 text-sm mt-2">
                                        Search for a ticket first to enable payment
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default PayTicket;