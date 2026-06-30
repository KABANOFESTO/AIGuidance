"use client"
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, Bell, CheckCheck } from 'lucide-react'
import { useCurrentUserQuery } from "@/lib/redux/slices/AuthSlice";
import { useGetNotificationsQuery, useGetUnreadNotificationCountQuery, useMarkAllNotificationsReadMutation } from "@/lib/redux/slices/NotificationSlice";


interface NavbarProps {
    onSearch: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
    const router = useRouter();
    const { data: sessionData } = useSession()
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const hasAccessToken = typeof window !== "undefined" && Boolean(localStorage.getItem("access"));
    const { data: userDetails, isLoading, error, refetch } = useCurrentUserQuery(undefined, {
        skip: !hasAccessToken,
    });
    const { data: notifications = [] } = useGetNotificationsQuery(undefined, { skip: !hasAccessToken });
    const { data: unreadData } = useGetUnreadNotificationCountQuery(undefined, { skip: !hasAccessToken });
    const [markAllRead] = useMarkAllNotificationsReadMutation();
    const [showNotifications, setShowNotifications] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, onSearch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const getProfileImageUrl = () => {
        if (userDetails?.profile_picture) {
            if (userDetails.profile_picture.startsWith('/media/')) {
                return `http://127.0.0.1:8000${userDetails.profile_picture}`;
            }
            if (userDetails.profile_picture.startsWith('http')) {
                return userDetails.profile_picture;
            }
            return userDetails.profile_picture.startsWith('/') ? userDetails.profile_picture : `/${userDetails.profile_picture}`;
        }
        return "/profile.png";
    };

    const getUserInitials = () => {
        if (userDetails?.username) {
            const names = userDetails.username.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return userDetails.username.substring(0, 2).toUpperCase();
        }
        return "SM";
    };

    // First word of the username (e.g. "Dr.") shown as the top line in the trigger
    const getFirstNamePart = () => {
        if (userDetails?.username) {
            return userDetails.username.split(' ')[0];
        }
        return "Dr.";
    };

    const handleProfileClick = () => {
        setShowUserDropdown(!showUserDropdown);
        if (!showUserDropdown) {
            refetch();
        }
    };

    const toggleNotifications = () => setShowNotifications((v) => !v);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.user-dropdown-container')) {
                setShowUserDropdown(false);
            }
            if (!target.closest('.notification-dropdown-container')) {
                setShowNotifications(false);
            }
        };

        if (showUserDropdown || showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserDropdown, showNotifications]);

    return (
        <div className='w-full flex flex-row items-center bg-white px-6 py-3 justify-between border-b border-gray-100'>

            {/* Search */}
            <div className='flex-1 max-w-xs'>
                <div className='flex flex-row items-center px-3 py-2 bg-[#F9FAFB] border border-gray-200 rounded-lg w-full'>
                    <Search size={16} className='text-gray-400 shrink-0' />
                    <input
                        type="text"
                        placeholder='Search...'
                        className='bg-transparent outline-none border-none w-full px-2 text-sm text-gray-600 placeholder-gray-400'
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4 items-center'>

                {/* Notification bell */}
                <div className='relative notification-dropdown-container'>
                    <button
                        type="button"
                        onClick={toggleNotifications}
                        className='relative p-2 cursor-pointer rounded-full bg-[#F0F2F5] flex items-center justify-center'
                        aria-label="View notifications"
                    >
                        <Bell size={18} className="text-gray-600" />
                        {unreadData?.unread_count ? (
                            <span className="absolute -top-0.5 -right-0.5 min-w-5 rounded-full bg-red-500 px-1 text-[10px] font-bold leading-5 text-white">
                                {unreadData.unread_count}
                            </span>
                        ) : null}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Notifications</p>
                                    <p className="text-xs text-gray-400">{unreadData?.unread_count ?? 0} unread</p>
                                </div>
                                <button
                                    onClick={() => markAllRead()}
                                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                                >
                                    <CheckCheck size={13} />
                                    Mark all read
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length ? notifications.map((item: any) => (
                                    <div key={item.id} className={`border-b border-gray-50 px-4 py-3 ${item.is_read ? 'bg-white' : 'bg-sky-50/40'}`}>
                                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                        <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                                    </div>
                                )) : (
                                    <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User trigger + dropdown */}
                <div className='relative user-dropdown-container'>
                    <button
                        onClick={handleProfileClick}
                        className='flex items-center gap-2'
                    >
                        <div className='flex items-center justify-center overflow-hidden rounded-full bg-violet-600 text-white w-9 h-9 shrink-0'>
                            {userDetails ? (
                                userDetails.profile_picture ? (
                                    <Image
                                        src={getProfileImageUrl()}
                                        alt={`${userDetails.username}'s profile`}
                                        className='object-cover w-full h-full rounded-full'
                                        width={36}
                                        height={36}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "/profile.png";
                                        }}
                                    />
                                ) : (
                                    <span className="text-sm font-semibold">{getUserInitials()}</span>
                                )
                            ) : sessionData?.user ? (
                                <Image
                                    src={sessionData?.user?.image || '/profile.png'}
                                    alt='profile'
                                    width={36}
                                    height={36}
                                    className='object-cover'
                                />
                            ) : (
                                <span className="text-sm font-semibold">SM</span>
                            )}
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-bold leading-tight text-gray-900">{getFirstNamePart()}</p>
                            <p className="text-xs leading-tight text-gray-400">
                                {userDetails?.role ?? 'Admin'}
                            </p>
                        </div>

                        <ChevronDown
                            size={15}
                            className={`text-gray-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {showUserDropdown && (
                        <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px] z-50">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
                                    <span className="ml-2 text-sm text-gray-500">Loading...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-4">
                                        <p className="text-red-500 text-sm mb-2">Failed to load user details</p>
                                        <button
                                            onClick={() => refetch()}
                                            className="text-violet-600 text-sm hover:underline"
                                        >
                                            Retry
                                    </button>
                                </div>
                            ) : userDetails ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                        <div className="flex items-center justify-center overflow-hidden rounded-full bg-violet-600 text-white w-12 h-12">
                                            {userDetails.profile_picture ? (
                                                <Image
                                                    src={getProfileImageUrl()}
                                                    alt={`${userDetails.username}'s profile`}
                                                    className='object-cover w-full h-full rounded-full'
                                                    width={48}
                                                    height={48}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = "/profile.png";
                                                    }}
                                                />
                                            ) : (
                                                <span className="font-semibold text-sm">
                                                    {getUserInitials()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{userDetails.username}</h3>
                                            <p className="text-sm text-gray-500">{userDetails.role}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                                            <p className="text-sm text-gray-900">{userDetails.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-wide">User ID</label>
                                            <p className="text-sm text-gray-900">#{userDetails.id}</p>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 space-y-2">
                                        <button
                                            onClick={() => {
                                                setShowUserDropdown(false);
                                                router.push('/lecturer/profile');
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowUserDropdown(false);
                                                router.push('/lecturer/profile');
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                        >
                                            Settings
                                        </button>
                                        <button
                                            onClick={() => refetch()}
                                            className="w-full text-left px-3 py-2 text-sm text-violet-600 hover:bg-violet-50 rounded-md"
                                        >
                                            Refresh Details
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 text-sm">No user details available</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Navbar
