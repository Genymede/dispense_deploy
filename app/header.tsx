'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, UserPlus, User, LogOut, Package, Settings, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RoutineHeaderStatus from '@/components/routine/RoutineHeaderStatus';
import { fetchAppointments, fetchPatients } from '@/lib/api';
import { Appointment, PatientListItem } from '@/lib/types/type-all-form';
import { isUpcoming } from '@/lib/appointment-utils';
import { useAuth } from '@/hooks/useAuth';
import { useDateFormat } from '@/hooks/useDateFormat';
import { createClient } from '@/lib/supabase/client';

export default function Header({ onMobileMenuOpen }: { onMobileMenuOpen?: () => void }) {
  const router = useRouter();
  const { user: authUser, roleName } = useAuth();
  const { locale } = useDateFormat();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPatientNotifications, setShowPatientNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const patientDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadData = async () => {
    // Load Appointments
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }

    // Load Patients
    try {
      const data = await fetchPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setShowPatientNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = 'https://hpk-hms.site/login';
  };

  const todayStr = isMounted ? new Date().toLocaleDateString('en-CA') : ''; // YYYY-MM-DD format (Client-side only)
  
  const todayAppointments = appointments
    .filter(a => a.status !== 'cancelled' && a.status !== 'completed' && a.appointmentDate === todayStr)
    .sort((a, b) => {
      const timeA = a.appointmentTime || '00:00';
      const timeB = b.appointmentTime || '00:00';
      return timeA.localeCompare(timeB);
    });

  const recentNotifications = todayAppointments;

  const newPatients = patients
    .filter(p => p.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recentPatientNotifications = newPatients.slice(0, 10);

  const isGregorian = locale === 'th-TH-u-ca-gregory';

  const formatDateThai = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const displayYear = isGregorian ? parseInt(year) : parseInt(year) + 543;
    return `${day}/${month}/${displayYear}`;
  };

  const formatPatientDateTime = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = isGregorian ? d.getFullYear() : d.getFullYear() + 543;
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `ลงทะเบียน: ${day}/${month}/${year} เวลา ${hours}:${mins} น.`;
    } catch (e) {
      return '';
    }
  };

  return (
    <header className="h-16 sm:h-20 bg-[#005a50] flex items-center justify-between px-3 sm:px-6 z-50 shrink-0 text-white relative shadow-md">
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        {/* Mobile hamburger */}
        {onMobileMenuOpen && (
          <button
            onClick={onMobileMenuOpen}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            aria-label="เปิดเมนู"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 sm:space-x-4 cursor-pointer min-w-0" onClick={() => router.push('/')}>
        <div className="w-10 h-10 sm:w-16 sm:h-16 flex bg-white rounded-xl sm:rounded-[15px] items-center justify-center shrink-0 overflow-hidden shadow-sm">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu7nMhqiZLkgWSeS8Y1-Mbs0ILsrgt1S0HRA&s" alt="Hospital Logo" className="w-full h-full object-cover p-0.5 sm:p-1" />
        </div>
        <div className="hidden md:block min-w-0">
          <h2 className="font-bold text-lg lg:text-xl leading-tight py-0.5 truncate">โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม</h2>
          <p className="text-sm lg:text-base text-cyan-50 font-medium truncate">ระบบจัดการแผนกชีวาภิบาล (Palliative Care)</p>
        </div>
        <div className="block md:hidden min-w-0">
          <h2 className="font-bold text-sm leading-tight truncate">ชีวาภิบาล</h2>
          <p className="text-[10px] text-cyan-100 truncate">Palliative Care</p>
        </div>
        </div>{/* end brand/logo click area */}
      </div>{/* end left wrapper */}

      <div className="flex items-center gap-1.5 sm:space-x-4 shrink-0">
        {/* Patient Registration Notification */}
        <div className="relative" ref={patientDropdownRef}>
          <button
            suppressHydrationWarning
            onClick={() => {
              setShowPatientNotifications(!showPatientNotifications);
              setShowNotifications(false);
            }}
            className="relative p-1.5 sm:p-2 text-white hover:bg-[#004a42] rounded-full transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            {newPatients.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-[#005a50]"></span>
            )}
          </button>

          {showPatientNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-gray-800">
              <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm">ผู้ป่วยลงทะเบียนล่าสุด</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  {recentPatientNotifications.length} คน
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {recentPatientNotifications.length > 0 ? (
                  recentPatientNotifications.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 items-start"
                      onClick={() => {
                        setShowPatientNotifications(false);
                        router.push('/patient');
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {p.title?.name || ''}{p.firstname} {p.lastname}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">HN: {p.hn}</p>
                        <p className="text-xs text-blue-600 mt-1 line-clamp-1">{formatPatientDateTime(p.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">ไม่มีข้อมูลผู้ป่วยในระบบ</div>
                )}
              </div>
            </div>
          )}
        </div>



        {/* Appointment Notification */}
        <div className="relative" ref={dropdownRef}>
          <button
            suppressHydrationWarning
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowPatientNotifications(false);
            }}
            className="relative p-1.5 sm:p-2 text-white hover:bg-[#004a42] rounded-full transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {todayAppointments.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#005a50]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-gray-800">
              <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm">นัดหมายวันนี้</h3>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                  {todayAppointments.length} รายการ
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 items-start"
                      onClick={() => {
                        setShowNotifications(false);
                        router.push('/appointment?filter=today');
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{appt.patientName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDateThai(appt.appointmentDate)} เวลา {appt.appointmentTime ? `${appt.appointmentTime} น.` : '-'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">ไม่มีนัดหมายที่จะมาถึง</div>
                )}
              </div>
            </div>
          )}
        </div>

        <RoutineHeaderStatus />

        <div className="h-5 sm:h-6 w-px bg-white/20"></div>

        <div className="relative flex items-center gap-2 sm:gap-3 shrink-0" ref={userMenuRef}>
          <div className="hidden md:flex flex-col text-right w-[160px] shrink-0">
            <span className="text-sm font-bold text-white truncate">
              {authUser ? (authUser.user_metadata?.firstname_th || authUser.email) : 'ยังไม่ได้เข้าสู่ระบบ'}
            </span>
            <span className="text-[11px] text-cyan-100 font-medium leading-none mt-0.5">
              {authUser ? roleName : 'กรุณา Login'}
            </span>
          </div>
          <button
            suppressHydrationWarning
            onClick={() => { setShowUserMenu(v => !v); setShowNotifications(false); setShowPatientNotifications(false); }}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/20 text-white text-sm font-black overflow-hidden cursor-pointer transition-all active:scale-95 shrink-0 shadow-inner"
          >
            {authUser ? (authUser.user_metadata?.firstname_th?.substring(0, 2) || authUser.email?.substring(0, 2)) : <User className="w-5 h-5" />}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-[110%] w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 text-gray-800 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">บัญชีผู้ใช้</p>
                <p className="text-sm font-bold text-gray-800 truncate">
                  {authUser ? (authUser.user_metadata?.firstname_th || authUser.email) : 'Guest'}
                </p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button 
                  onClick={() => { router.push('/settings'); setShowUserMenu(false); }}
                  className="w-full text-left px-3.5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-500 group-hover:text-teal-600" />
                  </div>
                  ตั้งค่าระบบ
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}