"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { RiMenu2Line } from "react-icons/ri";
import { LuSun, LuMoon } from "react-icons/lu";
import { useTheme } from "next-themes";
import NavItems, { NavItem } from "../utils/navItems";
import MenuLink from "./menuLink";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const path = usePathname();
  const { logout, isSuperAdmin, profile } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const showNav =
    path &&
    (path === "/" ||
      path === "/invoices" ||
      path === "/analytics" ||
      path.includes("/settings"));

  if (!showNav) return null;

  const visibleItems = NavItems.filter(
    (item: NavItem) => !item.superAdminOnly || isSuperAdmin
  );

  const ThemeToggle = () => (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
      aria-label="Toggle theme"
    >
      {mounted && (theme === "dark" ? <LuSun size={16} /> : <LuMoon size={16} />)}
    </button>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="base:hidden bl:flex flex-col w-[220px] shrink-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white leading-tight">
              Invoice Management
            </h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">IVS</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {visibleItems.map((navitem: NavItem, idx: number) => (
            <MenuLink key={idx} setSheetOpen={setSheetOpen} item={navitem} />
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          {profile && (
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {profile.full_name || profile.email}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{profile.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full py-2 px-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile topbar */}
      <div className="base:flex bl:hidden w-full h-14 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 justify-between items-center px-4">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild onClick={() => setSheetOpen(true)}>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <RiMenu2Line size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="base:w-[80vw] md:w-[60vw] py-6 px-4 overflow-y-auto bg-white dark:bg-gray-900 flex flex-col"
          >
            <div className="mb-5">
              <h1 className="font-bold text-base tracking-tight text-gray-900 dark:text-white">Invoice Management</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Ambit IVS</p>
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              {visibleItems.map((navitem: NavItem, idx: number) => (
                <MenuLink key={idx} setSheetOpen={setSheetOpen} item={navitem} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              {profile && (
                <p className="text-xs text-gray-400 mb-2 truncate px-3">{profile.email}</p>
              )}
              <button
                onClick={logout}
                className="w-full py-2 px-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
              >
                Sign out
              </button>
            </div>
          </SheetContent>
        </Sheet>

        <span className="font-semibold text-sm text-gray-800 dark:text-white">Invoice Management</span>
        <ThemeToggle />
      </div>
    </>
  );
};

export default Navbar;
