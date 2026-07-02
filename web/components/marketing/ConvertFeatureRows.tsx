import CoverImage from "@/components/marketing/CoverImage";
import { convertPageCopy } from "@/lib/copy/readiness-convert";

export default function ConvertFeatureRows() {
  const { items } = convertPageCopy.features;

  return (
    <div className="space-y-12 lg:space-y-16">
      {items.map((item, index) => {
        const imageFirst = index % 2 === 0;
        return (
          <div
            key={item.title}
            className={[
              "grid items-center gap-8 lg:grid-cols-2",
              imageFirst ? "" : "lg:[&>*:first-child]:order-2",
            ].join(" ")}
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[#141414]">
              <CoverImage
                src={item.image}
                alt={item.imageAlt}
                className="object-cover grayscale transition hover:scale-[1.02]"
              />
            </div>
            <div>
              <p className="text-label text-[var(--color-gray-500)]">{item.stat}</p>
              <h3 className="heading-section mt-2 !text-2xl">{item.title}</h3>
              <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
