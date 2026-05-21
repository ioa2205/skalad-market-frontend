"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { durations, easings } from "@/lib/motion/tokens";

export function FadeIn({ children, ...rest }: HTMLMotionProps<"div">) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: durations.normal, ease: easings.standard }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, ...rest }: HTMLMotionProps<"div">) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.normal, ease: easings.standard }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerProps extends HTMLMotionProps<"div"> {
  staggerMs?: number;
}

export function Stagger({ children, staggerMs = 60, ...rest }: StaggerProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: reduced ? 0 : staggerMs / 1000 },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
