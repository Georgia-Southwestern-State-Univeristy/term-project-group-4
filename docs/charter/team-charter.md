# Team Charter
## Smart Packing Checklist Generator

---

### Roles & Responsibilities

#### Project Manager / Scrum Master

- **Primary:** Heather Hawn  
- **Backup:** Nareenchowdary Rayapati  
- Coordinates deadlines and deliverables  
- Schedules meetings and sets agendas  
- Ensures work does not stall silently  
- Facilitates discussion when priorities or scope are unclear  

#### Lead Developer / Architect

- **Primary:** Jason Parrish  
- **Backup:** Nareenchowdary Rayapati  
- Maintains architectural consistency  
- Owns architectural decisions and ADR creation  
- Reviews changes with architectural impact  
- Pushes back on shortcuts that threaten maintainability or scope  

#### DevOps / QA

- **Primary:** Nareenchowdary Rayapati  
- **Backup:** Heather Hawn  
- Maintains repository health and GitHub workflow  
- Enforces branch, pull request, and review discipline  
- Owns testing and CI/CD decisions if introduced  

#### Documentation Lead

- **Primary:** Heather Hawn  
- **Backup:** Jason Parrish  
- Maintains README, ADRs, and project documentation  
- Ensures decisions and assumptions are written and discoverable  
- Keeps onboarding materials clear and up to date  

### Communication Plan & Meeting Cadence

- **Primary communication channel:** Microsoft Teams  
- **Weekly meeting:** Weekly Teams call on Mondays  
- **Ongoing technical communication:**
    - GitHub pull request comments are the primary method for code review discussion
    - Architectural or design-impacting discussions are typically summarized in PR comments
    - Decisions made in chat that affect implementation should be reflected in PR descriptions or documentation

### Definition of “Done”

Work is considered **done** only when:

- Changes are made on a feature branch (no direct commits to `main`)  
- A pull request is opened with a clear description  
- At least one teammate reviews the pull request  
- Requested changes are addressed  
- Code builds and basic validation or tests pass, as applicable  
- The pull request is merged into `main`  

### Decision-Making Process

- Day-to-day implementation decisions are made by the contributor closest to the work  
- Decisions that affect architecture, scope, or long-term maintainability are discussed as a team  
- Significant architectural decisions should be documented using Architecture Decision Records (ADRs) before or alongside implementation when possible
- If consensus cannot be reached:
    1. The team references documented goals, constraints, and ADRs  
    2. The Lead Developer / Architect makes the final decision  
    3. The rationale is documented for future reference  

### Contribution Expectations & Accountability

- All team members are expected to contribute consistently and visibly  
- Work should be shared early to avoid last-minute integration risks  
- Code ownership is shared. No portion of the system belongs permanently to a single individual  
- If a team member anticipates missing a deadline or becoming unavailable, they must communicate early  
- Significant work should be visible through GitHub issues, pull requests, or documented updates so progress is transparent to the team
- Repeated failure to communicate blockers or meet expectations will be treated as an engineering risk and addressed by the team.

### Team Values

- This team operates with **humility, respect, and trust**. Code reviews focus on improving the system, not judging individuals. Decisions are documented to support a maintainable, long-lived codebase rather than short-term speed.