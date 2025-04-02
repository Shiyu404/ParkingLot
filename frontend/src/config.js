// API Configuration
export const API_BASE_URL = '/api';  // 使用 /api 前缀以匹配 Vite 代理配置

// API Endpoints
export const API_ENDPOINTS = {
    // 认证相关
    login: '/api/users/login',  // 使用/api前缀让Vite代理处理请求
    register: '/api/users/register',
    
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
    
    // 访客通行证相关
    getUserVisitorPasses: (userId) => `/api/visitorPasses/user/${userId}`,
    createVisitorPass: '/api/visitorPasses',
    getUserVisitorPassQuota: (userId) => `/api/visitorPasses/quota/${userId}`,
}; 