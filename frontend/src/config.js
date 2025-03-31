// API Configuration
export const API_BASE_URL = '/api';  // 使用 /api 前缀以匹配 Vite 代理配置

// API Endpoints
export const API_ENDPOINTS = {
    // 认证相关
    login: '/api/login',
    register: '/api/users/register',  // 修改为与后端匹配的路径
    
    // 管理员相关
    occupancy: '/api/admin/occupancy',
    violations: '/api/admin/violations',
    
    // 停车场相关
    getAllParkingLots: '/api/parking-lots',
    getParkingLotById: (lotId) => `/api/parking-lots/${lotId}`,
    
    // 违规记录相关
    getUserViolations: (userId) => `/api/violations/user/${userId}`,
    createViolation: '/api/violations',
    
    // 支付相关
    createPayment: '/api/payments',
}; 