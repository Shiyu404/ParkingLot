// API Configuration
export const API_BASE_URL = '/api';  // Use /api prefix to match Vite proxy configuration

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication related
    login: '/api/users/login',
    register: '/api/users/register',
    
    // Admin related
    occupancy: '/api/admin/occupancy',
    violations: '/api/admin/violations',
    
    // Parking lot related
    getAllParkingLots: '/api/parking-lots',
    getParkingLotById: (lotId) => `/api/parking-lots/${lotId}`,
    
    // Visitor related
    registerVisitor: '/api/visitors/register',
    
    // Violation records related
    getUserViolations: (userId) => `/api/violations/user/${userId}`,
    createViolation: '/api/violations',
    getViolationById: (ticketId) => `/api/violations/${ticketId}`,
    findViolationsByPlate: (plate, region) => 
        `/api/violations/search?plate=${encodeURIComponent(plate)}&region=${encodeURIComponent(region)}`,
    
    // Payment related
    createPayment: '/api/payments',
    
    // Visitor pass related
    getUserVisitorPasses: (userId) => `/api/visitorPasses/user/${userId}`,
    createVisitorPass: '/api/visitorPasses',
    getUserVisitorPassQuota: (userId) => `/api/visitorPasses/quota/${userId}`,
    verifyVehicle: (plate, region, lotId) =>
        `/api/verify-vehicle?plate=${encodeURIComponent(plate)}&region=${encodeURIComponent(region)}&lotId=${encodeURIComponent(lotId)}`,
    
}; 