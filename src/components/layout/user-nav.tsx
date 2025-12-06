// src/components/layout/user-nav.tsx
"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import {
  LogOut,
  User as UserIcon,
  ListOrdered,
  LayoutDashboard,
  Heart,
  Bell,
} from "lucide-react"; // Added icons including Heart for favorites and Bell for notifications

interface UserNavProps {
  user: User;
  onLogout: () => void; // Prop to handle logout logic
}

import { useNotifications } from "@/context/NotificationsContext";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export function UserNav({ user, onLogout }: UserNavProps) {
  const { toast } = useToast();
  const { unreadCountForCurrentUser } = useNotifications();
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        // Ideally a dedicated endpoint /api/messages/unread-count
        // For now, list conversations and count client side or use the existing list endpoint
        // Optimization for later: dedicated endpoint
        const res = await axios.get("/api/conversations", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const convs = res.data;
        let count = 0;
        convs.forEach((c: any) => {
          // Check if last message is unread and not from me
          // This logic is imperfect vs checking ALL messages, but assumes last message is indicator
          // Better: API should return unread count
          // We'll rely on the conversations endpoint returning latest message properties if we modified it to be smart
          // The current API structure might need enhancement for accurate global count.
          // Let's assume the conversations list has what we need
          const lastMsg = c.messages?.[0];
          if (lastMsg && !lastMsg.isRead && lastMsg.senderId !== Number(user.id)) {
            count++;
          }
        });
        setUnreadMsgCount(count);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleLogoutClick = () => {
    onLogout(); // Call the passed logout handler from AuthContext via Layout
    toast({
      title: "Sesión Cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 border">
            {" "}
            {/* Added border */}
            <AvatarImage
              src={
                user.avatarUrl ||
                `https://avatar.vercel.sh/${user.email}.png?size=32`
              }
              alt={user.name}
            />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || "Usuario"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
              Rol: {user.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        {/* Conditionally render based on role */}
        {user.role === "vendedor" ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/vendedor">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Mis Publicaciones</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/orders/history">
                <ListOrdered className="mr-2 h-4 w-4" />
                <span>Mis Pedidos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/favorites">
                <Heart className="mr-2 h-4 w-4" />
                <span>Favoritos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notificaciones{unreadCountForCurrentUser > 0 ? ` (${unreadCountForCurrentUser})` : ""}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/messages">
                <Bell className="mr-2 h-4 w-4" /> {/* Reusing Bell icon for now or use MessageSquare */}
                <span>Mensajes</span>
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          // Link to buyer order history
          <>
            <DropdownMenuItem asChild>
              <Link href="/orders/history">
                <ListOrdered className="mr-2 h-4 w-4" />
                <span>Mis Pedidos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/favorites">
                <Heart className="mr-2 h-4 w-4" />
                <span>Favoritos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/messages" className="flex justify-between items-center">
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Mensajes</span>
                </div>
                {unreadMsgCount > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    {unreadMsgCount}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogoutClick}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
