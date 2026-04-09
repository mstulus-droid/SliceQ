"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState, useTransition } from "react";

const NavigationContext = createContext<{
  isNavigating: boolean;
  startNavigation: () => void;
}>({
  isNavigating: false,
  startNavigation: () => {},
});

export function useNavigation() {
  return useContext(NavigationContext);
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Reset navigation state when route changes complete
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  const startNavigation = () => {
    startTransition(() => {
      setIsNavigating(true);
    });
  };

  return (
    <NavigationContext.Provider value={{ isNavigating: isNavigating || isPending, startNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}
