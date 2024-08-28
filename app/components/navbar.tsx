"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { LogOut, SquareUser } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RiMenu2Line } from "react-icons/ri";

import FeatureLink from "./featureLink";
import features from "../utils/features";
import NavItems from "../utils/navItems";
import MenuLink from "./menuLink";

const Navbar = () => {
  const [pathname, setpathname] = useState(usePathname());
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const router = useRouter();
  const path = usePathname()

  useEffect(()=>{
    setpathname(path)
  },[path])

//   const [userEmail, setuserEmail] = useState<any>("");
  const [userProfile, setUserProfile] = useState<any>("");
  const [loader, setloader] = useState<boolean>(true);

//   const [ProfileActive, setProfileActive] = useState<boolean>(false);
//   useEffect(() => {
//     const userDetails: any = localStorage.getItem("VotumUserDetails");
//     try {
//       const parsedUserDetails = JSON.parse(userDetails);

//       if (parsedUserDetails !== null && typeof parsedUserDetails === "object") {
//         if (parsedUserDetails.email) {
//           setuserEmail(parsedUserDetails.email);
//         }
//         if (parsedUserDetails.avatar_url) {
//           setUserProfile(parsedUserDetails.avatar_url);
//         }

//         setloader(false);

//         console.log("User ID:", parsedUserDetails.id);
//         console.log("User Name:", parsedUserDetails.name);

//         if (parsedUserDetails.isAdmin) {
//           console.log("User is an admin");
//         } else {
//           console.log("User is not an admin");
//         }
//       } else {
//         console.error("Invalid or empty parsedUserDetails");
//       }
//     } catch (error: any) {
//       console.error("Error parsing JSON:", error.message);
//     }
//     // console.log(parsedUserDetails);
//   }, []);



  return (
    // text-[#46494F]
 pathname && (pathname === '/' || pathname==="/invoices" || pathname==="/settings") && (
     <>
      <div className="base:hidden bl:flex flex-col relative w-[min(18%,280px)] h-[95%] bg-transparent  text-[#72727b]">
        <div
          className="mt-[-2px] w-full py-[13px] px-[16px] flex justify-between items-center border-b-[2px] border-dotted
         border-b-[#C5C6C8] "
        >
          {/* <img src="/images/VOTUM.png" width={100} /> */}
          <h1 className="font-bold leading-5 tracking-wide">Invoice Management System</h1>
        </div>
        {/* #edeef2 (new) ---------------- #eeefff (old) */}
        <div className="w-full navbarscrollOfHome h-[calc(100vh_-_157px)] pl-[13px] pr-[13px] flex flex-col mt-[4px] pt-[8px] gap-1 text-[#46494F] pb-[20px]">
          {NavItems.map((navitem:any, idx:number) => (
            <MenuLink key={idx} setSheetOpen={setSheetOpen} item={navitem} />
          ))}
          {/* {features.map((feature, idx: number) => (
            <FeatureLink key={idx} setSheetOpen={setSheetOpen} item={feature} />
          ))} */}
        </div>
        {/* <div className="absolute  bottom-[-1vh] flex justify-center items-center border-t-[1px] w-full px-[16px] py-[10px] bg-[#fbfbfb] z-[10]">
          <DropdownMenu open={ProfileActive} onOpenChange={setProfileActive}>
            <DropdownMenuTrigger asChild>
              <div
                onClick={(e) => setProfileActive(true)}
                className={`w-full py-[7px] pl-[4px] cursor-pointer rounded-[6px] flex gap-3 items-center  ${
                  ProfileActive === true
                    ? "bg-white border-[2px] shadow-sm"
                    : "bg-[#fbfbfb] hover:bg-[#f4f4f5]"
                }  `}
              >
                <SquareUser size={20} color="#636F7E" />
                <h2 className="flex items-center gap-3 text-[0.92rem] !font-[500]">
                  Account
                </h2>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" max-w-[400px] min-w-[min(16vw,370px)] border-[2px] bg-white z-[10] ">
              <DropdownMenuItem asChild>
                <SettingsComponenet />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-[16px] text-[0.9rem] py-[8px] px-[10px]"
              >
                <LogOut size={20} color="#344054" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>

      <div className="base:flex bl:hidden w-full py-[10px] h-[4rem] border-b-[2px]  flex justify-between items-center">
        <div className="px-[20px] py-[5px] flex justify-center items-center">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild onClick={(e: any) => setSheetOpen(true)}>
              <RiMenu2Line size={20} color="#6c7290" />
            </SheetTrigger>
            <SheetContent
              side={"left"}
              className="z-[100000] base:w-[85vw] md:w-[70vw] py-[30px] px-[20px] overflow-y-auto"
            >
              <div className="w-full flex">
                <div className="flex justify-center items-center gap-3 select-none">
                <h1 className="font-bold leading-5 tracking-wide">Invoice Management System</h1>
                </div>
              </div>
              <div className="w-full flex flex-col mt-[30px] gap-[4px]">
                {NavItems.map((navitem:any, idx:number) => (
                  <MenuLink
                    key={idx}
                    setSheetOpen={setSheetOpen}
                    item={navitem}
                  />
                ))}
                {/* {features.map((feature, idx: number) => (
                  <FeatureLink
                    key={idx}
                    setSheetOpen={setSheetOpen}
                    item={feature}
                  />
                ))} */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
 )
  );
};

export default Navbar;
