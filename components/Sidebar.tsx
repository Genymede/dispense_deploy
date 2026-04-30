"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package, Truck, Pill, Bell, Settings, ChevronRight,
  BarChart3, BookOpen, ChevronDown,
  Database, ShieldAlert, FlaskConical, Repeat2,
  Stethoscope, ClipboardList, Clock, FileText,
  AlertTriangle, FileWarning,
  LayoutDashboard, ArrowDownToLine, Activity, Tag,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

interface NavItem { href: string; label: string; icon: React.ElementType; }
interface NavGroup { label: string; icon: React.ElementType; basePath: string; items: NavItem[]; }

const warehouseGroup: NavGroup = {
  label: "คลังยาย่อย", icon: Pill,
  basePath: "/___none___", // ไม่มี basePath เดียว ตรวจ active แยก
  items: [
    { href: "/dashboard", label: "ภาพรวม", icon: LayoutDashboard },
    { href: "/drugs", label: "รายการยาในคลัง", icon: Pill },
    { href: "/stock-in", label: "รับยาเข้าคลัง", icon: ArrowDownToLine },
  ],
};

const registryGroup: NavGroup = {
  label: "ทะเบียน", icon: BookOpen, basePath: "/registry",
  items: [
    { href: "/registry", label: "ทะเบียนยาหลัก", icon: Database },
    { href: "/registry/allergy", label: "การแพ้ยา", icon: ShieldAlert },
    { href: "/registry/adr", label: "ADR", icon: FlaskConical },
    { href: "/registry/med-interactions", label: "ปฏิกิริยายา", icon: Repeat2 },
    { href: "/registry/med-usage", label: "ประวัติใช้ยา", icon: Stethoscope },
    { href: "/registry/dispense-history", label: "ประวัติจ่ายยา", icon: ClipboardList },
    { href: "/registry/delivery", label: "การจัดส่งยา", icon: Truck },
    { href: "/registry/overdue", label: "ยาค้างจ่าย", icon: Clock },
    { href: "/registry/rad", label: "RAD Registry", icon: FileWarning },
    { href: "/registry/med-problem", label: "ปัญหาการใช้ยา", icon: AlertTriangle },
    { href: "/registry/med-movement", label: "การเคลื่อนไหวยา", icon: Activity },
  ],
};

const reportsGroup: NavGroup = {
  label: "รายงาน", icon: BarChart3, basePath: "/___none___",
  items: [
    { href: "/reports/expiry", label: "ยาหมดอายุ / สต็อกต่ำ", icon: AlertTriangle },
    { href: "/reports/med-table", label: "ทะเบียนยาหลัก", icon: BookOpen },
    { href: "/reports/med-subwarehouse", label: "ยาคงคลัง", icon: Database },

    { href: "/reports/med-order-history", label: "ประวัติการจ่ายยา", icon: ClipboardList },
    { href: "/reports/med-usage-history", label: "ประวัติใช้ยา", icon: Stethoscope },
    { href: "/reports/allergy-registry", label: "การแพ้ยา", icon: ShieldAlert },
    { href: "/reports/adr-registry", label: "อาการไม่พึงประสงค์จากยา", icon: FlaskConical },
    { href: "/reports/med-interaction", label: "ปฏิกิริยาของยา", icon: Repeat2 },
    { href: "/reports/med-problem", label: "ปัญหาการใช้ยา", icon: AlertTriangle },
    { href: "/reports/med-delivery", label: "การจัดส่งยา", icon: Truck },
    { href: "/reports/overdue-med", label: "ยาค้างจ่าย", icon: Clock },
    { href: "/reports/rad-registry", label: "ยาปฏิชีวนะควบคุม", icon: FileText },
    { href: "/transactions", label: "ประวัติเคลื่อนไหวยา", icon: Activity },
  ],
};

function CollapseGroup({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const isActive = group.basePath !== "/___none___"
    ? pathname.startsWith(group.basePath)
    : group.items.some(i => pathname === i.href || pathname.startsWith(i.href + '/'));
  const [open, setOpen] = useState(isActive);
  const Icon = group.icon;

  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className={clsx(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
          isActive ? "bg-white/15 text-white font-semibold" : "text-blue-100/80 hover:bg-white/10 hover:text-white"
        )}
      >
        <Icon size={16} className={isActive ? "text-blue-200" : "text-blue-300/60"} />
        <span className="flex-1 text-left text-[13px]">{group.label}</span>
        <ChevronDown size={12} className={clsx("text-blue-300/50 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="ml-3.5 mt-0.5 border-l border-white/10 pl-2.5 space-y-0.5">
          {group.items.map(({ href, label, icon: ItemIcon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={clsx(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all",
                  active ? "bg-white/15 text-white font-semibold" : "text-blue-100/60 hover:bg-white/8 hover:text-blue-100"
                )}
              >
                <ItemIcon size={13} className={active ? "text-blue-200" : "text-blue-300/40"} />
                <span className="flex-1">{label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavLink({ href, label, icon: Icon, badge }: NavItem & { badge?: number }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href}
      className={clsx(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all group",
        active ? "bg-white/15 text-white font-semibold" : "text-blue-100/80 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon size={16} className={active ? "text-blue-200" : "text-blue-300/60 group-hover:text-blue-200"} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
          <span className="relative min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {badge > 99 ? "99+" : badge}
          </span>
        </span>
      )}
      {active && <ChevronRight size={13} className="text-blue-300/60" />}
    </Link>
  );
}

export default function Sidebar({ alertCount = 0 }: { alertCount?: number }) {
  return (
    <nav className="p-2.5 space-y-0.5">
      <NavLink href="/dispense" label="จ่ายยา" icon={Package} />
      <NavLink href="/delivery" label="จัดส่งยา" icon={Truck} />
      <div className="pt-2 pb-0.5 px-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-blue-300/40">ทะเบียน & รายงาน</p>
      </div>
      <CollapseGroup group={registryGroup} />
      <CollapseGroup group={reportsGroup} />
      <div className="pt-2 pb-0.5 px-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-blue-300/40">คลังยา</p>
      </div>
      <CollapseGroup group={warehouseGroup} />
      <div className="pt-2 pb-0.5 px-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-blue-300/40">อื่นๆ</p>
      </div>
      <NavLink href="/sticker" label="สติ๊กเกอร์ยา" icon={Tag} />
      <NavLink href="/alerts" label="แจ้งเตือน" icon={Bell} badge={alertCount} />
      <NavLink href="/settings" label="ตั้งค่า" icon={Settings} />
    </nav>
  );
}
