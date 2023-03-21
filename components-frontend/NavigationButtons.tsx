import Link from 'next/link';
import { appRoutes } from './lib/routes';

import { useRouter } from 'next/router';
import React from 'react';

export default function NavigationButtons() {
  const router = useRouter();

  return (
    <>
      {appRoutes.map((route) => {
        const activeRoute = router.pathname.includes(route.path);
        const activeClassName =
          'bg-caralegalGreen text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300';
        const inactiveClassName =
          'text-gray-300 hover:bg-caralegalGreen hover:bg-opacity-80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300';

        return (
          <Link href={route.path} key={route.name}>
            <a
              href="#"
              className={activeRoute ? activeClassName : inactiveClassName}
            >
              {route.name}
            </a>
          </Link>
        );
      })}
    </>
  );
}
