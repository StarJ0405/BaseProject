"use client";
import { useRouter } from "next/navigation";

interface NavigateFunction {
  (to: String, options?: NavigateOptions): void;
  (delta: number): void;
}
interface NavigateOptions {
  replace?: boolean;
  preventScrollReset?: boolean;
}

export default function useNavigate(): NavigateFunction {
  const router = useRouter();

  return (...props) => {
    if (!props[0]) return;
    if (typeof props[0] === "number") {
      const delta: number = props[0];

      if (delta === -1) router.back();
      else if (delta === 1) router.forward();
    } else {
      const to: string = String(props[0]);

      if (props?.[1]) {
        const options = props?.[1] as NavigateOptions;
        const _option = {
          scroll: options.preventScrollReset,
        };
        if (options.replace) {
          router.replace(to, _option);
        } else router.push(to, _option);
      } else router.push(to);
    }
  };
}
