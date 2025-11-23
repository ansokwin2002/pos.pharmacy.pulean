"use client";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, X } from 'lucide-react'
import { Box, ScrollArea, Flex, IconButton, Spinner, Text } from "@radix-ui/themes";
import Image from "next/image";
import BrandLogo from "./BrandLogo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import clsx from 'clsx';
import {
  IconDot, IconDashboard, IconSales, IconUI, IconPages, IconMenuLevel, IconDocs,
  IconSupport, IconMenu, IconInventory, IconSettings, IconWaste, IconLoyalty, IconPurchasing, IconDrug
} from './MenuIcons';

// Define types for menu items
interface SubSubMenuItem {
  title: string;
  link: string;
  target?: string;
}

interface SubMenuItem {
  title: string;
  link?: string;
  icon?: React.ReactNode;
  subMenu?: SubSubMenuItem[];
  target?: string;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  link?: string;
  subMenu?: SubMenuItem[];
}

// 1. Create a MenuLink component for rendering links
const MenuLink = ({ 
  href, 
  isActive, 
  icon, 
  title, 
  className, 
  target, 
  level = 1,
  onClose,
  onLoadingStart
}: { 
  href: string; 
  isActive: boolean; 
  icon?: React.ReactNode; 
  title: string; 
  className?: string; 
  target?: string;
  level?: number;
  onClose?: () => void;
  onLoadingStart?: (title: string) => void;
}) => {
  const pathname = usePathname();
  const padding = level === 1 ? "px-4" : level === 2 ? "pl-6 pr-4" : "pl-12 pr-4";

  const handleClick = (e: React.MouseEvent) => {
    // Don't show loading if already on this page
    if (isActive || pathname === href || pathname.startsWith(href + '/')) {
      if (onClose) {
        onClose();
      }
      return;
    }
    
    // Only show loading for OPD and Drugs pages when navigating to a different page
    if (href.includes('/opd/') || href.includes('/drugs')) {
      if (onLoadingStart) {
        onLoadingStart(title);
      }
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center rounded-md transition-colors duration-200",
        level === 1 ? "py-2.5 gap-3 hover:bg-gray-100 dark:hover:bg-neutral-800" : level === 2 ? "py-2 gap-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800/50" : "py-1.5",
        padding,
        className
      )}
      target={target || undefined}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      onClick={handleClick}
    >
      {level === 1 ? (
        <span
          className="flex justify-center items-center size-8 bg-gray-100 rounded-sm text-gray-400 dark:text-neutral-600 dark:bg-neutral-800"
          style={isActive ? 
            {color: 'var(--accent-9)', backgroundColor: 'var(--accent-2)'} : {}
          }
        >
          {icon}
        </span>
      ): (
        <span
          className="flex justify-center items-center size-8 rounded-sm"
          style={isActive ? {color: 'var(--accent-9)'} : {color: 'var(--color-gray-400)'}}
        >
          <IconDot />
        </span>
      )}
      {level === 1 ? <span className="text-gray-500 font-semibold dark:text-neutral-400" style={isActive ? { color: 'var(--accent-9)' } : {}}>{title}</span>
       : <span className="text-gray-400 hover:text-gray-500 font-medium dark:text-neutral-400" style={isActive ? { color: 'var(--accent-9)' } : {}}>{title}</span>
      }
    </Link>
  );
};

// 2. Create a MenuButton component for accordion buttons
const MenuButton = ({ 
  title, 
  icon, 
  isOpen, 
  onClick, 
  level = 1 
}: { 
  title: string; 
  icon?: React.ReactNode; 
  isOpen: boolean; 
  onClick: () => void;
  level?: number;
}) => {
  const padding = level === 1 ? "px-4" : "pl-14 pr-4";

  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center w-full rounded-md transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-neutral-800",
        level === 1 ? "py-2.5 gap-3" : "py-2 gap-2.5",
        padding
      )}
    >
      {icon && <span className="flex justify-center items-center size-8 bg-gray-100 rounded-sm text-gray-400 dark:text-neutral-600 dark:bg-neutral-800">{icon}</span> }
      <span className="text-gray-500 font-semibold dark:text-neutral-400">{title}</span>
      <ChevronDown className={clsx("size-3 ml-auto transition-transform", isOpen ? 'rotate-180' : '')} />
    </button>
  );
};

