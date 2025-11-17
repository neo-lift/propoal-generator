import ProposalGenerator from "@/components/proposal-generator";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col from-gray-50 to-gray-100">
      <main className="container mx-auto flex-1 py-8 px-4 max-w-4xl">
        <header className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposal Generator</h1>
          <p className="text-gray-600">Generate proposals for your hotel events using AI.</p>
        </header>

        <ProposalGenerator />
      </main>

      <footer className="mb-8 text-center text-sm text-gray-500">
        <p>Powered by <a href="https://proposales.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Proposales API</a> and <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AI</a></p>
      </footer>
    </div>
  );
}
