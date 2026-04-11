'use client'
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { House, DoorOpen, Calendar } from "lucide-react";

const navItems = [
  { title: "Inicio", url: "/", icon: House },
  { title: "Salas", url: "/rooms", icon: DoorOpen, isActive: true },
  { title: "Reservas", url: "/reservas", icon: Calendar },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="sticky w-3xs" {...props}>
      <SidebarHeader>
        <div className="flex gap-3 items-center p-2">
          <Image
            src="/pfp.jpg"
            alt="Logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <div>
            <p className="font-semibold text-sm">Secretario John Doe</p>
            <p className="text-xs">Facultad de Ingeniería</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <a href={item.url} className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
