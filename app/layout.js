import "./globals.css";
import CursorTracker from "@/components/CursorTracker";

export const metadata = {
  title: "Poetry Museum",
  description: "An immersive digital space for poetry.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CursorTracker />
        {children}
      </body>
    </html>
  );
}
