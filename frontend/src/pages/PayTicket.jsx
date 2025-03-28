
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Car, Receipt, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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

    // Mock ticket data
    const [foundTicket, setFoundTicket] = useState(null);

    const handleFindByCitation = () => {
        if (!citationNumber) {
            toast({
                title: "Missing information",
                description: "Please enter a citation number",
                variant: "destructive",
            });
            return;
        }

        // In a real app, this would query your backend
        // Mock finding a ticket for demo purposes
        setFoundTicket({
            id: citationNumber,
            amount: 75.00,
            date: 'October 15, 2023',
            location: 'North Tower Parking',
            violation: 'No Valid Visitor Pass',
            licensePlate: 'XYZ789',
        });
    };

    const handleFindByPlate = () => {
        if (!licensePlate || !regionCode) {
            toast({
                title: "Missing information",
                description: "Please enter both license plate and region",
                variant: "destructive",
            });
            return;
        }

        // In a real app, this would query your backend
        // Mock finding a ticket for demo purposes
        setFoundTicket({
            id: Math.random().toString(36).substring(2, 10).toUpperCase(),
            amount: 50.00,
            date: 'October 18, 2023',
            location: 'East Tower Parking',
            violation: 'Parking in Reserved Space',
            licensePlate: `${regionCode}-${licensePlate}`,
        });
    };

    const handlePayment = () => {
        if (!foundTicket) {
            toast({
                title: "No ticket found",
                description: "Please search for a ticket first",
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

        // In a real app, this would process payment through your backend
        console.log('Processing payment:', { ticket: foundTicket, payment: paymentInfo });

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
                                            />
                                            <Button
                                                className="ml-2"
                                                onClick={handleFindByCitation}
                                            >
                                                Search
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
                                            />
                                        </div>
                                    </div>
                                    <Button className="w-full" onClick={handleFindByPlate}>Search</Button>
                                </TabsContent>
                            </Tabs>

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
                                <div className="space-y-2">
                                    <Label htmlFor="card-number">Card Number</Label>
                                    <Input
                                        id="card-number"
                                        placeholder="XXXX XXXX XXXX XXXX"
                                        value={paymentInfo.cardNumber}
                                        onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="card-name">Cardholder Name</Label>
                                    <Input
                                        id="card-name"
                                        placeholder="Name on card"
                                        value={paymentInfo.cardName}
                                        onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry-month">Month</Label>
                                        <Select
                                            onValueChange={(value) => setPaymentInfo({...paymentInfo, expiryMonth: value})}
                                            value={paymentInfo.expiryMonth}
                                        >
                                            <SelectTrigger>
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

                                    <div className="space-y-2">
                                        <Label htmlFor="expiry-year">Year</Label>
                                        <Select
                                            onValueChange={(value) => setPaymentInfo({...paymentInfo, expiryYear: value})}
                                            value={paymentInfo.expiryYear}
                                        >
                                            <SelectTrigger>
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

                                    <div className="space-y-2">
                                        <Label htmlFor="cvv">CVV</Label>
                                        <Input
                                            id="cvv"
                                            placeholder="XXX"
                                            value={paymentInfo.cvv}
                                            onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-4"
                                    disabled={!foundTicket}
                                    onClick={handlePayment}
                                >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Pay Ticket
                                </Button>

                                {!foundTicket && (
                                    <p className="text-sm text-center text-muted-foreground mt-2">
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