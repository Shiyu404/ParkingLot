/** @jsxImportSource react */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserMenu from './UserMenu';

const Header = () => {
  const navigate = useNavigate();
  // 临时用户状态
  const isAuthenticated = true;
  const user = {
    name: 'Test User',
    role: 'admin',
    unitNumber: 'A101'
  };

  // Different navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/visitors', label: 'Visitors' },
          { to: '/vehicles', label: 'Vehicles' },
          { to: '/violations', label: 'Violations' }
        ];
      case 'resident':
        return [
          { to: '/resident-dashboard', label: 'Dashboard' }
        ];
      case 'visitor':
        return [
          { to: '/visitor-dashboard', label: 'Dashboard' }
        ];
      default:
        return [];
    }
  };

  return React.createElement('header', { 
    className: 'fixed w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b'
  },
    React.createElement('div', { 
      className: 'container flex h-16 items-center justify-between'
    },
      // Logo and Brand
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Link, { to: '/', className: 'flex items-center gap-2' },
          React.createElement('div', { className: 'p-2 rounded-md bg-primary/10' },
            React.createElement(Car, { className: 'h-5 w-5 text-primary' })
          ),
          React.createElement('span', { className: 'font-bold text-lg' }, 'ParkWatch')
        )
      ),
      
      // Navigation and User Menu
      React.createElement('div', { className: 'flex items-center gap-4' },
        isAuthenticated && (
          React.createElement(React.Fragment, null,
            // Only show Pay Ticket button for non-admin users
            user && user.role !== 'admin' && (
              React.createElement(Button, {
                variant: 'outline',
                size: 'sm',
                className: 'hidden sm:flex',
                onClick: () => navigate('/pay-ticket')
              },
                React.createElement(CreditCard, { className: 'mr-2 h-4 w-4' }),
                'Pay Ticket'
              )
            ),
            // Navigation Links
            React.createElement('nav', { className: 'flex' },
              getNavLinks().map(link =>
                React.createElement(Link, {
                  key: link.to,
                  to: link.to,
                  className: 'px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
                }, link.label)
              )
            )
          )
        ),
        // User Menu
        React.createElement(UserMenu)
      )
    )
  );
};

export default Header;
