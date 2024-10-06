import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  ClipboardList,
  Folder
} from "lucide-react";
import { usePathname } from "next/navigation";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  const pathName = usePathname();
  const projectId = pathName.split("/")[pathName.split("/").length - 1]

  if(projectId == "" || projectId == 'dashboard') {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/dashboard",
            label: "Dashboard",
            active: pathname.includes("/dashboard"),
            icon: LayoutGrid,
            submenus: []
          }
        ]
      },
      {
        groupLabel: "Contents",
        menus: [
          {
            href: "/",
            label: "Projects",
            active: pathname == '/',
            icon: SquarePen,
          },
        ]
      },
    ];
  }
  

  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "/",
          label: "Projects",
          active: pathname == '/',
          icon: Folder
        },
        {
          href: `/projects/${projectId}`,
          label: "Templates",
          active: pathname.includes("/projects") && !pathname.includes("/task"),
          icon: SquarePen
        },
        {
          href: `/projects/task/${projectId}`,
          label: "Tasks",
          active: pathname.includes("/task"),
          icon: ClipboardList
        }
      ]
    },
  ];
}
