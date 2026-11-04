import { privateRobots } from "@/lib/seo";
export const metadata = { robots: privateRobots };
export default function PrivateLayout({ children }: { children: React.ReactNode }) { return children; }
