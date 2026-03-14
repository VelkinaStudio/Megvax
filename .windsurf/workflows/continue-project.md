---
description: Continue working on MEGVAX — read context, check tasks, start dev server, pick up where left off
---

# Continue MEGVAX Project

## 1. Load Context
1. Read `.windsurf/rules/megvax-project.md` for project rules and priorities
2. Check if `TASKS.md` exists in project root — if yes, resume from there
3. Read `HANDOFF.md` for current project state and known issues

## 2. Start Dev Server
// turbo
1. Run `npm run dev` to start the development server

## 3. Assess Current State
1. Open browser preview at http://localhost:3000
2. Navigate through dashboard pages (`/app/dashboard`, `/app/campaigns`, etc.)
3. Identify visual issues, broken features, or missing functionality

## 4. Work on Highest Priority
Priority order:
1. **Fix bugs/broken features** in user dashboard
2. **Complete incomplete dashboard features** (missing states, workflows)
3. **Improve dashboard UX** (interactions, feedback, edge cases)
4. **Admin dashboard** improvements
5. **Marketing pages** visual polish (only when dashboard is solid)

## 5. Before Finishing
1. Run `npm run build` to verify no build errors
2. Run `npm run lint` to check for issues
3. Update or delete `TASKS.md` based on completion
4. Do NOT create session summary files
