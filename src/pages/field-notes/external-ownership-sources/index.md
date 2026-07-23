# Field Note: Bringing CMDB Ownership Evidence Into IAM Remediation Workflows

Raw Microsoft Entra and Azure exports are useful for discovery, but they are rarely sufficient for an effective identity governance or remediation workflow.

They can show service principals, managed identities, registered owners, credentials, permissions, RBAC assignments, resource relationships, and recent activity. What they often do not show clearly is who is accountable for approving remediation, confirming business dependency, or accepting operational risk.

That information commonly exists elsewhere:

* ServiceNow CMDB
* an IGA application catalog
* a service registry
* a ticketing workflow
* a cloud resource catalog
* an internal platform inventory
* a manually maintained ownership register

The practical challenge is therefore not just identity discovery. It is correlating technical identity data with documented business ownership and operational evidence.

## Why Raw Identity Data Is Not Enough

A service principal may have an Entra owner, but that owner may be:

* a privileged administration group,
* the engineer who created the application,
* a generic platform team,
* a former project member,
* or an account with no authority to approve remediation.

A managed identity may not have a meaningful owner attribute at all. Its ownership may need to be inferred from:

* the Azure resource using it,
* its resource group or subscription,
* RBAC assignments,
* deployment history,
* activity logs,
* application documentation,
* or the associated CMDB configuration item.

This creates an important distinction:

**Technical association is not the same as accountability.**

The person who created an identity is not necessarily its current owner.
The team operating a resource is not necessarily the risk owner.
The team with RBAC access is not necessarily authorised to approve lifecycle changes.

## A More Useful Ownership Chain

A stronger remediation workflow correlates several evidence sources:

```text
Workload identity
→ Azure resource or application
→ CMDB or service record
→ documented owner or support team
→ RBAC and activity validation
→ remediation decision
```

The CMDB or application catalog can provide the documented business relationship.

Azure and Entra can then provide technical validation:

* Does the identity still exist?
* Which resource or application uses it?
* Which team has administrative access?
* Has it been active recently?
* Are the documented ownership records consistent with actual usage?
* Is the proposed owner technically credible?

This is more valuable than presenting analysts with another raw CSV export.

## CMDB as a Source of Truth

Whether CMDB ownership should be treated as authoritative depends on the governance process behind it.

In mature environments, ServiceNow may be the system of record because cloud resources are created through catalog requests that require:

* a sponsoring business unit,
* an application or service owner,
* a support group,
* a cost centre,
* lifecycle information,
* and approval through a controlled workflow.

In this model, the CMDB contains documented accountability, while Azure activity and RBAC data confirm whether the recorded team still has a real operational relationship with the resource.

In less mature environments, the CMDB may be incomplete or stale. It may contain a nominal owner who cannot confirm dependencies or approve remediation.

For that reason, external ownership records should be treated as evidence with explicit lineage, rather than accepted blindly.

A useful record should retain:

* the identity or resource identifier,
* the recorded owner,
* the source system,
* the source record or CI identifier,
* the last observation or review date,
* the confidence level,
* and a link to the authoritative source.

## Normalisation Before Remediation

Raw exports usually need preparation before they become useful for IGA or remediation processes.

Typical enrichment includes:

* translating GUIDs and application IDs into readable names,
* resolving users, groups, teams, and email addresses,
* linking service principals and managed identities to Azure resources,
* correlating resources with CMDB configuration items,
* filtering inactive, disabled, expired, or out-of-scope identities,
* validating naming standards,
* identifying lifecycle state,
* adding RBAC context,
* adding recent activity evidence,
* and ranking candidate owners.

This preparation layer converts raw identity data into a remediation-ready evidence package.

Instead of asking an analyst to investigate multiple portals manually, the output should answer:

1. What is this identity?
2. Which application or Azure resource depends on it?
3. Who is documented as accountable?
4. Which team currently operates or administers it?
5. What evidence supports that relationship?
6. Is the identity still active?
7. Who can approve the next remediation step?

## Accountability Versus Operational Context

Ownership evidence should separate at least three concepts:

### Accountable owner

The person or group authorised to approve changes, accept risk, or confirm business dependency.

### Operational owner

The team responsible for supporting, deploying, or maintaining the workload.

### Technical evidence

Signals such as RBAC assignments, activity logs, deployment history, tags, and recent operators.

These may point to the same team, but often they do not.

This distinction matters because remediation frequently stalls not because the identity is unknown, but because nobody can confirm who has authority to act.

## Confidence Should Reflect Governance Quality

Confidence should not be based only on whether an ownership field exists.

Use high confidence when:

* ownership is mandatory during onboarding,
* the owner is linked to a controlled workflow,
* ownership changes follow an established process,
* the owner is expected to approve lifecycle or remediation decisions,
* and the record is periodically reviewed.

Use medium confidence when:

* the relationship is useful but indirect,
* such as a support team, cost centre, resource group, platform registry, or service mapping.

Use low confidence when:

* the source is manually maintained,
* the record is old,
* the mapping relies on a display name,
* ownership semantics are unclear,
* or the owner has not been operationally validated.

A CMDB field should not automatically receive high confidence merely because it is stored in an enterprise system.

## Practical Integration Pattern

The cleanest approach is to exchange only the ownership evidence required for correlation and remediation.

A minimal record should contain:

```json
{
  "identityId": "11111111-1111-1111-1111-111111111111",
  "ownerType": "ownerGroup",
  "ownerId": "APP-CRM-Owners",
  "confidence": "high",
  "observedAt": "2026-07-02T08:00:00Z",
  "sourceType": "cmdb",
  "sourceName": "serviceNow",
  "sourceRef": "APP-123",
  "evidenceUrl": "https://servicenow.example.com/app/APP-123"
}
```

Do not export the entire CMDB record.

The evidence should remain:

* narrow,
* deterministic,
* traceable,
* locally reviewable,
* and explainable to both technical and non-technical stakeholders.

## Field Lessons

### Prefer immutable identifiers

Use Entra object IDs, application IDs, Azure resource IDs, and CMDB CI identifiers whenever possible.

Display names are useful for manual review but are weak correlation keys.

### Preserve evidence lineage

Every ownership candidate should remain traceable to the system and record that produced it.

Without evidence lineage, ownership decisions are difficult to defend during audit, certification, or remediation escalation.

### Validate documented ownership

Even authoritative records can become stale.

CMDB ownership should be compared with:

* Azure resource relationships,
* RBAC assignments,
* recent activity,
* deployment records,
* lifecycle state,
* and platform-team knowledge.

### Do not confuse recent activity with ownership

Activity logs can show who operated a resource. They do not prove who is accountable for it.

They are useful as validation evidence, not as automatic ownership assignment.

### Keep the output remediation-oriented

The objective is not to create another asset inventory.

The objective is to reduce the time required to move from:

```text
unknown workload identity
```

to:

```text
credible owner candidate
+ supporting evidence
+ documented source
+ actionable remediation decision
```

## Conclusion

CMDB and cloud-native identity data are not competing sources.

They solve different parts of the problem.

The CMDB provides business and service context.
Entra and Azure provide technical identity, access, resource, and activity evidence.

The strongest workflow combines both.

The value is not another export or another inventory. The value is a defensible ownership decision that allows remediation to proceed.
