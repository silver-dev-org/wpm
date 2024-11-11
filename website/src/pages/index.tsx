import Head from "next/head";
import Script from "next/script";

export default function Home() {
  return (
    <>
      <Head>
        <title>mygame</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/game/game.css" />
      </Head>

      <main>
        <div className="editor"></div>
      </main>

      <Script src="/game/game.js" strategy="afterInteractive" />
    </>
  );
}