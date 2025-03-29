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
import { API_ENDPOINTS } from '@/config';

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

    const [loginCredentials, setLoginCredentials] = useState({ phone: '', password: '' });

    const [registrationData, setRegistrationData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        userType: 'resident',
        unitNumber: '',
        hostInformation: '',
    });

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!loginCredentials.phone || !loginCredentials.password) {
            toast({
                title: "Login Failed",
                description: "Please enter phone number and password",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    phone: loginCredentials.phone,
                    password: loginCredentials.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    toast({
                        title: "Login Failed",
                        description: "Invalid phone number or password",
                        variant: "destructive",
                    });
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return;
            }

            if (data.success) {
                // Login successful
                login(data.user.role, data.user);  // Use user role and info from backend
                toast({
                    title: "Login Successful",
                    description: `Welcome back, ${data.user.name}`,
                });
                
                // Navigate based on user role
                if (data.user.role === 'admin') {
                    navigate('/dashboard');
                } else if (data.user.role === 'resident') {
                    navigate('/resident-dashboard');
                } else {
                    navigate('/visitor-dashboard');
                }
            } else {
                // Login failed
                toast({
                    title: "Login Failed",
                    description: data.message || "Invalid phone number or password",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: "Login Failed",
                description: "Server connection failed. Please try again later",
                variant: "destructive",
            });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!registrationData.name || !registrationData.phone || !registrationData.password) {
            toast({
                title: "Registration Failed",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        // Validate password match
        if (registrationData.password !== registrationData.confirmPassword) {
            toast({
                title: "Registration Failed",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        // Validate additional fields based on user type
        if (registrationData.userType === 'resident' && !registrationData.unitNumber) {
            toast({
                title: "Registration Failed",
                description: "Unit number is required for residents",
                variant: "destructive",
            });
            return;
        }

        if (registrationData.userType === 'visitor' && !registrationData.hostInformation) {
            toast({
                title: "Registration Failed",
                description: "Host information is required for visitors",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.register, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: registrationData.name,
                    phone: registrationData.phone,
                    password: registrationData.password,
                    userType: registrationData.userType,
                    ...(registrationData.userType === 'resident' && {
                        unitNumber: parseInt(registrationData.unitNumber)
                    }),
                    ...(registrationData.userType === 'visitor' && {
                        hostInformation: registrationData.hostInformation
                    })
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Registration Successful",
                    description: "Your account has been created successfully",
                });

                // Reset form
                setRegistrationData({
                    name: '',
                    phone: '',
                    password: '',
                    confirmPassword: '',
                    userType: 'resident',
                    unitNumber: '',
                    hostInformation: '',
                });

                // Switch to login tab
                const loginTab = document.querySelector('[value="login"]');
                if (loginTab) {
                    loginTab.click();
                }
            } else {
                toast({
                    title: "Registration Failed",
                    description: data.message || "Registration failed. Please try again",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast({
                title: "Registration Failed",
                description: "Server connection failed. Please try again later",
                variant: "destructive",
            });
        }
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
                            Sign in to manage your parking services
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid grid-cols-2 mb-6">
                                <TabsTrigger value="login">Sign In</TabsTrigger>
                                <TabsTrigger value="register">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            value={loginCredentials.phone}
                                            onChange={(e) => setLoginCredentials({...loginCredentials, phone: e.target.value})}
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
                                            placeholder="Enter your password"
                                            value={loginCredentials.password}
                                            onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        <p>Test Accounts:</p>
                                        <p>Admin: 1234567890 / password</p>
                                        <p>Resident: 9876543210 / password</p>
                                    </div>

                                    <Button type="submit" className="w-full">
                                        <Key className="mr-2 h-4 w-4" />
                                        Sign In
                                    </Button>
                                </form>
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
                                        <Label htmlFor="reg-phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="reg-phone"
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            value={registrationData.phone}
                                            onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
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
                                            placeholder="Enter your password"
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

                                    <div className="space-y-2">
                                        <Label htmlFor="userType" className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            User Type
                                        </Label>
                                        <Select
                                            onValueChange={(value) => setRegistrationData({...registrationData, userType: value})}
                                            value={registrationData.userType}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select user type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="resident">Resident</SelectItem>
                                                <SelectItem value="visitor">Visitor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {registrationData.userType === 'resident' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="reg-unit" className="flex items-center gap-2">
                                                <Home className="h-4 w-4" />
                                                Unit Number
                                            </Label>
                                            <Input
                                                id="reg-unit"
                                                type="number"
                                                placeholder="Enter your unit number"
                                                value={registrationData.unitNumber}
                                                onChange={(e) => setRegistrationData({...registrationData, unitNumber: e.target.value})}
                                                required
                                            />
                                        </div>
                                    )}

                                    {registrationData.userType === 'visitor' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="host-info" className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Host Information
                                            </Label>
                                            <Input
                                                id="host-info"
                                                placeholder="Enter host information"
                                                value={registrationData.hostInformation}
                                                onChange={(e) => setRegistrationData({...registrationData, hostInformation: e.target.value})}
                                                required
                                            />
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Register
                                    </Button>
                                </form>

                                <div className="mt-4 text-center text-sm text-muted-foreground">
                                    <p>Note: Registration requires administrator approval. You will receive an email once approved.</p>
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
