import { cn } from "@/lib/utils";
import { publicAssetUrl } from "@/lib/basePath";

interface TrashIconProps {
  className?: string;
}

export const TrashIcon = ({ className }: TrashIconProps) => (
  <span
    aria-hidden
    className={cn(
      "inline-flex size-9 items-center justify-center rounded-full border border-black bg-white h-[47px] w-[47px]",
      className,
    )}
  >
    <img
      src={publicAssetUrl("/trash_icon.png")}
      alt=""
      className="h-[17px] w-[15px]"
    />
  </span>
);
