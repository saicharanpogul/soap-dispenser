import { getPathMetadata } from "@/constants/meta";
import { Metadata } from "next";
import Dashboard from "./page";

export async function generateMetadata(props: any): Promise<Metadata> {
  const metadata = getPathMetadata("/", { title: "Dashboard" });
  return metadata;
}

export default Dashboard;
