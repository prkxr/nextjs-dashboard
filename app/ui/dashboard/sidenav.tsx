// 'use client';

// import Link from 'next/link';
// import NavLinks from '@/app/ui/dashboard/nav-links';
// import AcmeLogo from '@/app/ui/acme-logo';
// import { PowerIcon } from '@heroicons/react/24/outline';
// import { signOut } from '@/auth';

// export default function SideNav() {
//   return (
//     <div className="flex h-full flex-col px-3 py-4 md:px-2">
//       <Link
//         className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
//         href="/"
//       >
//         <div className="w-32 text-white md:w-40">
//           <AcmeLogo />
//         </div>
//       </Link>
//       <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
//         <NavLinks />
//         <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
//         <form action={async () => {
//             'use server';
//             await signOut({ redirectTo: '/' });
//           }}>
//           <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
//             <PowerIcon className="w-6" />
//             <div className="hidden md:block">Sign Out</div>
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

'use client';

import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import BrandLogo from '@/app/ui/brand-logo';

import { PowerIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/app/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function SideNav() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted || !user) return;

      const nameFromMeta =
        (user.user_metadata &&
          (user.user_metadata.full_name || user.user_metadata.name)) ||
        null;

      setDisplayName(nameFromMeta || user.email || null);
      setEmail(user.email || null);
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  async function handleSignOutClick() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <BrandLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block" />
        <div className="mb-2 flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs md:text-sm">
          <div className="flex flex-col">
            <span className="font-semibold">
              {displayName ?? 'Signed in user'}
            </span>
            {email && (
              <span className="text-gray-500" title={email}>
                {email}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOutClick}
          className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
        >
          <PowerIcon className="w-6" />
          <div className="hidden md:block">Sign Out</div>
        </button>
      </div>
    </div>
  );
}
