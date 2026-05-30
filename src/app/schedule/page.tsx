import { ScheduleSection } from "@/components/features/schedule-section";
import { getActiveRoomId, getActiveRoomTournament } from "@/lib/active-room";
import { ScheduleService } from "@/services/schedule.service";

export default async function SchedulePage() {
	const roomId = await getActiveRoomId();
	const tournament = await getActiveRoomTournament();
	const matches = await ScheduleService.getScheduleMatches(
		tournament,
		roomId ?? undefined
	);

	return <ScheduleSection matches={matches} />;
}
