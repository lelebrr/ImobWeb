'use client';

import React from 'react';
import { Search, Bell, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { CommandMenu } from '@/components/ui/command-menu';

interface TopbarProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  onQuickAction?: () => void;
}

export function Topbar({ user, onQuickAction }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
      
      {/* Search Section */}
      <div className="flex flex-1 items-center gap-4">
        <div className="w-full max-w-md hidden md:flex">
          <CommandMenu />
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <Button 
          variant="default" 
          size="sm" 
          className="hidden sm:flex"
          onClick={onQuickAction}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          <span className="sr-only">Notificações</span>
        </Button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              Configurações da Conta
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Atalhos de Teclado
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
