/** @jsxImportSource react */
import React from 'react';
import { Car, CreditCard, LayoutDashboard, Users, CarFront, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();

  // 根据用户角色获取dashboard路径
  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/dashboard';
      case 'resident':
        return '/resident-dashboard';
      case 'visitor':
        return '/visitor-dashboard';
      default:
        return '/';
    }
  };

  return React.createElement('header', { 
    className: 'sticky top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b'
  },
    React.createElement('div', { 
      className: 'w-full max-w-[1400px] mx-auto px-8'
    },
      React.createElement('div', {
        className: 'flex h-16 items-center justify-between'
      },
        // Logo and Brand
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Link, { to: '/', className: 'flex items-center gap-2' },
            React.createElement('div', { className: 'p-2 rounded-md bg-primary/10' },
              React.createElement(Car, { className: 'h-5 w-5 text-primary' })
            ),
            React.createElement('span', { className: 'font-bold text-lg text-primary' }, 'ParkWatch')
          )
        ),
        
        // Navigation and User Menu
        React.createElement('div', { className: 'flex items-center gap-6' },
          // Admin Navigation Links
          user?.role === 'admin' && React.createElement('div', { className: 'flex items-center gap-6' },
            React.createElement(Link, { 
              to: '/dashboard',
              className: 'flex items-center text-sm text-muted-foreground hover:text-primary transition-colors'
            },
              React.createElement(LayoutDashboard, { className: 'mr-2 h-4 w-4' }),
              'Dashboard'
            ),
            React.createElement(Link, { 
              to: '/visitors',
              className: 'flex items-center text-sm text-muted-foreground hover:text-primary transition-colors'
            },
              React.createElement(Users, { className: 'mr-2 h-4 w-4' }),
              'Visitors'
            ),
            React.createElement(Link, { 
              to: '/vehicles',
              className: 'flex items-center text-sm text-muted-foreground hover:text-primary transition-colors'
            },
              React.createElement(CarFront, { className: 'mr-2 h-4 w-4' }),
              'Vehicles'
            ),
            React.createElement(Link, { 
              to: '/violations',
              className: 'flex items-center text-sm text-muted-foreground hover:text-primary transition-colors'
            },
              React.createElement(AlertTriangle, { className: 'mr-2 h-4 w-4' }),
              'Violations'
            )
          ),
          // Dashboard Link for non-admin logged-in users
          user && user.role !== 'admin' && React.createElement(Link, {
            to: getDashboardPath(user.role),
            className: 'flex items-center text-sm text-muted-foreground hover:text-primary transition-colors'
          },
            React.createElement(LayoutDashboard, { className: 'mr-2 h-4 w-4' }),
            'Dashboard'
          ),
          // Show Pay Ticket link for all users
          React.createElement(Link, { 
            to: '/pay-ticket',
            className: 'flex items-center text-sm text-muted-foreground hover:text-primary transition-colors'
          },
            React.createElement(CreditCard, { className: 'mr-2 h-4 w-4' }),
            'Pay Ticket'
          ),
          // User Menu
          React.createElement(UserMenu)
        )
      )
    )
  );
};

export default Header;
