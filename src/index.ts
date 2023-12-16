import { debug, getInput } from "@actions/core";
import { context } from "@actions/github";
import { LinearClient } from "@linear/sdk";

const setup = async () => {
  debugger;
  if (context.eventName !== "pull_request") {
    debug("Not a pull request, skipping");
    return;
  }

  const PRNumber = context?.ref?.match(/refs\/pull\/(\d+)\/merge/)?.[1];
  const linearApiKey = getInput("linear-api-key");
  const linearClient = new LinearClient({ apiKey: linearApiKey });
  const netlifySiteId = getInput('netlify-site-id');
  const netlifyDomain = getInput('netlify-domain');

  if (!PRNumber) {
    debug("Could not find PR number");
    return;
  }

  if (!context?.payload.repository?.owner?.name || !context?.payload.repository?.name) {
    debug("Could not find repository owner or name");
    return;
  }

  debug(`PR number: ${PRNumber}`);
  debug('attaching link to linear issue')

  const linearIssue = await linearClient.issues({
    filter: {
      number: { eq: Number(PRNumber) },
    },
  });

  if (!linearIssue?.nodes?.[0]?.id) {
    debug('Could not find linear issue')
    return;
  }

  linearClient.createAttachment({
    issueId: linearIssue.nodes[0].id,
    title: "Netlify deploy preview",
    url: `https://deploy-preview-${PRNumber}--${netlifySiteId}.${netlifyDomain}/`,
    iconUrl: "https://cdn.worldvectorlogo.com/logos/netlify.svg"
  })
};

setup();
