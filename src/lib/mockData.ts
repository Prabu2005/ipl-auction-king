export interface Player {
  id: string;
  name: string;
  photo: string;
  role: "Batsman" | "Bowler" | "All-rounder" | "WK";
  country: string;
  basePrice: number;
  stats: {
    runs?: number;
    wickets?: number;
    average?: number;
    strikeRate?: number;
    economy?: number;
  };
  badge: "Star Player" | "Uncapped" | "Overseas" | null;
  status: "pending" | "active" | "sold" | "unsold";
  soldToTeamId?: string;
  soldPrice?: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  color: string;
  budgetTotal: number;
  budgetRemaining: number;
  ownerName: string;
  rtmCount: number;
  squad: Player[];
}

export const mockPlayers: Player[] = [
  { id: "p1", name: "Virat Kohli", photo: "", role: "Batsman", country: "India", basePrice: 200, stats: { runs: 7263, average: 37.25, strikeRate: 130.73 }, badge: "Star Player", status: "sold", soldToTeamId: "t1", soldPrice: 1100 },
  { id: "p2", name: "Jasprit Bumrah", photo: "", role: "Bowler", country: "India", basePrice: 200, stats: { wickets: 145, economy: 7.39, average: 24.1 }, badge: "Star Player", status: "sold", soldToTeamId: "t2", soldPrice: 1800 },
  { id: "p3", name: "Ben Stokes", photo: "", role: "All-rounder", country: "England", basePrice: 200, stats: { runs: 920, wickets: 28, average: 26.3, strikeRate: 134.8, economy: 8.6 }, badge: "Overseas", status: "active", soldPrice: undefined },
  { id: "p4", name: "Jos Buttler", photo: "", role: "WK", country: "England", basePrice: 200, stats: { runs: 3100, average: 35.2, strikeRate: 149.1 }, badge: "Overseas", status: "pending" },
  { id: "p5", name: "Rashid Khan", photo: "", role: "Bowler", country: "Afghanistan", basePrice: 200, stats: { wickets: 112, economy: 6.55, average: 21.8 }, badge: "Overseas", status: "unsold" },
  { id: "p6", name: "Shubman Gill", photo: "", role: "Batsman", country: "India", basePrice: 100, stats: { runs: 2400, average: 34.6, strikeRate: 128.5 }, badge: null, status: "pending" },
  { id: "p7", name: "Yuzvendra Chahal", photo: "", role: "Bowler", country: "India", basePrice: 100, stats: { wickets: 187, economy: 7.62, average: 22.5 }, badge: null, status: "pending" },
  { id: "p8", name: "Devon Conway", photo: "", role: "Batsman", country: "New Zealand", basePrice: 50, stats: { runs: 450, average: 28.5, strikeRate: 125.3 }, badge: "Uncapped", status: "pending" },
];

export const mockTeams: Team[] = [
  { id: "t1", name: "Mumbai Indians", shortName: "MI", logo: "🏏", color: "#004BA0", budgetTotal: 9000, budgetRemaining: 6200, ownerName: "Nita Ambani", rtmCount: 2, squad: [mockPlayers[0]] },
  { id: "t2", name: "Chennai Super Kings", shortName: "CSK", logo: "🦁", color: "#FFCB05", budgetTotal: 9000, budgetRemaining: 5500, ownerName: "N. Srinivasan", rtmCount: 1, squad: [mockPlayers[1]] },
  { id: "t3", name: "Royal Challengers", shortName: "RCB", logo: "👑", color: "#EC1C24", budgetTotal: 9000, budgetRemaining: 8500, ownerName: "Prathmesh Mishra", rtmCount: 2, squad: [] },
  { id: "t4", name: "Kolkata Knight Riders", shortName: "KKR", logo: "⚔️", color: "#3A225D", budgetTotal: 9000, budgetRemaining: 7800, ownerName: "Shah Rukh Khan", rtmCount: 2, squad: [] },
];

export const formatPrice = (lakhs: number): string => {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)} Cr`;
  return `₹${lakhs}L`;
};
