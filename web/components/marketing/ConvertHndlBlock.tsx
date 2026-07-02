import MoscaCalculator from "@/components/marketing/MoscaCalculator";
import HndlShelfLifeChart from "@/components/marketing/HndlShelfLifeChart";
import { convertPageCopy } from "@/lib/copy/readiness-convert";

export default function ConvertHndlBlock() {
  const { hndl } = convertPageCopy;

  return (
    <div className="space-y-8">
      <div className="content-reading">
        <span className="text-label text-[var(--color-gray-500)]">{hndl.eyebrow}</span>
        <h2 className="heading-section mt-4">{hndl.title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">{hndl.description}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <MoscaCalculator />
        <HndlShelfLifeChart />
      </div>
    </div>
  );
}
