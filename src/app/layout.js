import "./globals.css";

export const metadata = {
  title: "Facebook Daily 10 Slots",
  description: "ตั้งเวลาโพสต์ Facebook แบบง่ายสุด วันละไม่เกิน 10 โพสต์"
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
