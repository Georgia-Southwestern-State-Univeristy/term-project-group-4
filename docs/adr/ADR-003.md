# ADR: Host Beta on Elastic Beanstalk with SQLite on Attached EBS Volume

- Status: Proposed (target: accepted for Week 11 Beta)
- Date: 2026-03-26
- Decision owner: Team (infra owner: Naren)

## Context

The app is a single Node/Express service with integrated auth and API routes. Development currently uses SQLite via `better-sqlite3`. Week 11 needs a deployable hosted environment with persistence and minimal operational overhead.

Constraints:
- Beta scope favors speed and operational simplicity over horizontal scale.
- Team capacity is limited; minimizing new services reduces risk.
- Current production `knexfile.js` config points to PostgreSQL but is not yet functional.

## Decision

For Beta, deploy a single-instance Elastic Beanstalk Node environment and store SQLite data on an attached EBS volume mounted at `/data`.

Implementation intent:
- Update production Knex client to `better-sqlite3`.
- Set `SQLITE_PATH=/data/trips.db` in environment properties.
- Ensure EBS attach/mount is automated for replacement instances.
- Keep EB at one instance; do not enable autoscaling for this architecture.

## Alternatives Considered

### 1. Elastic Beanstalk + RDS PostgreSQL

Pros:
- Better long-term scaling characteristics.
- Managed DB durability and failover options.

Cons:
- Requires additional provisioning and security configuration now.
- Requires code/config shifts to a DB stack not currently used in dev.
- Higher setup and troubleshooting burden for Week 11 timeline.

Decision: Not chosen for Week 11 Beta.

### 2. Keep SQLite on ephemeral instance disk

Pros:
- Fastest setup.

Cons:
- Data loss risk on instance replacement/redeploy.
- Fails persistence requirement.

Decision: Rejected.

### 3. Containers/ECS/Fargate

Pros:
- Flexible deployment model.

Cons:
- Significant complexity overhead for current team and timeline.

Decision: Rejected for Beta.

## Consequences

Positive:
- Minimal changes from existing development model.
- Lower cost/complexity than introducing RDS now.
- Meets persistence requirement if EBS mount automation is correct.

Negative:
- Single-instance architecture; no horizontal scaling.
- Tied to single AZ and volume attachment lifecycle.
- Additional operational check needed for replacement-instance mount behavior.

## Risks and Mitigations

1. Risk: EBS not mounted on app start causes writes to ephemeral storage.
- Mitigation: startup check for `SQLITE_PATH` path accessibility; fail fast if missing.

2. Risk: EB instance replacement loses attach/mount unless automated.
- Mitigation: configure attach/mount in EB `.ebextensions` or platform hooks; run forced replacement test.

3. Risk: Team accidentally enables autoscaling.
- Mitigation: lock min/max capacity to 1 in EB configuration; document as non-negotiable for Beta.

## Acceptance Criteria

- App boots on EB and uses `SQLITE_PATH=/data/trips.db`.
- Migrations run successfully against mounted DB file.
- Workflow login -> create -> save -> reload -> update -> delete succeeds.
- Forced instance replacement test confirms data survives and app remounts volume correctly.

## Follow-up

Week 12+ re-evaluate migration path to RDS/PostgreSQL if:
- multi-instance scaling is required,
- stronger durability/backup requirements emerge,
- or operational overhead of EBS volume handling becomes a blocker.
