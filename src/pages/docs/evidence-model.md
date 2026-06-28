---
layout: ../../layouts/DocLayout.astro
title: Evidence model
description: How OwnerLens should represent owner evidence without flattening uncertainty.
---

## Core idea

OwnerLens should not produce a naked `owner` field as if that value were authoritative. It should produce owner candidates backed by explicit evidence.

## Evidence record

```json
{
  "targetType": "servicePrincipal",
  "targetId": "00000000-0000-0000-0000-000000000000",
  "candidateType": "group",
  "candidateName": "platform-identity-team",
  "source": "azure-rbac-context",
  "logic": "Group has relevant role assignment on the resource group linked to this identity.",
  "confidence": "low"
}
```

## Confidence is not truth

Confidence is a routing hint. Final remediation still needs human or workflow validation, especially for production systems.

## Signal quality

| Source | Typical role |
|---|---|
| Azure tags | direct routing evidence when discipline exists |
| Entra app owner | useful but often stale or user-based |
| Azure RBAC context | operator/platform team clue |
| MI home resource | strong technical lineage clue |
| CMDB / ServiceNow | business/process ownership clue |
