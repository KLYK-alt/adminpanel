import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutDashboard, Users, Star, Building, BookOpen, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define navigation items
const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Blog Posts', path: '/blogs', icon: BookOpen },
  { name: 'Team', path: '/team', icon: Users },
  { name: 'Testimonials', path: '/testimonials', icon: Star },
  { name: 'Partners', path: '/partners', icon: Building },
  { name: 'Training Updates', path: '/trainings', icon: Calendar },
  { name: 'User Contacts', path: '/contacts', icon: MessageSquare },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();

  // Toggle sidebar function
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside
      className={cn(
        'h-screen bg-admin-secondary text-white flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && <h1 className="text-lg font-bold">EV Admin</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-white hover:bg-slate-700"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-700">
        {!collapsed ? (
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.role}</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-admin-primary flex items-center justify-center">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-4 py-2 transition-colors',
                    isActive
                      ? 'bg-admin-accent text-white'
                      : 'text-slate-300 hover:bg-slate-700',
                    collapsed ? 'justify-center' : 'space-x-3'
                  )
                }
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="destructive"
          onClick={logout}
          className={cn('w-full', collapsed && 'p-2')}
        >
          {!collapsed ? 'Logout' : 'X'}
        </Button>
      </div>
    </aside>
  );
}
