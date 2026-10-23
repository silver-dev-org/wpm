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
      <footer className="bg-black px-4 py-2 text-center font-mono text-xs text-neutral-400">
        <h1 className="inline text-neutral-200">WPM by Silver.dev</h1>
        {" · "}
        <p className="inline">
          Typing practice with real code snippets in JavaScript, Python or Go.
          Measure your words per minute for coding interviews.
        </p>
      </footer>
      <Script src="/game/game.js" />
    </>
  );
}
