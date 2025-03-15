
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext(undefined);

// Create a provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('parkingUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Login function
    const login = (role, userData) => {
        // In a real app, this would communicate with your backend
        const newUser = {
            id: userData?.id || Math.random().toString(36).substring(2, 9),
            name: userData?.name || 'User',
            role: role,
            unitNumber: userData?.unitNumber,
        };

        // Store user in local storage
        localStorage.setItem('parkingUser', JSON.stringify(newUser));
        setUser(newUser);
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('parkingUser');
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: user !== null,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};