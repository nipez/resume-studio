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
    <div className="scroll flex-1 overflow-auto bg-page">
      <div className="mx-auto max-w-[1080px] px-5 pb-20 sm:px-8 lg:px-10">
        <DiscoveryPanel profiles={profiles} isStudent={profile.isStudent} />
      </div>
    </div>
  );
}
