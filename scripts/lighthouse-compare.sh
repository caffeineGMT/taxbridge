#!/bin/bash
# Lighthouse Performance Comparison Script
# Compares baseline vs current production metrics

BASELINE="/Users/michaelguo/hivemind-projects/cross-border-tax/docs/lighthouse/lighthouse-baseline.report.json"
CURRENT="/Users/michaelguo/hivemind-projects/cross-border-tax/docs/lighthouse/lighthouse-regression-check.report.json"

echo "==================================================================="
echo "🚦 LIGHTHOUSE PERFORMANCE COMPARISON"
echo "==================================================================="
echo ""

if [ ! -f "$BASELINE" ] || [ ! -f "$CURRENT" ]; then
  echo "❌ Error: Baseline or current report not found"
  exit 1
fi

# Function to compare metrics
compare_metric() {
  local name="$1"
  local baseline_val="$2"
  local current_val="$3"
  local threshold="$4"
  local unit="$5"
  
  # Calculate difference
  diff=$(echo "$current_val - $baseline_val" | bc)
  
  # Determine status emoji
  if (( $(echo "$diff < 0" | bc -l) )); then
    status="✅ IMPROVED"
  elif (( $(echo "$diff == 0" | bc -l) )); then
    status="➡️ SAME"
  else
    status="⚠️ WORSE"
  fi
  
  # Check threshold
  threshold_status=""
  if [ ! -z "$threshold" ]; then
    if (( $(echo "$current_val < $threshold" | bc -l) )); then
      threshold_status="🟢 PASS"
    else
      threshold_status="🔴 FAIL"
    fi
  fi
  
  printf "%-30s | %8s | %8s | %15s | %10s\n" \
    "$name" \
    "${baseline_val}${unit}" \
    "${current_val}${unit}" \
    "$status" \
    "$threshold_status"
}

echo "Metric                         | Baseline | Current  | Change          | Threshold"
echo "-------------------------------+----------+----------+-----------------+-----------"

# Extract and compare metrics
baseline_perf=$(jq -r '.categories.performance.score * 100' "$BASELINE")
current_perf=$(jq -r '.categories.performance.score * 100' "$CURRENT")
compare_metric "Performance Score" "$baseline_perf" "$current_perf" "90" "%"

baseline_lcp=$(jq -r '.audits["largest-contentful-paint"].numericValue / 1000' "$BASELINE")
current_lcp=$(jq -r '.audits["largest-contentful-paint"].numericValue / 1000' "$CURRENT")
compare_metric "LCP (Largest Contentful Paint)" "$baseline_lcp" "$current_lcp" "2.5" "s"

baseline_cls=$(jq -r '.audits["cumulative-layout-shift"].numericValue' "$BASELINE")
current_cls=$(jq -r '.audits["cumulative-layout-shift"].numericValue' "$CURRENT")
compare_metric "CLS (Cumulative Layout Shift)" "$baseline_cls" "$current_cls" "0.1" ""

baseline_fcp=$(jq -r '.audits["first-contentful-paint"].numericValue / 1000' "$BASELINE")
current_fcp=$(jq -r '.audits["first-contentful-paint"].numericValue / 1000' "$CURRENT")
compare_metric "FCP (First Contentful Paint)" "$baseline_fcp" "$current_fcp" "" "s"

baseline_si=$(jq -r '.audits["speed-index"].numericValue / 1000' "$BASELINE")
current_si=$(jq -r '.audits["speed-index"].numericValue / 1000' "$CURRENT")
compare_metric "Speed Index" "$baseline_si" "$current_si" "" "s"

baseline_tbt=$(jq -r '.audits["total-blocking-time"].numericValue' "$BASELINE")
current_tbt=$(jq -r '.audits["total-blocking-time"].numericValue' "$CURRENT")
compare_metric "TBT (Total Blocking Time)" "$baseline_tbt" "$current_tbt" "200" "ms"

baseline_tti=$(jq -r '.audits.interactive.numericValue / 1000' "$BASELINE")
current_tti=$(jq -r '.audits.interactive.numericValue / 1000' "$CURRENT")
compare_metric "TTI (Time to Interactive)" "$baseline_tti" "$current_tti" "" "s"

echo ""
echo "==================================================================="
echo "📊 CATEGORY SCORES (Current)"
echo "==================================================================="
jq -r '
  "Performance:    " + (.categories.performance.score * 100 | tostring) + "%",
  "Accessibility:  " + (.categories.accessibility.score * 100 | tostring) + "%",
  "Best Practices: " + (.categories["best-practices"].score * 100 | tostring) + "%",
  "SEO:            " + (.categories.seo.score * 100 | tostring) + "%"
' "$CURRENT"

echo ""
echo "==================================================================="
echo "✅ THRESHOLD COMPLIANCE"
echo "==================================================================="

# Check all thresholds
lcp_check=$(echo "$current_lcp < 2.5" | bc)
cls_check=$(echo "$current_cls < 0.1" | bc)
perf_check=$(echo "$current_perf >= 90" | bc)

if [ "$lcp_check" -eq 1 ] && [ "$cls_check" -eq 1 ] && [ "$perf_check" -eq 1 ]; then
  echo "🎉 ALL THRESHOLDS PASSED - Performance is EXCELLENT!"
else
  echo "⚠️ Some thresholds not met - review performance issues"
fi

echo ""
