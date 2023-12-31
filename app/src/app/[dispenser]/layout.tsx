import { getPathMetadata } from "@/constants/meta";
import { Metadata } from "next";
import Dispenser from "./page";

export async function generateMetadata(props: any): Promise<Metadata> {
  const metadata = getPathMetadata("/");
  return metadata;
}

export default Dispenser;
