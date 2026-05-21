import type { Metadata } from "next";
import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "Sign in | Earnytics",
  description: "Sign in to your Earnytics account. Access your publisher or advertiser dashboard.",
};

export default function LoginPage() {
  return <LoginContent />;
}
