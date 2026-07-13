import { Link } from "@tanstack/react-router";
import { Home, ShoppingBasket, MapPin, Sun } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Start", Icon: Home },
  { to: "/shopping", label: "Einkauf", Icon: ShoppingBasket },
  { to: "/open-sunday", label: "Offen", Icon: MapPin },
  { to: "/plan", label: "Plan", Icon: Sun },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-canvas/85 backdrop-blur-md border-t border-black/5 px-6 py-3">
      <div className="mx-auto max-w-md flex justify-between items-center">
        {ITEMS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 text-ink/40 [&.active]:text-ink"
            activeOptions={{ exact: true }}
            activeProps={{ className: "active" }}
          >
            <Icon className="size-5" strokeWidth={2} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}