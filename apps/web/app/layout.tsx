import "./globals.css";

export default function Layout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="pt">
      <body>
        {children}
      </body>
    </html>
  );
}
