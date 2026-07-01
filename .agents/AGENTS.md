# Project Sentinel — Agent Guidelines and Rules

## Permanent Engineering Governance Rule

No code or implementation commits may be written in this workspace until the following governance sequence is completely executed:

1. **RFC (Proposal)**: Draft and register a formal Request for Comments (RFC) in the [RFC Registry](../docs/operations/RFC-Registry.md).
2. **Architecture Review Board (ARB) Approval**: Obtain formal sign-off from the Architecture Review Board (ARB) logged in the [ARB Registry](../docs/operations/ARB-Registry.md), with a minimum Architecture Score of **8.0 / 10**.
3. **PRD (Requirements)**: Ensure detailed product requirements are fully specified under `docs/prd/`.
4. **Implementation**: Execute development on a dedicated branch according to the approved architecture.
5. **Code Review**: Run unit and integration tests (`npm run test`) to ensure 100% test pass rate and verify code compliance.
6. **Release Review**: Document migration rollback plans and obtain approval in the [Release Registry](../docs/operations/Release-Management.md).
7. **Post-release Review**: Conduct incident checks, monitor logs, and document performance/cost metrics.
