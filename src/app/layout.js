import "./globals.css";

export const metadata = {
  title: "Automation Factory — Build AI Workers in Seconds",
  description:
    "A meta-AI platform that builds, deploys, and monitors intelligent automation workers from a single prompt. Replace repetitive tasks with autonomous AI agents.",
  keywords: ["automation", "AI", "agents", "workflow", "no-code", "orchestration"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
