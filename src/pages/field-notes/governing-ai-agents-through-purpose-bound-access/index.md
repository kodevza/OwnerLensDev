---
layout: ../../../layouts/FieldNoteLayout.astro
title: "Governing AI agents through purpose-bound access"
date: 2026-11-24
slug: "governing-ai-agents-through-purpose-bound-access"
description: "A reference design and early demonstrator for binding AI agent access to accountable ownership, approved purpose and runtime evidence."
topics: [ai-agents-mcp, governance]
format: reference-design
centerImages: true
---

*OwnerLens · OpenIDM · agentgateway · Microsoft Entra ID · Azure*

A valid identity tells an MCP server who is calling. Granting access to an AI agent requires answers to three questions. **Who is accountable for the agent? What is its business purpose? Which actions have been approved?**

KuppingerCole's Bind, Govern, Release (BGR) model defines an agent lifecycle around its approved business purpose. Access remains tied to human accountability, approved purpose and observed execution throughout the lifecycle.

This field note maps BGR to a reference architecture built with open-source components, Microsoft Entra ID and Azure. The design is at the early demonstrator stage.

## 1. Architecture

![Four planes showing approval through OpenIDM, identity in Entra ID, enforcement through agentgateway, and execution evidence returning to OwnerLens.](./diagrams/index-1-dd8ed9609b92.svg "Governance architecture")

- **Governance.** OwnerLens, OpenIDM, OpenICF.
- **Identity.** Microsoft Entra ID.
- **Runtime.** agentgateway and a backend API. The gateway runs on Azure Container Apps Consumption without a dedicated database.
- **Evidence.** OpenTelemetry (OTLP), Blob Storage, OwnerLens.

## 2. Bind — accountability and purpose

- **KC principle.** Establish accountability and approve the purpose before granting access.
- **Implementation.** OwnerLens discovery, OpenIDM approvals, OpenICF policy provisioning.

**No accountable owner. No approved purpose. No effective tool access.**

![OwnerLens discovery leads to Agent Owner and Resource Owner review before provisioning. Material changes return to the Agent Owner, and the end of the purpose triggers Release.](./diagrams/index-2-bb45d7930db1.svg "Bind, Govern, Release lifecycle")

## 3. Govern — continuous governance

![diagram](./diagrams/index-3-b3ed03e7b263.svg)

*Implementation mapping of KC's four Govern capabilities.*

- **Authorization.** OpenIDM records approved tools and resource scope. agentgateway enforces that scope and denies access by default.
- **Credentials & Trust.** Entra ID issues separate credentials for the agent and for the gateway’s access to the domain API.
- **Active Control.** agentgateway enforces restrictions. River supplies behavioral risk signals.
- **Audit.** OpenTelemetry exports MCP execution events to the evidence pipeline. OwnerLens uses the events retained in Blob Storage.

![agentgateway authorizes the MCP call, obtains a domain API token from Entra ID, and uses it for the backend REST call.](./diagrams/index-4-4c97d1aa75a1.svg "Domain API token flow")

The agent presents its token to the gateway. The gateway uses its Azure managed identity to obtain a separate app-only token for the domain API.

## 4. Active Control — behavioral risk

The design combines deterministic access controls with behavioral risk assessment. Azure Container Apps Jobs periodically refresh the River model, and the resulting risk signals support governance review.

![diagram](./diagrams/index-5-8257a3adffd6.svg)

## 5. Release — verified removal of access


![diagram](./diagrams/index-6-b30c39a61273.svg)
*End-to-end Azure deployment, event delivery, per-agent backend identity, River integration and rapid revocation still need validation.*


### **Technology stack**

| Product                                                                                                                                       | Purpose                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [OwnerLens Lite](https://github.com/kodevza/ownerlenslite)                                                             | Identity discovery and ownership evidence              |
| [OpenIDM](https://github.com/OpenIdentityPlatform/OpenIDM)                                                             | Governance, lifecycle and approval workflows           |
| [OpenICF](https://github.com/OpenIdentityPlatform/OpenICF)                                                             | Policy provisioning and integration                    |
| [agentgateway](https://github.com/agentgateway/agentgateway)                                                           | MCP gateway and policy enforcement                     |
| [Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/)                                                         | Workload authentication and trust                      |
| [Azure Managed Identity](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview) | Backend authentication                                 |
| [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector)                                   | MCP telemetry and audit evidence                       |
| [River](https://github.com/online-ml/river)                                                                            | Behavioral risk assessment                             |
| [Azure Container Apps](https://azure.microsoft.com/en-us/products/container-apps)                                      | Serverless gateway hosting and periodic model training |
| [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)                                         | Evidence and model persistence                         |
| [Azure Functions](https://azure.microsoft.com/en-us/products/functions)                                                | Example domain API                                     |

### **Governance framework**

[KuppingerCole — Bind, Govern, Release (BGR)](https://www.kuppingercole.com/research/lb81105/bind-govern-release)

*The stack represents the proposed reference architecture, not a fully validated production deployment.*

---

### References

[KuppingerCole BGR](https://www.kuppingercole.com/research/lb81105/bind-govern-release) · [agentgateway](https://agentgateway.dev/docs/standalone/latest/) · [OpenIDM](https://github.com/OpenIdentityPlatform/OpenIDM) · [OpenICF](https://github.com/OpenIdentityPlatform/OpenICF) · [Microsoft Entra Managed Identity](https://learn.microsoft.com/en-us/azure/container-apps/managed-identity) · [OpenTelemetry](https://opentelemetry.io/docs/collector/) · [River](https://github.com/online-ml/river)

<!-- Generated from index.mmd.md by linkedin-mermaid export.sh --astro. -->
