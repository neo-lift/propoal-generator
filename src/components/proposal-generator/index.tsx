'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sampleEventBriefs } from "@/data/samples";
import { useState } from "react";

export default function ProposalGenerator() {
  const [inputText, setInputText] = useState<string>('');
  const [proposalType, setProposalType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerateProposal = async () => {
    setLoading(true);
    if (!inputText) {
      setError('Please enter an event description');
      setLoading(false);
      return;
    }

    if (!proposalType) {
      setError('Please select a proposal type');
      setLoading(false);
      return;
    }

    // fetch proposal from API
    try {
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            customerName: 'John Doe',
            customerEmail: 'john.doe@example.com',
            companyName: 'Example Inc.',
          },
          event: { eventType: proposalType, startDate: '2024-06-01', endDate: '2024-06-03', guestCount: 100, roomsNeeded: 10 },
          preferences: { meetingSpaces: true, catering: true, tone: 'professional', additionalBrief: inputText },
        }),
      });
      const data = await response.json();
      setResult(data.proposal);
    } catch (error) {
      setError('Failed to generate proposal');
      setLoading(false);
    } finally {
      setLoading(false);
    }

    console.log(inputText, proposalType);
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Generate Proposal from Event Brief</CardTitle>
          <CardDescription>
            Paste event descriptions, meeting transcriptions, or any text describing an event.
            Our AI will analyze it and create a professional hotel proposal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input-text" className="block text-sm font-medium text-gray-700">Event Type</Label>
            <Input id="proposal-type"
              placeholder="e.g., Corporate Event, Wedding, Conference"
              value={proposalType}
              onChange={(e) => setProposalType(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="input-text" className="block text-sm font-medium text-gray-700">Event Description</Label>
            <Textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your event description, meeting notes, email, or transcription here..."
              rows={10}
              className="font-mono text-sm w-full h-full"
              style={{ height: '200px' }}
            />

            <div className="space-y-2 mt-8">
              <p className="text-sm text-gray-600">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {sampleEventBriefs.map((example, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="lg"
                    className="font-medium cursor-pointer"
                    onClick={() => {
                      setInputText(example.text);
                      setProposalType(example.type);
                    }}
                  >
                    {example.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full cursor-pointer font-medium" disabled={loading || !inputText || !proposalType} onClick={handleGenerateProposal}>
            {loading ? 'Generating...' : 'Generate Proposal'}
          </Button>
        </CardFooter>
      </Card>
      {error && <p className="text-red-500">{error}</p>}
      {result && <p className="text-green-500">{result}</p>}
    </div>
  );
}