import { DiscoveryPanel } from "@/components/discovery/discovery-panel";
import { getJobSearchProfiles } from "@/lib/discovery/actions";
import { getUserProfileContext } from "@/lib/profile/actions";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const [profiles, profile] = await Promise.all([
    getJobSearchProfiles(),
    getUserProfileContext(),
  ]);

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1080px] px-5 pb-16 sm:px-8 lg:px-12 pt-[42px]">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-ink">
          Job discovery
        </h1>
        <p className="mt-2 max-w-[640px] text-[14px] leading-[1.55] text-muted">
          Find companies and roles that match your criteria — then save targets to your queue,
          tailor in ~25 seconds, and track the application.
        </p>
        <DiscoveryPanel profiles={profiles} isStudent={profile.isStudent} />
      </div>
    </div>
  );
}
