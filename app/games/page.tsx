import Link from "next/link";

type Game = {
  id: string;
  course: string;
  city: string;
  date: string;
  time: string;
  host: string;
  hostHandicap: number;
  format: "Casual 18" | "Casual 9" | "2v2 Best Ball" | "Scramble";
  slotsOpen: number;
  slotsTotal: number;
  prefs: string;
};

const MOCK_GAMES: Game[] = [
  {
    id: "1",
    course: "Stone Creek Golf Club",
    city: "Urbana, IL",
    date: "Sat, Jul 11",
    time: "8:30 AM",
    host: "Mike T.",
    hostHandicap: 12,
    format: "Casual 18",
    slotsOpen: 2,
    slotsTotal: 4,
    prefs: "Handicap 5–20 · Walkers welcome · Easygoing pace",
  },
  {
    id: "2",
    course: "Lake of the Woods GC",
    city: "Mahomet, IL",
    date: "Sun, Jul 12",
    time: "1:00 PM",
    host: "Sarah K.",
    hostHandicap: 8,
    format: "2v2 Best Ball",
    slotsOpen: 1,
    slotsTotal: 4,
    prefs: "Handicap under 15 · Friendly wager optional",
  },
  {
    id: "3",
    course: "University of Illinois Orange",
    city: "Savoy, IL",
    date: "Wed, Jul 15",
    time: "5:15 PM",
    host: "Dave R.",
    hostHandicap: 22,
    format: "Casual 9",
    slotsOpen: 3,
    slotsTotal: 4,
    prefs: "Beginners welcome · After-work twilight round",
  },
];

export default function GamesPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-[var(--fairway)] hover:underline">
            ← Pure it!
          </Link>
          <h1 className="mt-1 text-3xl font-bold">Games near you</h1>
        </div>
        <button className="rounded-lg bg-[var(--fairway)] px-4 py-2 font-semibold text-white transition hover:bg-[var(--fairway-dark)]">
          + Host a round
        </button>
      </div>

      <ul className="space-y-4">
        {MOCK_GAMES.map((game) => (
          <li
            key={game.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{game.course}</h2>
                <p className="text-sm text-gray-500">{game.city}</p>
              </div>
              <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-semibold text-[var(--fairway-dark)]">
                {game.format}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium">
              {game.date} · {game.time}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Hosted by {game.host} (hcp {game.hostHandicap}) · {game.prefs}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {game.slotsOpen} of {game.slotsTotal} spots open
              </span>
              <button className="rounded-lg border border-[var(--fairway)] px-4 py-1.5 text-sm font-semibold text-[var(--fairway)] transition hover:bg-[var(--fairway)] hover:text-white">
                Join game
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
