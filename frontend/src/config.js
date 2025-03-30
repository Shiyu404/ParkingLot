// API Configuration
export const API_BASE_URL = '';  // 使用相对路径，让 Vite 代理处理

// API Endpoints
export const API_ENDPOINTS = {
    login: '/api/login',
    register: '/api/users/register',
    occupancy: '/api/admin/occupancy',
    violations: '/api/admin/violations',
    parkingLots: '/api/parking-lots',
    parkingLotById: (lotId) => `/api/parking-lots/${lotId}`,
    // Add more endpoints as needed
}; 