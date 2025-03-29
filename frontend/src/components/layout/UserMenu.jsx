/** @jsxImportSource react */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, LayoutDashboard, Users, Car, AlertTriangle } from 'lucide-react';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();  // Call the logout function from AuthContext
    navigate('/login');  // Redirect to login page
  };

  if (!user) {
    return React.createElement('div', {
      className: 'text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer',
      onClick: () => navigate('/login')
    }, 'Login');
  }

  // Get initials for avatar
  const getInitials = () => {
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role display text
  const getRoleDisplay = () => {
    switch (user.role) {
      case 'admin':
        return 'Administrator';
      case 'resident':
        return `Resident (${user.unitNumber})`;
      case 'visitor':
        return 'Visitor';
      default:
        return '';
    }
  };

  // Get role-specific menu items
  const getRoleSpecificItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', onClick: () => navigate('/dashboard') },
          { icon: Users, label: 'Visitors', onClick: () => navigate('/visitors') },
          { icon: Car, label: 'Vehicles', onClick: () => navigate('/vehicles') },
          { icon: AlertTriangle, label: 'Violations', onClick: () => navigate('/violations') }
        ];
      case 'resident':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', onClick: () => navigate('/resident-dashboard') }
        ];
      case 'visitor':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', onClick: () => navigate('/visitor-dashboard') }
        ];
      default:
        return [];
    }
  };

  return React.createElement(DropdownMenu, null,
    React.createElement(DropdownMenuTrigger, { asChild: true },
      React.createElement(Button, {
        variant: 'ghost',
        className: 'relative h-8 w-8 rounded-full'
      },
        React.createElement(Avatar, { className: 'h-8 w-8' },
          React.createElement(AvatarFallback, {
            className: 'bg-primary/10 text-primary'
          }, getInitials())
        )
      )
    ),
    React.createElement(DropdownMenuContent, {
      className: 'w-56',
      align: 'end',
      forceMount: true
    },
      React.createElement(DropdownMenuLabel, { className: 'font-normal' },
        React.createElement('div', { className: 'flex flex-col space-y-1' },
          React.createElement('p', {
            className: 'text-sm font-medium leading-none'
          }, user.name),
          React.createElement('p', {
            className: 'text-xs leading-none text-muted-foreground'
          }, getRoleDisplay())
        )
      ),
      React.createElement(DropdownMenuSeparator),
      // Role-specific menu items
      ...getRoleSpecificItems().map((item, index) => 
        React.createElement(DropdownMenuItem, {
          key: index,
          onClick: item.onClick
        },
          React.createElement(item.icon, { className: 'mr-2 h-4 w-4' }),
          React.createElement('span', null, item.label)
        )
      ),
      React.createElement(DropdownMenuSeparator),
      React.createElement(DropdownMenuItem, {
        onClick: () => navigate('/profile')
      },
        React.createElement(User, { className: 'mr-2 h-4 w-4' }),
        React.createElement('span', null, 'Profile')
      ),
      React.createElement(DropdownMenuSeparator),
      React.createElement(DropdownMenuItem, {
        onClick: handleLogout
      },
        React.createElement(LogOut, { className: 'mr-2 h-4 w-4' }),
        React.createElement('span', null, 'Log out')
      )
    )
  );
};

export default UserMenu;
