import { ClientOnly } from "@/components/client-only";
import Timer from "@/components/timer";

export default function Home() {
  return (
    <div className="py-8">
      <ClientOnly>
        <Timer />
      </ClientOnly>
    </div>
  );
}
