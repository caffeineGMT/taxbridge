# Daily Snapshots Directory

This directory stores daily snapshots of the Landing Page Headline A/B Test results.

## Purpose

Track experiment performance over time to identify trends and ensure statistical validity.

## Files

- `YYYY-MM-DD.json` - Daily snapshot of all variant metrics
- Generated automatically by: `npm run ab:daily`

## Usage

```bash
# Generate today's snapshot
npm run ab:daily

# View trend over time
ls -lh docs/daily-snapshots/
```

## Data Format

Each JSON file contains:
- Variant exposure counts
- Conversion rates
- Statistical significance
- Timestamp

## Retention

Keep all snapshots for the duration of the experiment (March 19 - April 2, 2026).
Archive after experiment concludes.
