import { ScheduleSection } from "@/components/features/schedule-section";
import { getActiveRoomId } from "@/lib/active-room";
import { ScheduleService } from "@/services/schedule.service";

export default async function SchedulePage() {
	const roomId = await getActiveRoomId();
	const matches = await ScheduleService.getScheduleMatches(roomId ?? undefined);

	return <ScheduleSection matches={matches} />;
}
