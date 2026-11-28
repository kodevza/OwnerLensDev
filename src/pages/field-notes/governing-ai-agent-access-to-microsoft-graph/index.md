---
layout: ../../../layouts/FieldNoteLayout.astro
title: "Microsoft Graph access for AI agents in local work and governed workflows"
date: 2026-11-27
slug: "governing-ai-agent-access-to-microsoft-graph"
description: "Using microsoft-skills directly in a local agent under user supervision, with a reference architecture for purpose-bound access to directory data."
topics: [ai-agents-mcp, governance]
format: technical-note
---

An AI agent helping with an ownership review should be able to answer a specific question. *Who is listed as an owner of this service principal in Microsoft Entra ID?* The access decision behind that question is just as specific. Which agent may perform the lookup, for which service principal, and under whose approval?

## Using `microsoft-skills` in a local agent

The open-source `microsoft-skills` project provides reusable PowerShell scripts for agents working with Microsoft cloud APIs. The Graph skill is especially useful when the user runs it directly in a local agent. For an ownership review, the user can ask the agent to look up the owners of a specific service principal, supervise the lookup, and review the results in the same session. Microsoft Graph evaluates the request against the permissions of the identity configured for the skill. [Microsoft Cloud API Skills](https://github.com/soulemike/microsoft-skills)

## Graph credentials and resource scope

With Microsoft Graph as the directory API, the backend holds the Graph token and uses the validated object ID to build a `GET /servicePrincipals/{id}/owners` request. The least-privileged Graph application permission for the lookup, `Application.Read.All`, allows the backend to read application and service principal information across the tenant. The gateway policy scopes the agent’s access to the single approved service principal. [Microsoft Graph endpoint and permissions](https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list-owners?view=graph-rest-1.0#permissions)

A first demonstrator should verify three outcomes. The approved lookup succeeds, the same lookup against a different object ID is denied before it reaches Graph, and the original lookup is denied after approval is withdrawn. The audit trail should show why the same authenticated agent was allowed to act in one case and denied in the others.

## Reference architecture for purpose-bound access

The reference architecture keeps local agent skills outside the governed runtime. It ties each agent action to an accountable owner, an approved purpose, and an audit record. The identity and access management (IAM) system records the approval and its scope. A provisioning connector applies and withdraws the corresponding policy at the access gateway. The gateway enforces the policy before forwarding requests to the backend API.

```text
IAM → Provisioning connector → Access gateway
AI agent → Access gateway → Backend API → Directory API
Access gateway → Audit store
```

Suppose the agent owner and resource owner approve an ownership lookup for one enterprise application. The IAM system records the approved operation and the service principal’s object ID. At runtime, the gateway checks the agent’s identity, the requested operation, and the target object ID against the approved scope before forwarding the call.

For an allowed call, the backend API queries the directory and returns the ownership records. Reviewers can use those records alongside other evidence when identifying the team accountable for the workload.

The gateway sends an event to the audit store with the agent’s identity, requested operation, target object ID, policy decision, and execution outcome. An approval identifier lets reviewers trace the event back to the approval. When the approved purpose ends, IAM withdraws the approval and the connector removes the corresponding access policy from the gateway.

<!-- Generated from index.mmd.md by linkedin-mermaid export.sh --astro. -->
