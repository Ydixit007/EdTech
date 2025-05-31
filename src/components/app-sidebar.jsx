"use client";
import * as React from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "MAIN MENU",
      items: [
        { title: "Home", url: "/home" },
        { title: "Courses", url: "/courses" },
        { title: "Sessions", url: "/sessions" },
      ],
    },
  ],
};

export function AppSidebar(props) {
  const pathname = usePathname();
  const logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
    alt: "logo",
    title: "EDTech",
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <a href={logo.url} className="flex items-center gap-2">
          <img src={logo.src} className="max-h-8" alt={logo.alt} />
          <span className="text-lg font-semibold tracking-tighter">
            {logo.title}
          </span>
        </a>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    (item.title === "Home" && pathname.includes("/home")) ||
                    (item.title === "Courses" &&
                      pathname.includes("/courses")) ||
                    (item.title === "Sessions" &&
                      pathname.includes("/sessions"));

                  return (
                    <SidebarMenuItem key={item.title}>
                      <Link
                        href={item.url}
                        className={clsx(
                          "block px-3 py-2 rounded-md transition-colors",
                          isActive
                            ? "bg-purple-200 text-purple-800"
                            : "hover:bg-purple-200"
                        )}
                      >
                        {item.title}
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
