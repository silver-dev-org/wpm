import Script from "next/script";

export default function Home() {
  return (
    <>
      <link rel="stylesheet" href="/game/style.css" />
      <Script src="/game/game.js" />
    </>
  );
}