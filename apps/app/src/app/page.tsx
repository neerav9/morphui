export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-3xl px-6 text-center">

        <h1 className="text-7xl font-bold tracking-tight">
          MorphUI
        </h1>

        <p className="text-zinc-400 text-xl mt-4">
          The interface adapts to your data
        </p>

        <div className="mt-12 border border-zinc-800 bg-zinc-950 rounded-3xl p-16 transition-all">

          <div className="border-2 border-dashed border-blue-500/40 rounded-2xl p-16 hover:border-blue-400 transition-all cursor-pointer">

            <p className="text-zinc-400 text-lg">
              Upload CSV or drag file here
            </p>

          </div>

        </div>

      </div>
    </main>
  );
}