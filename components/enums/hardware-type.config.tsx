import { SvgIconProps } from "@mui/material";
import LaptopIcon from "@mui/icons-material/Laptop";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import MonitorIcon from "@mui/icons-material/Monitor";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import MouseIcon from "@mui/icons-material/Mouse";
import DockIcon from "@mui/icons-material/Dock";
import PrintIcon from "@mui/icons-material/Print";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TabletIcon from "@mui/icons-material/Tablet";
import DnsIcon from "@mui/icons-material/Dns";
import { ComponentType } from "react";
import { HardwareType } from "@/lib/validators/enums.schema";

type HardwareTypeConfig = {
  label: string;
  icon: ComponentType<SvgIconProps>;
  color: string;
};

export const HARDWARE_TYPE_CONFIG = {
  LAPTOP: { label: "Laptop", icon: LaptopIcon, color: "text.primary" },
  DESKTOP: { label: "Desktop", icon: DesktopWindowsIcon, color: "text.primary" },
  MONITOR: { label: "Monitor", icon: MonitorIcon, color: "text.primary" },
  KEYBOARD: { label: "Tastiera", icon: KeyboardIcon, color: "text.primary" },
  MOUSE: { label: "Mouse", icon: MouseIcon, color: "text.primary" },
  DOCKING_STATION: { label: "Docking station", icon: DockIcon, color: "text.primary" },
  PRINTER: { label: "Stampante", icon: PrintIcon, color: "text.primary" },
  SMARTPHONE: { label: "Smartphone", icon: SmartphoneIcon, color: "text.primary" },
  TABLET: { label: "Tablet", icon: TabletIcon, color: "text.primary" },
  SERVER: { label: "Server", icon: DnsIcon, color: "text.primary" },
} satisfies Record<HardwareType, HardwareTypeConfig>;