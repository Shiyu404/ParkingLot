import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, Mail, Home } from 'lucide-react';
import { API_ENDPOINTS } from '@/config';

const Profile = () => {
  const { user, login } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match if password is being updated
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.users}/${user.ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          password: formData.password || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update user context with new information using login function
        login(user.role, {
          ...user,
          name: data.user.name,
          phone: data.user.phone,
        });

        // Reset password fields
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));

        toast({
          title: "Profile Updated",
          description: "Your profile information has been updated successfully.",
        });
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  New Password (Optional)
                </Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Confirm New Password
                </Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
              </div>
              
              {user?.role === 'resident' && (
                <div className="space-y-2">
                  <Label htmlFor="unitNumber" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Unit Number
                  </Label>
                  <Input 
                    id="unitNumber" 
                    name="unitNumber"
                    value={user.unitNumber}
                    disabled
                  />
                </div>
              )}
              
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
