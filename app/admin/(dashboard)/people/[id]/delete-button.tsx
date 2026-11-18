"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  const [arming, setArming] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!arming) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setArming(false);
    };
    const timer = setTimeout(() => setArming(false), 5000);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [arming]);

  if (!arming) {
    return (
      <button
        type="button"
        onClick={() => setArming(true)}
        className="btn btn-danger h-8 px-3 text-[13px]"
      >
        Remove
      </button>
    );
  }

  return (
    <div ref={wrapper}>
      <form action={action}>
        <ConfirmButton />
      </form>
    </div>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn h-8 border-danger bg-danger px-3 text-[13px] text-white hover:bg-danger-hover"
    >
      {pending ? <span className="spinner" aria-hidden /> : null}
      {pending ? "Removing…" : "Confirm remove"}
    </button>
  );
}
