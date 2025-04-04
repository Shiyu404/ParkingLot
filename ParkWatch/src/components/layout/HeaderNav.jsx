
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const HeaderNav = () => {
  const { user } = useAuth();

  // Different navigation links based on user role
  const getNavLinks = () => {
    // Default/public links
    const links = [
      { to: '/', label: 'Home' },
    ];

    // Add role-specific links
    if (user) {
      switch (user.role) {
        case 'admin':
          links.push(
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/visitors', label: 'Visitors' },
            { to: '/vehicles', label: 'Vehicles' },
            { to: '/violations', label: 'Violations' }
          );
          break;
        case 'resident':
          links.push(
            { to: '/resident-dashboard', label: 'Dashboard' }
          );
          break;
        case 'visitor':
          links.push(
            { to: '/visitor-dashboard', label: 'Dashboard' }
          );
          break;
        default:
          break;
      }
    }

    return links;
  };

  return (
    <nav className="flex">
      {getNavLinks().map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default HeaderNav;
