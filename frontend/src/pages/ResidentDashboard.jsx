import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Ticket, Calendar, Plus, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { format, formatDistance } from 'date-fns';
import { API_ENDPOINTS } from '@/config';
import { VisitorPass } from '@/components/VisitorPass';

// North American regions
const northAmericanRegions = [
  // US States
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'CA', label: 'California' },
  // Add more states as needed
  // Canadian Provinces
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'ON', label: 'Ontario' },
  { value: 'QC', label: 'Quebec' },
  // Add more provinces as needed
];

// Default pass types and quotas
const DEFAULT_PASS_TYPES = [
  { id: 1, type: '8 hour', hours: 8, total: 5 },
  { id: 2, type: '24 hour', hours: 24, total: 3 },
  { id: 3, type: 'Weekend', hours: 48, total: 1 },
];

function formatTimeRemaining(validTimeStr) {
  try {
    const validTime = new Date(validTimeStr);
    const now = new Date();
    return validTime > now ? formatDistance(validTime, now, { addSuffix: false }) : 'Expired';
  } catch (e) {
    return 'Unknown';
  }
}

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [licensePlate, setLicensePlate] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [selectedPassType, setSelectedPassType] = useState('');
  const [loading, setLoading] = useState(true);
  const [visitorPasses, setVisitorPasses] = useState([]);
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [error, setError] = useState(null);
  const [passHistory, setPassHistory] = useState([]);
  
  // Fetch visitor passes data
  useEffect(() => {
    if (user?.id) {
      fetchVisitorPasses();
    }
  }, [user]);
  
  const fetchVisitorPasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.getUserVisitorPasses(user.id));
      const data = await response.json();
      console.log('Fetch visitor passes response:', data);
      
      if (data.success) {
        const passes = data.visitorPasses || [];
        processVisitorPasses(passes);
      }
    } catch (err) {
      console.error('Error fetching visitor passes:', err);
      toast({
        title: "错误",
        description: "获取通行证数据失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const processVisitorPasses = (passes) => {
    // 处理活跃通行证
    const active = passes.filter(pass => {
      if (!pass.status || pass.status !== 'active') return false;
      // 如果没有 validTime，使用 createdAt 加上 hours 来计算
      if (!pass.validTime && pass.createdAt && pass.hours) {
        const createdAt = new Date(pass.createdAt);
        const validTime = new Date(createdAt.getTime() + pass.hours * 60 * 60 * 1000);
        pass.validTime = validTime.toISOString();
      }
      const validTime = new Date(pass.validTime);
      return validTime > new Date();
    });
    
    // 转换活跃通行证数据用于显示
    const activeForDisplay = active.map(pass => ({
      id: pass.visitorPassId,
      plate: pass.visitorPlate || pass.plate || 'Not assigned',
      timeRemaining: formatTimeRemaining(pass.validTime),
      passType: getPassTypeFromHours(pass.hours || 24),
      validTime: pass.validTime
    }));
    
    console.log('Active visitors:', activeForDisplay);
    setActiveVisitors(activeForDisplay);
    
    // 处理历史记录
    const history = passes.map(pass => {
      // 如果没有 validTime，使用 createdAt 加上 hours 来计算
      if (!pass.validTime && pass.createdAt && pass.hours) {
        const createdAt = new Date(pass.createdAt);
        const validTime = new Date(createdAt.getTime() + pass.hours * 60 * 60 * 1000);
        pass.validTime = validTime.toISOString();
      }

      return {
        passId: pass.visitorPassId,
        date: pass.createdAt ? format(new Date(pass.createdAt), 'MMM d, yyyy') : 'Unknown',
        validTime: pass.validTime,
        status: pass.status,
        plate: pass.visitorPlate || pass.plate || 'Not assigned',
        passType: getPassTypeFromHours(pass.hours || 24)
      };
    });
    
    history.sort((a, b) => {
      if (!a.validTime || !b.validTime) return 0;
      return new Date(b.validTime) - new Date(a.validTime);
    });
    console.log('Pass history:', history);
    setPassHistory(history);
    
    // 更新通行证配额
    calculatePassQuota(passes);
  };
  
  const getPassTypeFromHours = (hours) => {
    const passType = DEFAULT_PASS_TYPES.find(type => type.hours === hours);
    return passType ? passType.type : `${hours} hour`;
  };
  
  const formatTimeRemaining = (validTimeStr) => {
    try {
      const validTime = new Date(validTimeStr);
      const now = new Date();
      const diff = validTime - now;
      
      if (diff <= 0) return '已过期';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
      }
      return `${minutes}分钟`;
    } catch (e) {
      return '未知';
    }
  };
  
  // Calculate pass quota based on existing passes
  const calculatePassQuota = (passes) => {
    const passCountByType = {};
    
    // 初始化计数器
    DEFAULT_PASS_TYPES.forEach(type => {
      passCountByType[type.type] = 0;
    });
    
    // 统计活跃通行证
    passes.forEach(pass => {
      if (pass.status === 'active') {
        const passType = getPassTypeFromHours(pass.hours || 24);
        if (passCountByType[passType] !== undefined) {
          passCountByType[passType]++;
        }
      }
    });
    
    // 计算剩余配额
    const quotaWithRemaining = DEFAULT_PASS_TYPES.map(type => ({
      id: type.id,
      type: type.type,
      total: type.total,
      remaining: Math.max(0, type.total - (passCountByType[type.type] || 0))
    }));
    
    setVisitorPasses(quotaWithRemaining);
  };
  
  const handleUsePass = async (passType) => {
    if (!licensePlate || !regionCode) {
      toast({
        title: "缺少信息",
        description: "请填写州/省和车牌号",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const selectedPass = DEFAULT_PASS_TYPES.find(p => p.type === passType);
      if (!selectedPass) {
        throw new Error('Invalid pass type');
      }

      const visitorPlate = `${regionCode}-${licensePlate.toUpperCase()}`;
      console.log('Creating visitor pass with:', {
        userId: user.id,
        hours: selectedPass.hours,
        visitorPlate
      });

      const response = await fetch(API_ENDPOINTS.createVisitorPass, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          hours: selectedPass.hours,
          visitorPlate
        }),
      });

      const data = await response.json();
      console.log('Apply visitor pass response:', data);

      if (data.success) {
        toast({
          title: "成功",
          description: `已为车牌 ${visitorPlate} 创建${selectedPass.type}通行证`,
        });
    setLicensePlate('');
    setRegionCode('');
        // 立即重新获取数据
        await fetchVisitorPasses();
      } else {
        toast({
          title: "错误",
          description: data.message || "创建访客通行证失败",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error applying visitor pass:', err);
      toast({
        title: "错误",
        description: "创建访客通行证失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Visitor Passes */}
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active Visitor Passes
              </CardTitle>
            <CardDescription>
              Currently active visitor passes
            </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              {activeVisitors.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No active visitor passes
                </div>
              ) : (
                activeVisitors.map(visitor => (
                  <VisitorPass
                    key={visitor.id}
                    plate={visitor.plate}
                    timeRemaining={visitor.timeRemaining}
                    passType={visitor.passType}
                  />
                ))
              )}
              </div>
          </CardContent>
        </Card>

        {/* Create New Pass */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Pass
            </CardTitle>
            <CardDescription>
              Issue a new visitor pass
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                      <div className="space-y-2">
                <Label>州/省</Label>
                <Select value={regionCode} onValueChange={setRegionCode}>
                          <SelectTrigger>
                    <SelectValue placeholder="选择州/省" />
                          </SelectTrigger>
                  <SelectContent>
                            {northAmericanRegions.map(region => (
                              <SelectItem key={region.value} value={region.value}>
                                {region.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                <Label>车牌号</Label>
                        <Input 
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="输入车牌号"
                        />
                      </div>
              <div className="space-y-2">
                <Label>通行证类型</Label>
                <div className="grid gap-2">
                  {visitorPasses.map(pass => (
                    <Button
                      key={pass.id}
                      variant={pass.remaining > 0 ? "outline" : "ghost"}
                      disabled={pass.remaining === 0}
                      onClick={() => handleUsePass(pass.type)}
                      className="w-full justify-between"
                    >
                      <span>{pass.type}</span>
                      <span className="text-muted-foreground">
                        {pass.remaining}/{pass.total} remaining
                      </span>
                    </Button>
                  ))}
                </div>
            </div>
            </div>
        </CardContent>
      </Card>
      </div>

      {/* Recent Pass Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Pass Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {passHistory.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No pass usage history
              </div>
            ) : (
              <div className="space-y-4">
                {passHistory.map(pass => (
                  <div
                    key={pass.passId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">
                        {pass.plate}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pass.date} - {pass.passType}
                      </div>
                    </div>
                    <div className={`text-sm ${
                      pass.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {pass.status}
                    </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
