import Feed from "@/components/Feed";

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="max-w-2xl md:max-w-6xl mx-auto px-4 md:px-10 py-10">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white">PubCrawl</h1>
        <span className="text-sm text-neutral-500">{today}</span>
      </div>
      <Feed />
    </main>
  );
}
