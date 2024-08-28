"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getFeatureCompoentIcon } from "../utils/features";


const FeatureLink = ({ item, setSheetOpen }: { item: any; setSheetOpen: any }) => {
  const pathname = usePathname();
  const isActive = pathname?.includes(item.name);

  return (
    <>
      <Link
        href={`${item.url}`}
        onClick={(e) => setSheetOpen(false)}
        style={
          pathname
            ? pathname.includes(item.path) === true
              ? { backgroundColor: "#f4f4f5", color: "#18181b" }
              : { width: "100%", color: "#72727b" }
            : { width: "100%", color: "#72727b" }
        }
        className="capitalize pl-[8px] no-underline w-full py-[7px] cursor-pointer rounded-[6px] base:hidden bl:flex gap-3 items-center bg-transparent !hover:text-[#19191c] navitemsForhome"
      >
        {getFeatureCompoentIcon(item.name)}
        <h2 className="flex items-center gap-3 bl:text-[0.88rem] bbl:tex-[0.9rem] tracking-[0.3px] !font-[500]">
          {item.name}
        </h2>
      </Link>

      <Link
        href={`${item.url}`}
        onClick={(e) => setSheetOpen(false)}
        style={
          pathname
            ? pathname.includes(item.path) === true
              ? { backgroundColor: "#e8effe", color: "#5b89e9" }
              : { width: "100%", color: "#72727b" }
            : { width: "100%", color: "#72727b" }
        }
        className="capitalize no-underline w-full py-[10px] px-[10px] cursor-pointer rounded-[6px] base:flex bl:hidden gap-3 items-center bg-transparent navitemsForhome"
      >
        {getFeatureCompoentIcon(item.name)}
        <h2 className="flex items-center gap-3 text-[0.92rem] tracking-[0.3px] !font-[500]">
          {item.name}
        </h2>
      </Link>
    </>
  );
};
export default FeatureLink;
