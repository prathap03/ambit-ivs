import { SlCalender } from "react-icons/sl";
import { LuHome } from "react-icons/lu";
import { IoBriefcaseOutline } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { FiSettings, FiUsers } from "react-icons/fi";
import { GoTasklist } from "react-icons/go";
import { FaRegStickyNote } from "react-icons/fa";
import { LuFileCheck2 } from "react-icons/lu";
import { MdDrafts, MdMail, MdNotifications } from "react-icons/md";

const data = [
  {
    name: "home",
    icon: LuHome,
  },
  // Hide until further planning
  // {
  //   name:"notifications",
  //   icon: MdMail,
  // },
  // {
  //   name: "cases",
  //   icon: IoBriefcaseOutline,
  // },
  // {
  //   name: "calendar",
  //   icon: SlCalender,
  // },
  // {
  //   name: "mail",
  //   icon: MdMail,
  // },
  // {
  //   name: "drafts",
  //   icon: MdDrafts,
  // },
  // {
  //   name: "tasks",
  //   icon: GoTasklist,
  // },
  // {
  //   name: "reports",
  //   icon: TbReportAnalytics,
  // },
  // {
  //   name: "reviews",
  //   icon: LuFileCheck2,
  // },
  // {
  //   name: "notes",
  //   icon: FaRegStickyNote,
  // },
  {
    name: "invoices",
    icon: LiaFileInvoiceDollarSolid,
  },
  {
    name: "settings",
    icon: FiSettings,
  }
];
export default data;
