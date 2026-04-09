"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getIconComponent } from "./dynamicRenderIcons";

const MenuLink = ({ item, setSheetOpen }: { item: any; setSheetOpen: any }) => {
  const pathname = usePathname();
  const isActive =
    item.name === "home"
      ? pathname === "/"
      : item.name === "users"
      ? pathname === "/settings/users"
      : pathname === `/${item.name}` || pathname?.startsWith(`/${item.name}/`);

  function formatLabel(str: string): string {
    return str.replace(/-/g, " ");
  }

  const baseClass =
    "capitalize no-underline w-full py-2 px-3 cursor-pointer rounded-lg flex gap-3 items-center transition-colors text-sm font-medium";

  const activeClass =
    "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400";

  const inactiveClass =
    "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100";

  return (
    <Link
      href={item.name === "home" ? "/" : item.name === "users" ? "/settings/users" : `/${item.name}`}
      onClick={() => setSheetOpen(false)}
      className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
    >
      {getIconComponent(item.name)}
      <span className="tracking-[0.2px] mt-[2px]">{formatLabel(item.name)}</span>
    </Link>
  );
};

export default MenuLink;
