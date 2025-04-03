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
        // Ensure all user data is preserved while maintaining required fields
        const newUser = {
            ...userData,
            ID: userData.ID,  // Ensure ID is preserved
            role: role,
            name: userData.name,
            unitNumber: userData.unitNumber,
            userType: userData.userType
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