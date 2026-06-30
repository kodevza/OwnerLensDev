---
layout: ../../../layouts/FieldNoteLayout.astro
title: "Field Note: Enriching Entra Workload Identity Evidence with Azure RBAC and Resource Context"
date: 2026-06-30
slug: "entra-rbac-identity-enrichment"
description: "A practical note on enriching Entra service principal and managed identity evidence with Azure RBAC, Azure resources, managed identity home context, and sign-in/activity logs."
warning: "Always verify current Microsoft documentation before treating these notes as implementation guidance."
---

## Entra data alone is not enough

Entra ID gives you the identity object. It does not reliably tell you who is operationally accountable for that identity.

For service principals, the first layer of evidence sits in Entra itself:

- service principal owners
- application owners
- display name
- app display name
- notes
- tags
- custom security attributes
- app roles
- OAuth2 permission grants
- app role assignments
- credentials
- group membership

This is useful, but it is incomplete. A service principal owner may be stale. A display name may reflect the original project name, not the current owning team. A tag may be unmanaged. An application owner may be an administrator or implementer, not the person allowed to accept remediation risk.

That is why Entra data should be enriched with Azure context.


## What the Azure resource snapshot can add

The Azure resource snapshot adds the missing operational layer.

At minimum, collect:

- subscriptions
- resource groups
- Azure resources
- resource tags
- resource identity blocks
- user-assigned managed identities
- Azure RBAC role assignments
- optional Azure Activity Log records

This creates a second evidence graph around the Entra objects.

The most important join is simple:

```text
Entra servicePrincipal.id == Azure roleAssignment.principalId
```

That join tells you where the workload identity has Azure RBAC access.

For managed identities, two more joins matter:

```text
System-assigned MI:
Azure resource.identityPrincipalId == Entra servicePrincipal.id

User-assigned MI:
Azure userAssignedManagedIdentity.principalId == Entra servicePrincipal.id

User-assigned MI consumers:
Azure resource.userAssignedIdentityResourceIds contains userAssignedManagedIdentity.resourceId
```

Those joins turn a flat Entra object into an operational story.

## RBAC is evidence, not ownership

Azure RBAC should not be treated as an authoritative ownership source.

RBAC answers a different question:

> What can this principal access, at which scope, and with which role?

That is not the same as ownership. But it is useful evidence because role assignments expose the operational footprint of the identity.


A role assignment at resource scope gives a strong dependency signal:

```text
this identity probably exists to access this resource
```

A role assignment at resource group scope gives a weaker but still useful context signal:

```text
this identity probably belongs near this workload, landing zone, or platform area
```

A role assignment at subscription or management group scope is usually a risk signal first and an ownership signal second:

```text
this identity has broad access; the owner may be a platform team, automation team, or legacy deployment path
```

## Do not miss group-based RBAC

Some workload identities receive Azure access indirectly through groups.

Direct assignment:

```text
roleAssignment.principalId == servicePrincipal.id
```

Group-based assignment:

```text
roleAssignment.principalType == Group
and groupMembers.groupId == roleAssignment.principalId
and groupMembers.memberId == servicePrincipal.id
```

## Managed identities need Azure context more than normal service principals

Managed identities are awkward if you look only from Entra.

A managed identity appears as a service principal, but its useful ownership evidence usually sits in Azure Resource Manager, not in Entra metadata.

For a system-assigned managed identity, the strongest signal is the parent Azure resource:

```text
resource.identityPrincipalId == managedIdentityServicePrincipal.id
```

For system-assigned MI, the home context is the resource itself.

Example:

```text
Function App -> system-assigned managed identity -> RBAC to Key Vault
```

In that case, do not ask only “who owns the service principal?” Ask:

- Who owns the Function App?


For user-assigned MI, separate two things:

```text
Identity home:
where the user-assigned managed identity resource lives

Identity consumers:
which Azure resources use this identity
```


## How to use logs

Logs should answer runtime questions that static configuration cannot answer.

Logs tell you:

- whether the identity is active
- when it was last used
- what resource it signed into
- what workload behavior it shows
- what credential path is used
- who changed the Azure resource or RBAC assignment
- whether access is stale, broken, or still operational


## What remediation teams actually ask

The output should not be “owner = X”. That is too confident and often wrong.

The useful output is a list of ownership evidence:

```text
Best owner candidate: Team / group / person
Confidence: medium
Evidence:
- system-assigned MI attached to Function App X
- Function App lives in RG Y
- RG has owner tag Z
- identity has Key Vault Secrets User on Key Vault K
- successful MI sign-ins observed in last 14 days
- last resource change done by pipeline P
Risk:
- identity has broader scope than observed usage
```

That is actionable. It gives IAM, GRC, or cloud governance a trail they can use before remediation.

## Common traps

### Treating home RG as final owner

For system-assigned MI, home RG is usually strong context. For user-assigned MI, home RG may only identify the team that manages the identity resource, not every workload using it.

### Ignoring UAMI consumers

A user-assigned managed identity can be reused. If you do not map consumer resources, you will miss operational dependencies.

### Ignoring group-based access

If workload identities are group members, direct RBAC joins understate effective access.

### Using logs without retention awareness

No logs does not always mean no usage. It may mean no retention, no export, or the wrong log table.


## Bottom line

Entra tells you what the workload identity is.

Azure RBAC tells you what it can touch.

Logs tell you whether it is actually alive and who recently operated around it.

None of those signals alone proves ownership. Together they create an evidence trail strong enough to assign the next human decision: confirm owner, validate dependency, reduce scope, rotate credential, remove stale access, or accept remediation risk.
