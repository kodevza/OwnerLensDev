---
layout: ../../../layouts/FieldNoteLayout.astro
title: "Governing AI agent access to Microsoft Graph with OwnerLens and microsoft-skills"
date: 2026-11-27
slug: "governing-ai-agent-access-to-microsoft-graph"
description: "A proposed integration that places Microsoft Graph PowerShell skills behind the purpose-bound access controls in the OwnerLens reference design."
topics: [ai-agents-mcp, governance]
format: technical-note
---

An AI agent helping with an ownership review should be able to answer a specific question. *Who is listed as an owner of this service principal in Microsoft Entra ID?* The access decision behind that question is just as specific. Which agent may perform the lookup, for which service principal, and under whose approval?

The OwnerLens reference design, *Governing AI agents through purpose-bound access*, ties those decisions to an accountable owner, an approved purpose, and a record of what happened at runtime. The open-source `microsoft-skills` project supplies PowerShell scripts that can perform the Microsoft Graph lookup once the gateway has authorized it. [OwnerLens reference design](/field-notes/governing-ai-agents-through-purpose-bound-access/) · [Microsoft Cloud API Skills](https://github.com/soulemike/microsoft-skills)

## Where `microsoft-skills` fits

The reference design puts `agentgateway` between the AI agent and a backend API. OpenIDM records the approved purpose and resource scope, OpenICF provisions the policy, and the gateway enforces it at runtime. In this proposed integration, `microsoft-skills` runs **inside the backend API**. Its job is to carry out a Graph operation after the gateway has approved the call. [Microsoft Graph skill](https://github.com/soulemike/microsoft-skills/tree/main/skills/graph)

```text
AI agent → agentgateway → Backend API → microsoft-skills → Microsoft Graph
                └── OpenTelemetry → Blob Storage → OwnerLens
```

## One ownership lookup, from approval to audit

Suppose an agent is helping review a single enterprise application. The Agent Owner and Resource Owner approve a directory-owner lookup for that service principal. OpenIDM records the approved operation and object ID, and OpenICF provisions the authorization policy. The agent calls a tool such as `get_service_principal_owners(objectId)`. The gateway checks the agent’s identity, the requested operation, and the object ID against that policy.

For an allowed call, the gateway authenticates to the backend API using its managed identity. The backend uses its own managed identity to obtain a separate token for Microsoft Graph. Inside the backend, `Connect-GraphApi.ps1` establishes the Graph context and `Invoke-GraphRequest.ps1` performs `GET /servicePrincipals/{id}/owners`. The tool returns the directory-owner records needed for the review. OwnerLens can use those records as an ownership signal alongside other evidence when reviewers identify the team accountable for the workload. [Microsoft Graph request script](https://github.com/soulemike/microsoft-skills/blob/main/skills/graph/Invoke-GraphRequest.ps1) · [List owners of a service principal](https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list-owners?view=graph-rest-1.0) · [OwnerLens evidence model](/docs/evidence-model/)

The gateway’s OpenTelemetry event can record the agent, the requested operation, the target object ID, the policy decision, and the execution outcome. A policy or approval identifier lets OwnerLens trace the retained event back to the approval. When the approved purpose ends, revoking the policy closes that access path. [OwnerLens reference design](/field-notes/governing-ai-agents-through-purpose-bound-access/)

## Why the backend keeps the Graph token

The bundled `microsoft-skills` MCP server exposes general-purpose Graph requests and documents returning a token-bearing authentication context to the client. If the agent receives that token, it may be able to call Graph directly within the token’s permissions. In the proposed integration, Graph credentials stay inside the backend, and the agent supplies only the service principal object ID. The backend fixes the HTTP method and endpoint. That matters because the least-privileged application permission documented for this lookup, `Application.Read.All`, is broader than approval for one service principal. The gateway policy supplies that narrower scope. [Microsoft Cloud API Skills MCP documentation](https://github.com/soulemike/microsoft-skills/tree/main/mcp) · [Microsoft Graph permissions for this endpoint](https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list-owners?view=graph-rest-1.0#permissions)

A first demonstrator should verify three outcomes. The approved lookup succeeds, the same lookup against a different object ID is denied before it reaches Graph, and the original lookup is denied after approval is withdrawn. The audit trail should show why the same authenticated agent was allowed to act in one case and denied in the others.
