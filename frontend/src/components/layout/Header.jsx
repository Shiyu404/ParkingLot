
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeaderNav from './HeaderNav';
import UserMenu from './UserMenu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="fixed w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg">ParkingPro</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Only show Pay Ticket button for non-admin users */}
              {user && user.role !== 'admin' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex"
                  onClick={() => navigate('/pay-ticket')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Ticket
                </Button>
              )}
              <HeaderNav />
            </>
          ) : null}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
