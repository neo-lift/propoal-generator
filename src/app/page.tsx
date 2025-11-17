
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <header className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposal Generator</h1>
          <p className="text-gray-600">Generate proposals for your hotel events using AI.</p>
        </header>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600">Enter the details of your event and click the button below to generate a proposal.</p>
          <form>
            <div className="mb-4">
              <textarea id="event-name" className="w-full h-48 p-2 border border-gray-300 rounded-md" placeholder="Enter the details of your event" rows={10} />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Generate Proposal</button>
          </form>
        </div>
      </main>
    </div>
  );
}