// 3. Create an Accordion component for expandable content
const Accordion = ({ 
  isOpen, 
  children 
}: { 
  isOpen: boolean; 
  children: React.ReactNode;
}) => {
  return (
    <div 
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ 
        maxHeight: isOpen ? 'none' : '0px',
        opacity: isOpen ? 1 : 0
      }}
    >
      <div className="flex flex-col space-y-0.5 py-1">
        {children}
      </div>
    </div>
  );
};

const MenuGroup = ({ 
  title, 
  menuData, 
  openMenu, 
  setOpenMenu, 
  openSubMenu, 
  setOpenSubMenu, 
  isActive,
  isBottomGroup = false,
  allExternalLinks = false,
  onClose,
  onLoadingStart
}: { 
  title: string; 
  menuData: MenuItem[]; 
  openMenu: string | null; 
  setOpenMenu: (menu: string | null) => void; 
  openSubMenu: string | null; 
  setOpenSubMenu: (menu: string | null) => void; 
  isActive: (link: string) => boolean;
  isBottomGroup?: boolean;
  allExternalLinks?: boolean;
  onClose?: () => void;
  onLoadingStart?: (title: string) => void;
}) => {
  return (
    <Box mb={isBottomGroup ? undefined : "5"}>
      <div className="px-4 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider dark:text-neutral-600">{title}</div>
      <Flex direction="column" gap="0.5" className="text-[14px]">
        {menuData.map((menuItem, index) => (
          <Box key={index}>
            {menuItem.subMenu ? (
              <div className="relative">
                {/* Special case for Product Management - always show as single line */}
                {title === "Product Management" ? (
                  <div className="space-y-0.5">
                    {menuItem.subMenu.map((subItem, subIndex) => (
                      <MenuLink
                        key={subIndex}
                        href={subItem.link || "#"}
                        isActive={isActive(subItem.link || "")}
                        icon={menuItem.icon}
                        title={subItem.title}
                        level={1}
                        target={subItem.target || (allExternalLinks ? "_blank" : undefined)}
                        onClose={onClose}
                        onLoadingStart={onLoadingStart}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <MenuButton
                      title={menuItem.title}
                      icon={menuItem.icon}
                      isOpen={openMenu === menuItem.title}
                      onClick={() => setOpenMenu(openMenu === menuItem.title ? null : menuItem.title)}
                    />
                    <Accordion isOpen={openMenu === menuItem.title}>
                      {menuItem.subMenu.map((subItem, subIndex) => (
                        <div key={subIndex}>
                          {subItem.subMenu ? (
                            <>
                              <MenuButton
                                title={subItem.title}
                                isOpen={openSubMenu === subItem.title}
                                onClick={() => setOpenSubMenu(openSubMenu === subItem.title ? null : subItem.title)}
                                level={2}
                              />
                              <Accordion isOpen={openSubMenu === subItem.title}>
                                {subItem.subMenu.map((subSubItem, subSubIndex) => (
                                  <MenuLink
                                    key={subSubIndex}
                                    href={subSubItem.link}
                                    isActive={isActive(subSubItem.link)}
                                    title={subSubItem.title}
                                    level={3}
                                    target={allExternalLinks ? "_blank" : undefined}
                                    onClose={onClose}
                                    onLoadingStart={onLoadingStart}
                                  />
                                ))}
                              </Accordion>
                            </>
                          ) : (
                            <MenuLink
                              href={subItem.link || "#"}
                              isActive={isActive(subItem.link || "")}
                              icon={subItem.icon}
                              title={subItem.title}
                              level={2}
                              target={subItem.target || (allExternalLinks ? "_blank" : undefined)}
                              onClose={onClose}
                              onLoadingStart={onLoadingStart}
                            />
                          )}
                        </div>
                      ))}
                    </Accordion>
                  </>
                )}
              </div>
            ) : (
              <Box>
                <MenuLink
                  href={menuItem.link || "#"}
                  isActive={isActive(menuItem.link || "")}
                  icon={menuItem.icon}
                  title={menuItem.title}
                  target={allExternalLinks ? "_blank" : undefined}
                  onClose={onClose}
                  onLoadingStart={onLoadingStart}
                />
              </Box>
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

interface SidebarProps {
  width: string;
  onClose: () => void;
}

export default function Sidebar({ width, onClose }: SidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();

  // Reset loading state when pathname changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  // Application menu group
  const applicationMenuData: MenuItem[] = useMemo(() => [
    {
      title: "Dashboard",
      icon: <IconDashboard />,
      link: "#",
      subMenu: [
        { title: "HQ Dashboard", link: "/dashboard/hq-dashboard" },
        { title: "Branch Dashboard", link: "/dashboard/branch-dashboard" },
      ],
    },
    {
      title: "Sales",
      icon: <IconSales />,
      link: "#",
      subMenu: [
        { title: "POS, KDS, Checkout", link: "/sales/pos" },
        { title: "Live Orders", link: "/sales/live-orders" },
        { title: "Order History", link: "/sales/order-history" },
        { title: "Reports", link: "/sales/sales-reports" },
      ],
    },
    {
      title: "Menu Management",
      icon: <IconMenu />,
      link: "#",
      subMenu: [
        { title: "Menu", link: "/menu-management/menu" },
        { title: "Categories", link: "/menu-management/categories" },
        { title: "Pricing & Availability", link: "/menu-management/branch-pricing-availability" },
        { title: "Recipes", link: "/menu-management/recipes" },
      ],
    },
    {
      title: "Loyalty Program",
      icon: <IconLoyalty />,
      link: "#",
      subMenu: [
        { title: "Overview", link: "/loyalty-program/overview" },
        { title: "Members", link: "/loyalty-program/members" },
        { title: "Rewards", link: "/loyalty-program/rewards" },
        { title: "Settings", link: "/loyalty-program/settings" },
        { title: "Reports", link: "/loyalty-program/loyalty-reports" },
      ],
    },
    {
      title: "Inventory",
      icon: <IconInventory />,
      link: "/inventory",
      subMenu: [
        { title: "Stock Overview", link: "/inventory/stock-overview" },
        { title: "Ingredient Items", link: "/inventory/ingredient-items" },
        { title: "Stock Request", link: "/inventory/stock-request" },
        { title: "Stock Transfer Out", link: "/inventory/stock-transfer-out" },
        { title: "Stock Transfer In", link: "/inventory/stock-transfer-in" },
        { title: "Stock Transfer Logs", link: "/inventory/stock-transfer-logs" },
        { title: "Reports", link: "/inventory/inventory-reports" },
      ],
    },
    {
      title: "Waste Management",
      icon: <IconWaste />,
      link: "/waste-management",
      subMenu: [
        { title: "Overview", link: "/waste-management/overview" },
        { title: "Waste Logging", link: "/waste-management/waste-logging" },
        { title: "Reports", link: "/waste-management/wastage-reports" },
      ],
    },
    {
      title: "Purchasing",
      icon: <IconPurchasing />,
      link: "/purchasing",
      subMenu: [
        { title: "Purchase Orders", link: "/purchasing/purchase-orders" },
        { title: "Suppliers", link: "/purchasing/suppliers" },
        { title: "Reports", link: "/purchasing/purchasing-reports" },
      ],
    },
    {
      title: "Product Management",
      icon: <IconDrug />,
      link: "#",
      subMenu: [
        { title: "Drugs", link: "/drugs" },
      ],
    },
    {
      title: "Admin Settings",
      icon: <IconSettings />,
      link: "#",
      subMenu: [
        { title: "Organization", link: "/admin-settings/organization" },
        { title: "Users", link: "/admin-settings/users" },
        { title: "Roles & Permissions", link: "/admin-settings/roles-permissions" },
        { title: "POS & Devices", link: "/admin-settings/pos-devices" },
        { title: "Tax & Service Charges", link: "/admin-settings/tax-service-charges" },
        { title: "System Preferences", link: "/admin-settings/system-preferences" },
        { title: "Backup & Restore", link: "/admin-settings/backup-restore" },
        { title: "System Logs", link: "/admin-settings/system-logs" },
      ],
    },
  ], []);

  // OPD menu group
  const opdMenuData: MenuItem[] = useMemo(() => [
    {
      title: "OPD",
      icon: <IconPages />,
      link: "#",
      subMenu: [
        { title: "Patients", link: "/opd/patients" },
        { title: "All History OPD", link: "/opd/all-history" },
      ],
    },
  ], []);
  
  // UI & Pages menu group
  const uiPagesMenuData: MenuItem[] = useMemo(() => [
    {
      title: "UI Components",
      icon: <IconUI />,
      link: "/ui-components",
      subMenu: [
        { title: "Alert Dialog", link: "/ui-components/alert-dialog" },
        { title: "Avatar", link: "/ui-components/avatar" },
        { title: "Badge", link: "/ui-components/badge" },
        { title: "Button", link: "/ui-components/button" },
        { title: "Callout", link: "/ui-components/callout" },
        { title: "Card", link: "/ui-components/card" },
        { title: "Checkbox", link: "/ui-components/checkbox-element" },
        { title: "Checkbox Group", link: "/ui-components/checkbox-group" },
        { title: "Checkbox Cards", link: "/ui-components/checkbox-cards" },
        { title: "Data List", link: "/ui-components/data-list" },
        { title: "Dialog", link: "/ui-components/dialog" },
        { title: "Dropdown Menu", link: "/ui-components/dropdown-menu" },
        { title: "Hover Card", link: "/ui-components/hover-card" },
        { title: "Icon Button", link: "/ui-components/icon-button" },
        { title: "Popover", link: "/ui-components/popover" },
        { title: "Progress", link: "/ui-components/progress" },
        { title: "Radio", link: "/ui-components/radio-button" },
        { title: "Radio Group", link: "/ui-components/radio-group" },
        { title: "Radio Cards", link: "/ui-components/radio-cards" },
        { title: "Scroll Area", link: "/ui-components/scroll-area" },
        { title: "Segmented Control", link: "/ui-components/segmented-control" },
        { title: "Select", link: "/ui-components/select" },
        { title: "Separator", link: "/ui-components/separator" },
        { title: "Skeleton", link: "/ui-components/skeleton" },
        { title: "Slider", link: "/ui-components/slider" },
        { title: "Spinner", link: "/ui-components/spinner" },
        { title: "Switch", link: "/ui-components/switch" },
        { title: "Table", link: "/ui-components/table" },
        { title: "Tabs", link: "/ui-components/tabs" },
        { title: "TabNav", link: "/ui-components/tabnav" },
        { title: "TextArea", link: "/ui-components/textarea" },
        { title: "TextField", link: "/ui-components/textfield" },
        { title: "Tooltip", link: "/ui-components/tooltip" },
      ],
    },
    {
      title: "Pages",
      icon: <IconPages />,
      link: "#",
      subMenu: [
        { 
          title: "Login", 
          link: "/auth/login",
          target: "_blank" 
        },
        {
          title: "Forgot Password",
          link: "/auth/forgot-password",
          target: "_blank"
        },
        {
          title: "Reset Password",
          link: "/auth/reset-password?token=sample-token",
          target: "_blank"
        },
      ],
    },
    {
      title: "Three-Level Menu",
      icon: <IconMenuLevel />,
      subMenu: [
        {
          title: "Submenu Item 1",
          subMenu: [
            { title: "Submenu Item 1.1", link: "/submenu1/item1" },
            { title: "Submenu Item 1.2", link: "/submenu1/item2" },
          ],
        },
        { title: "Submenu Item 2", link: "/submenu2" },
      ],
    },
  ], []);

  // Documentation menu group
  const documentationMenuData: MenuItem[] = useMemo(() => [
    {
      title: "Documentation",
      icon: <IconDocs />,
      link: "/docs",
    },
    {
      title: "Support",
      icon: <IconSupport />,
      link: "http://eatlypos.com/support",
    },
  ], []);

  // Find active menu items based on current path and open parent menus
  useEffect(() => {
    let activeMainMenuTitle: string | null = null;
    let activeSubMenuTitle: string | null = null;
    let bestMatchFound = false;

    // Helper function to check activity, mirroring the logic used for styling
    const checkIsActive = (link: string): boolean => {
      if (!link || link === '#') return false;
      // Handle root path specifically
      if (link === '/') return pathname === link;
      // Check if current path starts with the link for other paths
      return pathname.startsWith(link);
    };

    // Combine both menu arrays for checking active items
    const allMenuData = [...applicationMenuData, ...opdMenuData, ...uiPagesMenuData, ...documentationMenuData];
    
    // Iterate through menu data to find the active item and its parents
    for (const item of allMenuData) {
      // Check level 3 first (most specific)
      if (item.subMenu) {
        for (const subItem of item.subMenu) {
          if (subItem.subMenu) {
            for (const subSubItem of subItem.subMenu) {
              if (checkIsActive(subSubItem.link)) {
                activeMainMenuTitle = item.title;
                activeSubMenuTitle = subItem.title;
                bestMatchFound = true;
                break; // Exit subSubItem loop
              }
            }
          }
          if (bestMatchFound) break; // Exit subItem loop

          // Check level 2 if no level 3 found in this subItem's children
          if (checkIsActive(subItem.link)) {
            activeMainMenuTitle = item.title;
            activeSubMenuTitle = null; // Only main menu needs to be open
            bestMatchFound = true;
            break; // Exit subItem loop
          }
        }
      }
      if (bestMatchFound) break; // Exit item loop

      // Check level 1 if no level 2/3 found in this item's children
      if (checkIsActive(item.link)) {
        activeMainMenuTitle = null; // Top-level link is active, no accordion needs to be open
        activeSubMenuTitle = null;
        bestMatchFound = true;
        break; // Exit item loop
      }
    }

    // Update the open states based on the found active item
    setOpenMenu(activeMainMenuTitle);
    setOpenSubMenu(activeSubMenuTitle);

  }, [pathname, applicationMenuData, opdMenuData, uiPagesMenuData, documentationMenuData]);


  // Helper function to check if a menu item link is active for styling
  const isActive = (link: string): boolean => {
    if (!link || link === '#') return false;
    // Handle the base case where link is '/' separately
    if (link === '/') {
      return pathname === link;
    }
    // Check if the current pathname starts with the link for nested routes
    return pathname.startsWith(link);
  };

  // Handler for loading state
  const handleLoadingStart = (title: string) => {
    setLoadingPage(title);
    setIsLoading(true);
  };

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-panel-solid)',
              padding: '40px 60px',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              textAlign: 'center',
              minWidth: '300px',
            }}
          >
            <Flex direction="column" gap="4" align="center">
              <Spinner size="3" />
              <Text size="5" weight="bold">
                Loading {loadingPage}...
              </Text>
              <Text size="2" style={{ color: 'var(--gray-11)' }}>
                Please wait
              </Text>
            </Flex>
          </div>
        </div>
      )}

      <Box
        position="fixed"
        top="0"
        className="border-r z-20"
        style={{
          backgroundColor: 'var(--color-panel-solid)',
          borderRightColor: 'var(--gray-3)',
          width: width
        }}
      >
      <Flex gap="3" justify="between" align="center" px="4" py="4">
        <Box>
          <Link href="/" aria-label="punleukrek">
            <BrandLogo size={22} showText={true} />
          </Link>
        </Box>
        <div className="lg:hidden">
          <IconButton variant="ghost" color="gray" onClick={onClose}>
            <X />
          </IconButton>
        </div>
      </Flex>
      <ScrollArea scrollbars="vertical" style={{height: 'calc(100vh - 64px)'}} className="pb-6">
        <Box className="flex flex-col px-2" style={{minHeight: "calc(100vh - 100px)"}}>
          <Box className="flex-1">
            {/* Dashboard (placed above OPD) */}
            <MenuGroup 
              title="Dashboard"
              menuData={[{ title: 'Dashboard', icon: <IconDashboard />, link: '/dashboard' }] as any}
              openMenu={openMenu} 
              setOpenMenu={setOpenMenu} 
              openSubMenu={openSubMenu} 
              setOpenSubMenu={setOpenSubMenu} 
              isActive={isActive}
              onClose={onClose}
              onLoadingStart={handleLoadingStart}
            />
            {/* OPD Menu Group (moved to top) */}
            <MenuGroup
              title="OPD"
              menuData={opdMenuData}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              openSubMenu={openSubMenu}
              setOpenSubMenu={setOpenSubMenu}
              isActive={isActive}
              onClose={onClose}
              onLoadingStart={handleLoadingStart}
            />

            {/* Product Management Menu Group */}
            <MenuGroup
              title="Product Management"
              menuData={[{
                title: "Product Management",
                icon: <IconDrug />,
                link: "#",
                subMenu: [
                  { title: "Drugs", link: "/drugs" },
                ],
              }]}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              openSubMenu={openSubMenu}
              setOpenSubMenu={setOpenSubMenu}
              isActive={isActive}
              onClose={onClose}
              onLoadingStart={handleLoadingStart}
            />

            {/* Application Menu Group - hidden per request */}
            {/* (Removed rendering of Application menu) */}

            {/* UI & Pages Menu Group - hidden per request to keep only OPD */}
            {/* (Removed rendering of UI & Pages group) */}
          </Box>

          {/* Resources Menu Group removed per request (keep only top OPD) */}
        </Box>
      </ScrollArea>
      </Box>
    </>
  );
}
