import { Configurator } from "@/components/configurator/configurator";
import { parseSetup } from "@/lib/setup";

export default async function Home({ searchParams }: PageProps<"/">) {
  const setup = parseSetup(await searchParams);
  return <Configurator initialSetup={setup} />;
}
