import { FaRegStickyNote } from "react-icons/fa";
import { GoDependabot, GoLaw } from "react-icons/go";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { MdMail, MdNotifications, MdOutlineGTranslate } from "react-icons/md";
import { PiFileAudio } from "react-icons/pi";
import { BiBot } from "react-icons/bi";
import { AiOutlineRobot } from "react-icons/ai";

const features = [
  {
    name: "Translate Document",
    path: "translate",
    url: "/home/translate",
  },
  {
    name: "Audio Transcription",
    path: "/home/audiotranscribe",
    url: "/home/audiotranscribe",
  },
  {
    name: "IPC to BNS",
    path: "/home/ipc-bns",
    url: "/home/ipc-bns",
  },
  {
    name: "Case Law Retrieval",
    path: "retrival",
    url: "/retrieval",
  },

  {
    name: "Document OCR",
    path: "ocr",
    url: "/home/ocr",
  },
  {
    name: "Chat Doc",
    path: "chat-doc",
    url: "/home/chat-doc",
  },
  // {
  //   name: "Draft",
  //   path: "draftbot",
  //   url: "/home/draftbot",
  // },
];

export const getFeatureCompoentIcon = (icon: string) => {
  const size = 16;
  switch (icon) {
    case "Translate Document":
      return <MdOutlineGTranslate size={size + 1} />;
    case "Audio Transcription":
      return <PiFileAudio size={size + 1} />;
    case "notifications":
      return <MdNotifications size={size} />;
    case "Ipc-bot":
      return <GoDependabot size={size} />;
    case "Case Law Retrieval":
      return <GoLaw size={size} />;
    case "Document OCR":
      return <FaRegStickyNote size={size} />;
    case "Gmail":
      return <MdMail size={size} />;
    case "Chat Doc":
      return <LiaFileInvoiceDollarSolid size={size} />;
    case "Draft":
      return <AiOutlineRobot size={size} />;
    case "IPC to BNS":
      return <BiBot size={size} />;
    default:
      return null;
  }
};

export default features;
