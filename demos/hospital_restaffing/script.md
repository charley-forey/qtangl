# Hospital demo walkthrough script

## 0:00-0:30 Cold open

It is 04:11 on a Tuesday morning at a 420-bed regional hospital in the U.S.

Sarah K., a charge-eligible cath-lab nurse with ACLS and PALS, calls out 49 minutes before the day shift.

Marcus, the charge nurse, has to cover the open slot, protect ICU and OR coverage, honor the 10-hour rest rule, avoid pushing anyone past 60 hours this week, and do it without defaulting to the most expensive agency option.

Last quarter the hospital spent $1.41 million on agency labor triggered by these exact staffing cascades.

## 0:30-1:00 Page framing

This is the Qtangl hospital re-staffing demo.

The page starts with the scenario picker, the call-out event card, and a live OR command-center layout.

On the left is the 14-day staffing surface.

On the right is the solve log.

In the middle we compare the deterministic classical pick against the hybrid alternates.

## 1:00-1:45 Fire the call-out

I click “Fire the call-out.”

The backend runs a live CP-SAT solve first.

Then it detects a local repair window around the affected nurses.

Then the page replays a cached QPU trace for the micro-window, so we can show a hardware-backed audit artifact without risking queue delays during the demo.

The key point is honesty.

We are not claiming the hybrid path is faster.

We are claiming it surfaces more feasible alternates and a richer audit trail.

## 1:45-2:30 Candidate review

Here is the classical pick.

And here are the hybrid alternates.

They are all feasible.

They all preserve the required certifications.

But they differ on fairness, fatigue, and cross-ward movement.

That is what the staffing office actually wants to review before locking in overtime or agency.

## 2:30-3:10 Audit drawer

Now I open the audit drawer.

The first tab shows the QUBO snapshot for the repair window.

The second tab shows which constraints were binding.

The third tab shows the cost breakdown.

The fourth tab shows the cached QPU trace, including the measured candidate weights.

And the fifth tab shows the exact scenario metadata needed to reproduce the run.

## 3:10-3:30 Scoreboard and close

Finally, we close on the honest scoreboard.

Manual handling is familiar, but expensive.

Classical is fast and remains the default first step.

Hybrid is slower, but it surfaces multiple feasible alternates the classical run would have discarded.

That is the value proposition.

Qtangl is an auditable hybrid decision surface for staffing problems hospitals already have today.
