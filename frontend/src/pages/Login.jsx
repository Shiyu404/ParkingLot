import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Key, User, Home, Car, Mail, Phone, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const parkingLots = [
    { id: '1', name: 'North Tower Parking' },
    { id: '2', name: 'South Tower Parking' },
    { id: '3', name: 'East Tower Parking' },
    { id: '4', name: 'West Tower Parking' },
];

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const from = location.state?.from?.pathname || "/";

    const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });

    const [registrationData, setRegistrationData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        parkingLotId: '',
        unitNumber: '',
        phone: '',
    });

    const handleLogin = (e) => {
        e.preventDefault();

        if (!loginCredentials.email || !loginCredentials.password) {
            toast({
                title: "Login failed",
                description: "Please enter email and password",
                variant: "destructive",
            });
            return;
        }

        if (loginCredentials.email.includes('admin') && loginCredentials.password === 'password') {
            login('admin', { name: 'Administrator' });
            toast({
                title: "Login successful",
                description: "Welcome back, Administrator",
            });
            navigate('/dashboard');
        }
        else if (loginCredentials.email.includes('resident') && loginCredentials.password === 'password') {
            login('resident', {
                name: `Resident ${Math.floor(Math.random() * 100)}`,
                unitNumber: `${Math.floor(Math.random() * 500)}`
            });
            toast({
                title: "Login successful",
                description: "Welcome back, Resident",
            });
            navigate('/resident-dashboard');
        }
        else {
            toast({
                title: "Login failed",
                description: "Invalid credentials",
                variant: "destructive",
            });
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();

        if (!registrationData.email || !registrationData.password || !registrationData.name ||
            !registrationData.unitNumber || !registrationData.phone || !registrationData.parkingLotId) {
            toast({
                title: "Registration failed",
                description: "Please fill all required fields",
                variant: "destructive",
            });
            return;
        }

        if (registrationData.password !== registrationData.confirmPassword) {
            toast({
                title: "Registration failed",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        console.log('Registration submitted:', registrationData);

        toast({
            title: "Registration Pending",
            description: "Your registration has been submitted and is awaiting administrator approval.",
        });

        setRegistrationData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            parkingLotId: '',
            unitNumber: '',
            phone: '',
        });
    };

    return (
        <div className="container mx-auto px-4 pt-20 pb-16 flex justify-center items-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-center">Parking Management System</CardTitle>
                        <CardDescription className="text-center">
                            Log in to manage your parking services
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid grid-cols-2 mb-6">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={loginCredentials.email}
                                            onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="flex items-center gap-2">
                                            <Key className="h-4 w-4" />
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter password"
                                            value={loginCredentials.password}
                                            onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">Login</Button>
                                </form>

                                <div className="mt-4 text-center text-sm text-muted-foreground">
                                    For testing:
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="text-left p-2 bg-primary/5 rounded text-xs">
                                            <p className="font-medium">Admin Test Account:</p>
                                            <p>Email: admin@test.com</p>
                                            <p>Password: password</p>
                                        </div>
                                        <div className="text-left p-2 bg-primary/5 rounded text-xs">
                                            <p className="font-medium">Resident Test Account:</p>
                                            <p>Email: resident@test.com</p>
                                            <p>Password: password</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="register">
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-name" className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Full Name
                                        </Label>
                                        <Input
                                            id="reg-name"
                                            placeholder="Enter your full name"
                                            value={registrationData.name}
                                            onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </Label>
                                        <Input
                                            id="reg-email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={registrationData.email}
                                            onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="reg-phone"
                                            placeholder="Enter your phone number"
                                            value={registrationData.phone}
                                            onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="parkingLotId" className="flex items-center gap-2">
                                            <Car className="h-4 w-4" />
                                            Parking Lot
                                        </Label>
                                        <Select
                                            onValueChange={(value) => setRegistrationData({...registrationData, parkingLotId: value})}
                                            value={registrationData.parkingLotId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your parking lot" />
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
                                        <Label htmlFor="reg-unit" className="flex items-center gap-2">
                                            <Home className="h-4 w-4" />
                                            Unit Number
                                        </Label>
                                        <Input
                                            id="reg-unit"
                                            placeholder="Enter your unit number"
                                            value={registrationData.unitNumber}
                                            onChange={(e) => setRegistrationData({...registrationData, unitNumber: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-password" className="flex items-center gap-2">
                                            <Key className="h-4 w-4" />
                                            Password
                                        </Label>
                                        <Input
                                            id="reg-password"
                                            type="password"
                                            placeholder="Create a password"
                                            value={registrationData.password}
                                            onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-confirm-password" className="flex items-center gap-2">
                                            <Key className="h-4 w-4" />
                                            Confirm Password
                                        </Label>
                                        <Input
                                            id="reg-confirm-password"
                                            type="password"
                                            placeholder="Confirm your password"
                                            value={registrationData.confirmPassword}
                                            onChange={(e) => setRegistrationData({...registrationData, confirmPassword: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Register Account
                                    </Button>
                                </form>

                                <div className="mt-4 text-center text-sm text-muted-foreground">
                                    <p>Registration requires admin approval. You'll receive an email once approved.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
