# YFP (Your First Path) - PM Brief

## Context

BrightPath Technologies is a growing company with approximately 150 employees and hires several new people each month across different departments.

Current onboarding processes rely on a combination of:

- Welcome emails
- Shared documents
- Spreadsheets
- HR communications
- Manager communications

As onboarding scales, these activities become fragmented and difficult to track.

---

## Problem Statement

New hires struggle to keep track of onboarding tasks that are spread across multiple systems and communication channels.

As a result:

- Important onboarding steps may be missed
- New hires may feel overwhelmed
- Managers have limited visibility into onboarding progress
- Managers are unable to quickly determine whether onboarding is on track

---

## Goal

Make onboarding easier for everyone at BrightPath Technologies.

Primary beneficiary:

- Newly hired employees

Secondary beneficiary:

- Hiring managers

---

## Target Users

### Primary User

A newly hired employee in any role or department.

### Secondary User

The hiring manager responsible for supporting that employee's onboarding experience.

---

## MVP Success Definition

A successful MVP allows a new hire to:

- See all onboarding tasks in one place
- Easily understand which tasks require immediate attention
- Track overall onboarding progress
- Distinguish between tasks that must be completed before Day 1 and after Day 1

A successful MVP allows a manager to:

- Quickly understand onboarding progress across direct reports
- Identify new hires who may need support
- Add or remove onboarding tasks for individual employees
- Observe onboarding progress updates immediately as employees complete tasks

---

## Product Vision

YFP ("Your First Path") is a browser-based onboarding application that provides a single source of truth for onboarding tasks and progress.

The product helps new hires understand what they need to do next while allowing managers to monitor progress and provide support when needed.

---

## MVP Scope

### Technical Constraints

YFP is:

- Frontend only
- Browser based
- Powered by mock data

The final solution should be easily deployable via Vercel with minimal configuration.

YFP is not:

- Connected to a backend
- Connected to a database
- Connected to external APIs
- Dependent on authentication services

The MVP is optimized for desktop and laptop web browsers. Native mobile experiences are intentionally excluded from MVP scope.

---

## Employee Workflow

YFP will provide an onboarding experience that allows new hires to:

- View all onboarding tasks from a unified dashboard
- View onboarding progress
- Update task status
- Complete onboarding activities

Tasks are organized into three buckets:

### Do Today

Tasks currently requiring action from the employee.

### Do Later

Upcoming onboarding tasks that do not require immediate action.

### Done

Completed onboarding tasks.

Tasks within each bucket are ordered by nearest due date.

Each task may include tags indicating:

### Timing

- Pre-D1
- Post-D1

### Task Type

- Action Required (AR)
- Review

Pre-D1 tasks must be completed before an employee's start date.

Post-D1 tasks remain locked and unavailable until the employee's official start date.

---

## Manager Workflow

Managers can switch into a manager view that provides visibility across all assigned new hires.

Managers can:

- View onboarding progress
- Track onboarding status
- Identify employees requiring support
- Add onboarding tasks for individual employees
- Remove onboarding tasks for individual employees

Changes made by employees should immediately update manager-facing dashboards.

---

## Primary Demo Workflow

The primary workflow demonstrated in the MVP is:

1. Employee views onboarding dashboard.
2. Employee completes an onboarding task.
3. Employee progress updates immediately.
4. User switches to manager view.
5. Manager dashboard reflects updated progress.

This workflow should serve as the core demonstration of product value.

---

## Out of Scope

The following items are intentionally excluded from the MVP:

- Native mobile application
- Reusable onboarding plan templates
- Real authentication
- Real user data
- Real APIs
- Backend services
- Database integration
- Analytics and success metric tracking
- AI-powered features
- AI assistants
- AI-generated recommendations

---

## Assumptions

### Root Cause Assumptions

- Onboarding complexity is caused primarily by tasks being distributed across multiple tools and communication channels.
- Managers lack confidence in onboarding completion because they have insufficient visibility into employee progress.

### User Experience Assumptions

- New hires benefit from a prioritized onboarding experience rather than a chronological list of onboarding activities.
- Organizing work into Do Today, Do Later, and Done buckets reduces cognitive overload and helps employees focus on the most relevant next action.
- Employees are more likely to complete onboarding tasks when progress is visible and centralized.

### Access Assumptions

- New hires receive access to YFP before Day 1 using credentials associated with their personal email.
- YFP can associate pre-hire and employee identities into a single onboarding experience.
- Before Day 1, can only access Pre-D1 tasks.
- Beginning on Day 1, Post-D1 tasks become visible and actionable.

### Stakeholder Assumptions

- An HR manager considers onboarding plan templates a future enhancement. An Engineering manager considers onboarding plan customization a high-priority need.

- Despite this disagreement, YFP prioritizes the experience of new hires because onboarding success depends first on helping employees understand and complete required tasks.

- Manager customization capabilities can be expanded in future iterations.