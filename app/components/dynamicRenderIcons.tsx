import { FaRegStickyNote } from "react-icons/fa";
import { FiSettings, FiUsers } from "react-icons/fi";
import { GoTasklist } from "react-icons/go";
import { IoBriefcaseOutline } from "react-icons/io5";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { LuHome } from "react-icons/lu";
import { SlCalender } from "react-icons/sl";
import { LuFileCheck2 } from "react-icons/lu";
import { TbReportAnalytics } from "react-icons/tb";
import { FaRegClock, FaRegUser } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { LuLoader } from "react-icons/lu";
import { MdDrafts, MdOutlineStackedLineChart, MdMail, MdNotifications } from "react-icons/md";

export const  getIconComponent = (icon: string) => {
  const size = 15;
  switch (icon) {
    case "home":
      return <LuHome size={size} />;
    case "cases":
      return <IoBriefcaseOutline size={size} />;
    case "calendar":
      return <SlCalender size={size} />;
    case "drafts":
      return <MdDrafts />;
    case "mail":
      return <MdMail />;
    case "notifications":
      return <MdNotifications />;
    case "tasks":
      return <GoTasklist size={size + 2} />;
    case "reports":
      return <TbReportAnalytics size={size} />;
    case "notes":
      return <FaRegStickyNote size={size} />;
    case "invoices":
      return <LiaFileInvoiceDollarSolid size={size} />;
    case "clients":
      return <FiUsers size={size} />;
    case "settings":
      return <FiSettings size={size} />;
    case "reviews":
      return <LuFileCheck2 size={size} />;
    // Add cases for other icons
    default:
      return null; // or some default icon component
  }
};

export const addTaskComponent = (icon: string) => {
  const size = 15;
  switch (icon) {
    case "date-created":
      return <FaRegClock size={size} />;
    case "status":
      return <LuLoader size={size} />;
    case "date":
      return <IoCalendarOutline size={size} />;
    case "priority":
      return <MdOutlineStackedLineChart size={size} />;
    case "Assignee":
      return <FaRegUser size={size} />;
    case "Approver":
      return <FaRegUser size={size} />;
    case "Linked Client":
      return <FaRegUser size={size} />;
    default:
      return null;
  }
};
