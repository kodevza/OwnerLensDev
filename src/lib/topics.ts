interface Domain {
  slug: string;
  title: string;
  description: string;
  concepts: { title: string; description: string }[];
  sources?: { title: string; url: string }[];
}

export const domains: Domain[] = [
  {
    slug: 'governance',
    title: 'Governance & ownership',
    description: 'Accountability, access reviews and the identity lifecycle.',
    concepts: [
      { title: 'Accountable owner', description: 'The person or team responsible for deciding what access an identity needs and who must act when that access changes.' },
      { title: 'Access review', description: 'A decision about whether an identity should retain, change or lose access, recorded with its rationale and supporting evidence.' },
      { title: 'Ownership evidence', description: 'Signals such as directory owners, resource metadata and service catalog records that help route a decision to the right team.' },
    ],
  },
  {
    slug: 'workload-identities',
    title: 'Workload identities',
    description: 'Service principals, managed identities, service accounts and cloud roles.',
    concepts: [
      { title: 'Service principal', description: 'In Microsoft Entra, the security identity through which an application or service is represented within a tenant.' },
      { title: 'Managed identity', description: 'An identity an Azure workload can use to authenticate with credentials managed by Azure.' },
      { title: 'Service account', description: 'In Kubernetes, a namespaced identity that a pod can use to authenticate to the API server.' },
    ],
    sources: [
      { title: 'Microsoft Entra workload identities', url: 'https://learn.microsoft.com/en-us/entra/workload-id/workload-identities-overview' },
      { title: 'Kubernetes service accounts', url: 'https://kubernetes.io/docs/concepts/security/service-accounts/' },
    ],
  },
  {
    slug: 'ai-agents-mcp',
    title: 'AI agents & MCP',
    description: 'Agent identity, delegated access and authorization for tool calls.',
    concepts: [
      { title: 'Agent identity', description: 'The identity used to attribute an agent’s requests and apply access policy to its actions.' },
      { title: 'Delegated access', description: 'An agent or client acts on behalf of a user within the permissions granted for the request.' },
      { title: 'Authorization for tool calls', description: 'Determine which authenticated clients may invoke a tool and whether the requested action falls within the granted access.' },
    ],
    sources: [{ title: 'MCP authorization specification', url: 'https://modelcontextprotocol.io/specification/latest/basic/authorization' }],
  },
  {
    slug: 'credentials-federation',
    title: 'Credentials & federation',
    description: 'Secrets, certificates, tokens and trust between identity systems.',
    concepts: [
      { title: 'Credential', description: 'A secret, certificate-backed key or token that an identity uses to prove who it is.' },
      { title: 'Workload identity federation', description: 'A trust relationship that lets a workload authenticate with an identity issued by another system.' },
      { title: 'SPIFFE trust domain', description: 'The boundary within which workloads verify identity documents against a shared root of trust.' },
    ],
    sources: [
      { title: 'Microsoft Entra workload identity federation', url: 'https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation' },
      { title: 'SPIFFE concepts', url: 'https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/' },
    ],
  },
  {
    slug: 'discovery-operations',
    title: 'Discovery & operations',
    description: 'Identity inventory, activity evidence and incident response.',
    concepts: [
      { title: 'Identity inventory', description: 'A record of identities, their workloads, permissions, credentials and accountable teams.' },
      { title: 'Activity evidence', description: 'Sign-ins, deployments and execution logs that help establish how an identity is used and which systems depend on it.' },
      { title: 'Identity incident response', description: 'Identify the affected identity and workload, scope its access, contain exposure and verify that the workload can recover.' },
    ],
  },
  {
    slug: 'tools',
    title: 'Tools & case studies',
    description: 'Open-source tools, reference designs and practical integrations.',
    concepts: [
      { title: 'Ownership evidence tooling', description: 'Collect ownership signals and keep their origin visible so reviewers can evaluate each owner candidate.' },
      { title: 'Governance integration', description: 'Pass candidates and supporting evidence into a review workflow that records the accountable team’s decision.' },
    ],
  },
];
