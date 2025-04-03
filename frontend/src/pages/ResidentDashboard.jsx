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
import VisitorPassCard from "@/components/VisitorPassCard";
import { northAmericanRegions } from '../lib/regions';

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
    if (user?.ID) {
      fetchVisitorPasses();
    }
  }, [user]);
  
  const fetchVisitorPasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.getUserVisitorPasses(user.ID));
      const data = await response.json();
      
      if (data.success) {
        const passes = data.visitorPasses || [];
        processVisitorPasses(passes);
      }
    } catch (err) {
      console.error('Error fetching visitor passes:', err);
      toast({
        title: "Error",
        description: "Failed to fetch visitor passes data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const processVisitorPasses = (passes) => {
    // Process active passes (only those with assigned plates)
    const active = passes.filter(pass => 
      pass.status === 'active' && 
      pass.plate && 
      pass.plate !== 'Not assigned'
    );
    
    // Convert active passes data for display
    const activeForDisplay = active.map(pass => ({
      id: pass.visitorPassId,
      plate: pass.plate,
      timeRemaining: formatTimeRemaining(pass.validTime),
      passType: getPassTypeFromHours(pass.hours || 24),
      validTime: pass.validTime
    }));
    
    setActiveVisitors(activeForDisplay);
    
    // Process history records
    const history = passes
      .filter(pass => pass.status === 'expired')
      .map(pass => ({
        passId: pass.visitorPassId,
        date: pass.createdAt ? format(new Date(pass.createdAt), 'MMM d, yyyy') : 'Unknown',
        plate: pass.plate || 'Not assigned',
        passType: getPassTypeFromHours(pass.hours || 24),
        status: pass.status
      }));
    
    // Sort by date, newest first
    history.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date) - new Date(a.date);
    });
    
    setPassHistory(history);
    
    // Update pass quota
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
      const diff = validTime.getTime() - now.getTime();
      
      if (diff <= 0) return 'Expired';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
      }
      return `${minutes}m remaining`;
    } catch (e) {
      console.error('Error formatting time:', e);
      return 'Unknown';
    }
  };
  
  // Calculate pass quota based on existing passes
  const calculatePassQuota = (passes) => {
    const passCountByType = {};
    
    // Initialize counters
    DEFAULT_PASS_TYPES.forEach(type => {
      passCountByType[type.type] = 0;
    });
    
    // Count not_used passes
    passes.forEach(pass => {
      if (pass.status === 'not_used') {
        const passType = getPassTypeFromHours(pass.hours || 24);
        if (passCountByType[passType] !== undefined) {
          passCountByType[passType]++;
        }
      }
    });
    
    // Calculate remaining quota
    const quotaWithRemaining = DEFAULT_PASS_TYPES.map(type => ({
      id: type.id,
      type: type.type,
      total: type.total,
      remaining: passCountByType[type.type] || 0
    }));
    
    setVisitorPasses(quotaWithRemaining);
  };
  
  const handleUsePass = async (passType) => {
    if (!licensePlate || !regionCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in the province/state and license plate",
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

      const response = await fetch(API_ENDPOINTS.createVisitorPass, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.ID,
          hours: selectedPass.hours,
          visitorPlate
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Created ${selectedPass.type} pass for plate ${visitorPlate}`,
        });
        setLicensePlate('');
        setRegionCode('');

        await fetchVisitorPasses();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create visitor pass",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error applying visitor pass:', err);
      toast({
        title: "Error",
        description: "Failed to create visitor pass",
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
              {activeVisitors.filter(visitor => visitor.plate !== 'Not assigned').length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No active visitor passes
                </div>
              ) : (
                activeVisitors
                  .filter(visitor => visitor.plate !== 'Not assigned')
                  .map(visitor => (
                    <div key={visitor.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{visitor.plate}</div>
                          <div className="text-sm text-muted-foreground">
                            {/* {visitor.passType} */}
                          </div>
                        </div>
                        <div className="text-sm text-green-600">
                          {visitor.timeRemaining}
                        </div>
                      </div>
                    </div>
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
              Use a Pass
            </CardTitle>
            <CardDescription>
              Issue a new visitor pass
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Province/State</Label>
                <Select value={regionCode} onValueChange={setRegionCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select province/state" />
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
                <Label>License Plate</Label>
                <Input 
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="Enter license plate"
                />
              </div>
              <div className="space-y-2">
                <Label>Pass Type</Label>
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
          <CardDescription>
            Expired visitor passes history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {passHistory.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No expired passes history
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
                    <div className="text-sm text-red-600">
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
