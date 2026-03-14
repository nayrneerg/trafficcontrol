'use client'

import { DateRangePicker } from '@/components/layout/date-range-picker'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, LogOut, Settings, User } from 'lucide-react'

export function Topbar() {
  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Organization Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span>Acme Agency</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Building2 className="w-4 h-4 mr-2" />
              Acme Agency
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Building2 className="w-4 h-4 mr-2" />
              Beta Corp
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Create new organization</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Picker */}
        <DateRangePicker />
      </div>

      <div className="flex items-center gap-3">
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              A
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>Acme Agency</span>
                <span className="text-xs font-normal text-slate-500">admin@acme.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
