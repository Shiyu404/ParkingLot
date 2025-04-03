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
    getAllParkingLotNames: '/api/parking-lots-names',
    getActiveVehiclesByLotId: (lotId) => `/api/active-vehicles/${encodeURIComponent(lotId)}`,
    
    // Visitor related
    registerVisitor: '/api/visitors/register',
    
    // Violation records related
    getUserViolations: (userId) => `/api/violations/user/${userId}`,
    createViolation: '/api/violations',
    getViolationById: (ticketId) => `/api/violations/${ticketId}`,
    findViolationsByPlate: (plate, region) => 
        `/api/violations/search?plate=${encodeURIComponent(plate)}&region=${encodeURIComponent(region)}`,
    getAllViolations: '/api/violations',
    getViolationsByLot: (lotId) => `/api/violations?lotId=${encodeURIComponent(lotId)}`,
    getViolationsByDate: (startDate, endDate, lotId) => {
        let url = `/api/violations?`;
        if (startDate) url += `startDate=${encodeURIComponent(startDate)}`;
        if (endDate) url += `${startDate ? '&' : ''}endDate=${encodeURIComponent(endDate)}`;
        if (lotId) url += `${(startDate || endDate) ? '&' : ''}lotId=${encodeURIComponent(lotId)}`;
        return url;
    },
    
    // Payment related
    createPayment: '/api/payments',
    getAllPayments: '/api/payments',
    getPaymentsByDate: (startDate, endDate) => {
        let url = `/api/payments?`;
        if (startDate) url += `startDate=${encodeURIComponent(startDate)}`;
        if (endDate) url += `${startDate ? '&' : ''}endDate=${encodeURIComponent(endDate)}`;
        return url;
    },
    
    // Visitor pass related
    getUserVisitorPasses: (userId) => `/api/visitorPasses/user/${userId}`,
    createVisitorPass: '/api/visitorPasses',
    getUserVisitorPassQuota: (userId) => `/api/visitorPasses/quota/${userId}`,
    verifyVehicle: (plate, region, lotId) =>
        `/api/verify-vehicle?plate=${encodeURIComponent(plate)}&region=${encodeURIComponent(region)}&lotId=${encodeURIComponent(lotId)}`,
    
    // Vehicle related
    getUserVehicles: (userId) => `/api/vehicles/user/${userId}`,
    getAllVehicles: '/api/vehicles/all',
    registerVehicle: '/api/vehicles',
    deleteVehicle: (province, licensePlate) => `/api/vehicles/${encodeURIComponent(province)}/${encodeURIComponent(licensePlate)}`,
}; 