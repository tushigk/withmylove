"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, BookHeart, MessageCircleHeart, Calendar, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

function NavItem({ icon: Icon, label, href, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-all duration-300",
        isActive ? "text-[var(--color-primary)] scale-110" : "text-[var(--color-secondary)]/60 hover:text-[var(--color-secondary)]"
      )}
    >
      <div className={cn(
        "p-2 rounded-2xl transition-all duration-500",
        isActive ? "bg-[var(--color-primary)]/10 shadow-[0_0_20px_rgba(224,169,165,0.3)]" : "bg-transparent"
      )}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-card rounded-3xl py-4 px-8 flex justify-between items-center z-50">
      <NavItem 
        icon={Heart} 
        label="Home" 
        href="/"
        isActive={pathname === '/'} 
      />
      <NavItem 
        icon={BookHeart} 
        label="Journal" 
        href="/journal"
        isActive={pathname === '/journal'} 
      />
      <NavItem 
        icon={Smile} 
        label="Mood" 
        href="/mood"
        isActive={pathname === '/mood'} 
      />
      <NavItem 
        icon={MessageCircleHeart} 
        label="Love" 
        href="/love"
        isActive={pathname === '/love'} 
      />
      <NavItem 
        icon={Calendar} 
        label="Dates" 
        href="/dates"
        isActive={pathname === '/dates'} 
      />
    </nav>
  );
}
