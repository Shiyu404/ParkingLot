import './App.css'
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import VisitorDashboard from "./pages/VisitorDashboard";
import VisitorRequest from "./pages/VisitorRequest";
import PayTicket from "./pages/PayTicket";
import Visitors from "./pages/Visitors";
import Vehicles from "./pages/Vehicles";
import Violations from "./pages/Violations";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <div className="flex flex-col min-h-screen bg-background">
                        <Header />
                        <main className="flex-grow w-full max-w-[1400px] mx-auto px-8 py-8">
                            <Routes>
                                {/* Public routes */}
                                <Route path="/" element={<Index />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/visitor-request" element={<VisitorRequest />} />
                                <Route path="/pay-ticket" element={<PayTicket />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/contact" element={<Contact />} />

                                {/* Protected routes for all authenticated users */}
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute allowedRoles={['admin', 'resident', 'visitor']}>
                                            <Profile />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Admin routes */}
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/visitors"
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <Visitors />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/vehicles"
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <Vehicles />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/violations"
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <Violations />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Resident routes */}
                                <Route
                                    path="/resident-dashboard"
                                    element={
                                        <ProtectedRoute allowedRoles={['resident']}>
                                            <ResidentDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Visitor routes */}
                                <Route
                                    path="/visitor-dashboard"
                                    element={
                                        <ProtectedRoute allowedRoles={['visitor']}>
                                            <VisitorDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Catch-all */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;