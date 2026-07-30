import { Home, ShieldCheck, Newspaper, Settings } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader,
} from '@/components/ui/sidebar';

const NAV_ITEMS = [
  { key: 'home', label: 'Check a claim', icon: Home },
  { key: 'authority', label: 'Authority', icon: ShieldCheck },
  { key: 'news', label: 'News', icon: Newspaper },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar({ activePage, onNavigate }) {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="font-bold text-lg tracking-tight">Rumor Check</span>
        <span className="text-xs text-gray-500">Truth, verified.</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    isActive={activePage === key}
                    onClick={() => onNavigate(key)}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}