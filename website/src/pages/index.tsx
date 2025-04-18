import Script from "next/script";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/game/style.css" />
      </Head>
      <Script src="/game/game.js" strategy="afterInteractive" />
    </>
  );
}