import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server's JS chunks (/_next/*) to load when the app is
  // reached from another device. Without this, Next.js blocks these as
  // cross-origin, the client never hydrates, and every interactive feature
  // (forms, buttons) silently falls back to native GET submission.
  allowedDevOrigins: ["192.168.1.183", "*.ngrok-free.app", "*.ngrok.app"],

};

export default nextConfig;
