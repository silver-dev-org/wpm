export default function Home() {
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <iframe
        src="/Build/index.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="TestGame"
      />
    </div>
  );
}
