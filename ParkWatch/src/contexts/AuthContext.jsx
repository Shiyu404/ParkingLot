import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext(undefined);

// Create a provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        try {
            console.log('Checking for existing session...');
            const storedUser = localStorage.getItem('parkingUser');
            console.log('Retrieved from localStorage:', storedUser);
            
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    console.log('Parsed user data:', parsedUser);
                    setUser(parsedUser);
                } catch (parseError) {
                    console.error('Failed to parse user data:', parseError);
                    // Invalid JSON, clear the corrupted data
                    localStorage.removeItem('parkingUser');
                }
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login function
    const login = (role, userData) => {
        try {
            console.log('Login called with role:', role);
            console.log('Login data:', userData);
            
            // Ensure all user data is preserved while maintaining required fields
            const newUser = {
                ...userData,
                ID: userData.ID,  // Ensure ID is preserved
                role: role,
                name: userData.name,
                unitNumber: userData.unitNumber,
                userType: userData.userType
            };

            console.log('Storing user data:', newUser);
            
            // Store user in local storage
            localStorage.setItem('parkingUser', JSON.stringify(newUser));
            setUser(newUser);
        } catch (error) {
            console.error('Error in login function:', error);
        }
    };

    // Logout function
    const logout = () => {
        try {
            localStorage.removeItem('parkingUser');
            setUser(null);
        } catch (error) {
            console.error('Error in logout function:', error);
        }
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: user !== null,
        loading
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