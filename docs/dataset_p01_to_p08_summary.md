# Dataset Normal P1-P8 Summary

Current core normal dataset after parser v3 topology reparse and profile merge.

## Overall

- Total rows: 84,110
- Columns: 69
- missed_bytes: 0
- IPv6 rows: 0
- Duplicate UID: 0
- Profiles merged: P1-P8
- P9 status: in progress

## Overall Service Distribution

- http: ~36.4%
- dns: ~24.0%
- ssh: ~20.0%
- ssl: ~18.5%
- unknown: ~0.5%
- ntp: ~0.5%

## Overall Direction Distribution

- external_to_internal: ~54.3%
- internal_to_external: ~45.7%

## Profile Roles

| Profile | Rows | Purpose |
|---|---:|---|
| P1 | 6,217 | Mixed baseline normal |
| P2 | 11,608 | HTTPS-heavy outbound normal |
| P3 | 7,630 | Admin SSH normal |
| P4 | 8,622 | Update/package normal |
| P5 | 12,650 | Developer/API/Git normal |
| P6 | 18,230 | Browser/internal web normal |
| P7 | 6,056 | Idle/background endpoint normal |
| P8 | 13,097 | File transfer/backup normal |

## Notes

- All profile CSV files use parser v3 topology-aware direction.
- All core rows have missed_bytes = 0.
- P8 excludes run_001 and run_014-run_018 based on previous QA policy.
- P9 is not included in core yet because it is still under calibration.
