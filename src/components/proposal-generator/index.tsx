'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

type ProposalFormValues = {
  inputText: string;
};

export default function ProposalGenerator() {
  const { register, handleSubmit } = useForm<ProposalFormValues>({
    defaultValues: { inputText: "" },
  });

  const onSubmit = (data: ProposalFormValues) => {
    console.log(data.inputText);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Generate Proposal from Event Brief</CardTitle>
            <CardDescription>
              Enter the details of your event and click the button below to generate a proposal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="event-name" className="block text-sm font-medium text-gray-700">Event Name</Label>
              <Textarea
                id="input-text"
                {...register("inputText")}
                placeholder="Paste your event description, meeting notes, email, or transcription here..."
                rows={10}
                className="font-mono text-sm w-full"
              />
            </div>
          </CardContent>
          <CardFooter> <Button type="submit" className="w-full cursor-pointer">Generate Proposal</Button> </CardFooter>
        </Card>
      </form>
    </div>
  );
}