# Add "查看详情" button for park role on social training quotas

## Context

The "技术服务情况" page ([ServicePool.jsx](src/pages/ServicePool.jsx)) has a "社会培训" (Social Training) tab showing training quotas in a table. The "操作" (Actions) column currently shows:
- **Council role (理事会)**: "查看" + "审核" buttons (reuses the `quotaDetailOpen` modal)
- **School/Enterprise**: "承接培训" button for pending quotas
- **Park role (园区)**: `-` (no actions at all — falls through to `return '-'`)

A training quota detail modal (`quotaDetailOpen`) already exists and is used by the council role. The user wants the park role to also be able to view training quota details via a "查看详情" button that triggers this modal.

## Changes

### File: `src/pages/ServicePool.jsx`

**Location**: Lines 240–251, the `quotaColumns` action column renderer.

**Change**: Add a condition for `role === 'park'` before the fallback `return '-'`, showing a "查看详情" button that opens the existing `quotaDetailOpen` modal.

```jsx
// Before the final return '-'
if (role === 'park') {
  return <Button size="small" onClick={() => { setQuotaDetailItem(r); setQuotaDetailOpen(true) }}>查看详情</Button>
}
```

## Rationale

- **Reuses existing code**: The `quotaDetailOpen` / `quotaDetailItem` state and the "培训指标详情" modal at line 513 already exist — no new modals needed.
- **Consistent with patterns**: Other pages (ResearchPool, TeachingResource) use the same `setDetailItem + setDetailOpen` pattern for "查看详情" buttons.
- **Minimal change**: Only ~5 lines added to one file, targeting exactly what the user asked.

## Verification

1. Log in as the park role (username: `park`)
2. Navigate to 技术服务情况 → 社会培训 tab
3. Verify a "查看详情" button appears in the 操作 column for each training quota row
4. Click the button and confirm the detail modal opens with quota info (enterprise, title, progress, deadline, etc.)
5. Confirm the modal closes properly
6. Verify other roles (council, school, enterprise) are unaffected
