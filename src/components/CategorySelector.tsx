import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_TREE,
  type ActivityType,
  type BroadCategory,
  type SubCategory,
} from "../constants/categories";

type CategoryValue = {
  broadCategory: BroadCategory;
  subCategory: SubCategory;
  activityType: ActivityType;
};

type CategorySelectorProps = {
  value: CategoryValue | null;
  onChange: (value: CategoryValue) => void;
};

const CategorySelector = ({ value, onChange }: CategorySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [activeBroad, setActiveBroad] = useState<BroadCategory | null>(
    value?.broadCategory ?? null
  );
  const [activeSub, setActiveSub] = useState<SubCategory | null>(
    value?.subCategory ?? null
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (value) {
      setActiveBroad(value.broadCategory);
      setActiveSub(value.subCategory);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const broadCategories = useMemo(
    () => Object.keys(CATEGORY_TREE) as BroadCategory[],
    []
  );

  const subCategories = useMemo(() => {
    if (!activeBroad) return [];
    const next = CATEGORY_TREE[activeBroad];
    return Object.keys(next) as SubCategory[];
  }, [activeBroad]);

  const activityTypes = useMemo(() => {
    if (!activeBroad || !activeSub) return [];
    const nextSub = CATEGORY_TREE[activeBroad][activeSub];
    return nextSub ?? [];
  }, [activeBroad, activeSub]);

  const label = value
    ? `${value.broadCategory} › ${value.subCategory} › ${value.activityType}`
    : "Select a category";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (next) {
              setActiveBroad(null);
              setActiveSub(null);
            }
            return next;
          });
        }}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#18453B]"
      >
        <span className="truncate text-sm">{label}</span>
        <span className="text-slate-400">▾</span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 flex w-full min-w-[440px] rounded-lg border border-[#18453B]/20 bg-white p-2 shadow-xl">
          <div className="w-48 rounded-lg bg-[#18453B]/5 p-2">
            {broadCategories.map((broad) => (
              <button
                key={broad}
                type="button"
                onMouseEnter={() => {
                  setActiveBroad(broad);
                  setActiveSub(null);
                }}
                onClick={() => {
                  setActiveBroad(broad);
                  setActiveSub(null);
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-semibold transition ${
                  activeBroad === broad
                    ? "bg-[#18453B] text-white shadow-sm"
                    : "text-[#18453B] hover:bg-white"
                }`}
              >
                {broad}
              </button>
            ))}
          </div>
          {activeBroad ? (
            <div className="ml-2 w-52 rounded-lg bg-[#18453B]/5 p-2">
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onMouseEnter={() => setActiveSub(sub)}
                  onClick={() => setActiveSub(sub)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-semibold transition ${
                    activeSub === sub
                      ? "bg-[#18453B] text-white shadow-sm"
                      : "text-[#18453B] hover:bg-white"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          ) : null}
          {activeBroad && activeSub ? (
            <div className="ml-2 w-52 rounded-lg bg-white p-2">
              {activityTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onChange({
                      broadCategory: activeBroad,
                      subCategory: activeSub,
                      activityType: type,
                    });
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-[#18453B]/10"
                >
                  {type}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default CategorySelector;
