"use client";

import Link from "next/link";
import { useNavigation } from "./navigation-provider";

interface NavLinkProps extends React.ComponentProps<typeof Link> {
  children: React.ReactNode;
}

export function NavLink({ children, onClick, ...props }: NavLinkProps) {
  const { startNavigation } = useNavigation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    startNavigation();
    onClick?.(e);
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
