import { Variants } from "framer-motion";

const prefersReducedMotion = typeof window !== 'undefined' 
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const createVariant = (hidden: any, visible: any, duration: number = 0.5): Variants => ({
  hidden: prefersReducedMotion ? { ...hidden, opacity: 0 } : hidden,
  visible: {
    ...visible,
    transition: prefersReducedMotion 
      ? { duration: 0.01 }
      : { duration, ease: [0.4, 0, 0.2, 1] },
  },
});

export const fadeInUp: Variants = createVariant(
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0 }
);

export const fadeInDown: Variants = createVariant(
  { opacity: 0, y: -20 },
  { opacity: 1, y: 0 }
);

export const fadeInLeft: Variants = createVariant(
  { opacity: 0, x: -20 },
  { opacity: 1, x: 0 }
);

export const fadeInRight: Variants = createVariant(
  { opacity: 0, x: 20 },
  { opacity: 1, x: 0 }
);

export const scaleIn: Variants = createVariant(
  { opacity: 0, scale: 0.9 },
  { opacity: 1, scale: 1 },
  0.4
);

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const magneticHover = {
  initial: { scale: 1 },
  whileHover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  whileTap: { scale: 0.95 },
};

export const cardHover3D = {
  initial: { rotateX: 0, rotateY: 0, scale: 1 },
  whileHover: {
    rotateX: 2,
    rotateY: 2,
    scale: 1.02,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const parallaxScroll = (offset: number = 50) => ({
  initial: { y: 0 },
  animate: { y: offset },
  transition: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
  },
});

export const glowPulse: Variants = {
  initial: {
    boxShadow: "0 0 20px rgba(0, 0, 0, 0)",
  },
  animate: {
    boxShadow: [
      "0 0 20px rgba(var(--primary-rgb), 0.3)",
      "0 0 40px rgba(var(--primary-rgb), 0.6)",
      "0 0 20px rgba(var(--primary-rgb), 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const successPulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const errorShake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-5, 5, -5, 5, -5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

export const slideUpReveal: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const textReveal: Variants = {
  hidden: {
    clipPath: "inset(0 100% 0 0)",
  },
  visible: {
    clipPath: "inset(0 0 0 0)",
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const counterUp = (duration: number = 2) => ({
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      ease: [0.4, 0, 0.2, 1],
    },
  },
});
