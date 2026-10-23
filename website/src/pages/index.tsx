import Head from "next/head";
import Script from "next/script";

export default function Home() {
  return (
    <>
      <Head>
        <title>WPM by Silver.dev: Typing Speed Practice for Coding Interviews</title>
        <meta
          name="description"
          content="Type real code snippets in JavaScript, Python or Go, measure your words per minute, and build the typing speed that coding interviews expect."
        />
      </Head>
      <Script src="/game/game.js" />
    </>
  );
}
