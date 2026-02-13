'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  LayoutDashboard,
  LogOut,
  User,
  Bell,
  Award,
  BookOpen,
  Settings,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/use-auth';
import { useNotificationStore } from '@/lib/stores/use-notification';
import { useEffect } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { unreadCount, getUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      getUnreadCount(user.id);
      const interval = setInterval(() => getUnreadCount(user.id), 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navItems = [
    { href: '/', label: 'Browse', icon: Search },
    { href: '/classroom-finder', label: 'Classrooms', icon: BookOpen },
    { href: '/leaderboard', label: 'Leaderboard', icon: Award },
  ];

  const userMenuItems = [
    { href: '/profile', label: 'My Profile', icon: User },
    { href: '/post-item', label: 'Report Item', icon: Plus },
    { href: '/my-claims', label: 'My Claims', icon: MessageSquare },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/dashboard', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Search className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hidden sm:inline">
              CampusFind
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={pathname === item.href ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Notifications Bell */}
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <DropdownMenuItem className="cursor-pointer">
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                          {item.label === 'Notifications' && unreadCount > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {unreadCount}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                      </Link>
                    );
                  })}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
