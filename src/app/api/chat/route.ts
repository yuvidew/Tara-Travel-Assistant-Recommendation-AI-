import { runTravelChat } from "@/ai/chains/travel-chat-chain";
import { chatRequestSchema } from "@/lib/validation/chat";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = chatRequestSchema.parse(json);
    const result = await runTravelChat(input);

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to process chat request.";

    return Response.json({ error: message }, { status: 400 });
  }
}
