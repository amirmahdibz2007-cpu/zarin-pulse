import { rewriteAiBriefWithOpenRouter } from '../../../lib/ai-brief-openrouter';
import { tryReadMerchantArtifact } from '../../../lib/artifacts';
import { defaultAiBriefDeps, resolveAiBrief } from '../../../lib/ai-brief-service';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  const errorId = `ai-brief-${Date.now()}`;
  try {
    const body = (await req.json()) as {
      merchantKey?: unknown;
      promptId?: unknown;
      message?: unknown;
      history?: unknown;
    };

    const result = await resolveAiBrief(
      {
        merchantKey: body.merchantKey,
        promptId: body.promptId,
        message: body.message,
        history: body.history,
      },
      defaultAiBriefDeps({
        readMerchant: (key) => tryReadMerchantArtifact(key),
        callModel: (locked, apiKey, history) =>
          rewriteAiBriefWithOpenRouter(locked, apiKey, history),
      }),
      errorId,
    );

    return Response.json(result.body, { status: result.status });
  } catch (err) {
    console.error(JSON.stringify({ scope: 'ai_brief', errorId, error: 'ai_brief_failed' }), err);
    return Response.json({ errorId, error: 'ai_brief_failed' }, { status: 500 });
  }
}
