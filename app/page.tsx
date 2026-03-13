import { getAllGames } from "@/lib/data";
import HomeClient from "./HomeClient";

export default function Home() {
  const games = getAllGames();
  return <HomeClient games={games} />;
}
