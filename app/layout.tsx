import "./globals.css";

export const metadata = {
  title: "Debate Duo",
  description: "Two-agent debate demo using the OpenAI API"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
