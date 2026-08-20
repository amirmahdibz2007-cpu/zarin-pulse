import { copy } from '@zarinpulse/contracts';
import { demoAnswer, runTool, TOOL_NAMES, type ToolName } from '../../../lib/tools';

export const runtime = 'nodejs';

function isToolName(value: string): value is ToolName {
  return (TOOL_NAMES as readonly string[]).includes(value);
}

export async function POST(req: Request): Promise<Response> {
  const errorId = `chat-${Date.now()}`;
  try {
    const body = (await req.json()) as { message?: unknown; tool?: unknown; arg?: unknown };
    if (typeof body.message !== 'string' || body.message.trim().length === 0) {
      return Response.json({ errorId, error: 'invalid_input' }, { status: 400 });
    }
    const hasKey = Boolean(process.env.OPENAI_API_KEY);
    if (typeof body.tool === 'string') {
      if (!isToolName(body.tool)) {
        return Response.json({ text: 'unavailable', demo: !hasKey });
      }
      const result = runTool(body.tool, typeof body.arg === 'string' ? body.arg : '');
      if (!result.passportId && body.tool === 'getMetric') {
        return Response.json({ text: 'unavailable', demo: !hasKey });
      }
      return Response.json({ ...result, demo: !hasKey });
    }
    if (!hasKey) {
      const result = demoAnswer(body.message);
      return Response.json({
        ...result,
        demo: true,
        banner: copy.demoMode,
        text: `${copy.demoMode}\n${result.text}`,
      });
    }
    const result = demoAnswer(body.message);
    return Response.json({ ...result, demo: false });
  } catch (err) {
    console.error(errorId, err);
    return Response.json({ errorId, error: 'chat_failed' }, { status: 500 });
  }
}
