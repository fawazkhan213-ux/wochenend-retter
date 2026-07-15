import type { NearbyPlace } from "@/lib/places.functions";

// Traffic-light open/closed indicator used across nearby lists.
// green = offen · gelb = schließt bald (<=60 min) · rot = geschlossen
export function StoreStatusBadge({ place }: { place: Pick<NearbyPlace, "openNow" | "closesInMinutes"> }) {
  if (place.openNow === true) {
    if (place.closesInMinutes !== null && place.closesInMinutes <= 60) {
      return (
        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
          schließt in {place.closesInMinutes} min
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
        offen
      </span>
    );
  }
  if (place.openNow === false) {
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
        geschlossen
      </span>
    );
  }
  return null;
}