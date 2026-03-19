#!/usr/bin/env node
/**
 * Product Hunt Comment SLA Tracker
 *
 * Usage:
 *   node track-comment.js add "username" "comment text" "https://producthunt.com/..."
 *   node track-comment.js respond <comment_id> "your response text"
 *   node track-comment.js stats
 */

const fs = require('fs');
const path = require('path');

const TRACKER_FILE = path.join(__dirname, 'comment-sla-tracker.json');
const SLA_HOURS = 6;

function loadTracker() {
  if (!fs.existsSync(TRACKER_FILE)) {
    return {
      sla_hours: SLA_HOURS,
      launch_date: new Date().toISOString().split('T')[0],
      tracking_start: new Date().toISOString(),
      comments: [],
      response_stats: {
        total_comments: 0,
        responded_within_sla: 0,
        missed_sla: 0,
        average_response_time_minutes: 0
      }
    };
  }
  return JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf8'));
}

function saveTracker(data) {
  fs.writeFileSync(TRACKER_FILE, JSON.stringify(data, null, 2));
}

function addComment(author, commentText, commentUrl) {
  const tracker = loadTracker();
  const now = new Date().toISOString();
  const commentId = `comment_${Date.now()}`;

  const comment = {
    comment_id: commentId,
    author,
    comment_text: commentText,
    comment_url: commentUrl,
    received_at: now,
    responded_at: null,
    response_time_minutes: null,
    within_sla: null,
    response_text: null,
    tags: []
  };

  tracker.comments.push(comment);
  tracker.response_stats.total_comments = tracker.comments.length;

  saveTracker(tracker);

  const deadline = new Date(now);
  deadline.setHours(deadline.getHours() + SLA_HOURS);

  console.log(`✅ Comment added: ${commentId}`);
  console.log(`📅 Received: ${now}`);
  console.log(`⏰ Respond by: ${deadline.toISOString()} (${SLA_HOURS}h SLA)`);
  console.log(`👤 Author: ${author}`);
  console.log(`💬 Comment: ${commentText.substring(0, 100)}...`);

  return commentId;
}

function respondToComment(commentId, responseText) {
  const tracker = loadTracker();
  const comment = tracker.comments.find(c => c.comment_id === commentId);

  if (!comment) {
    console.error(`❌ Comment not found: ${commentId}`);
    return;
  }

  const now = new Date().toISOString();
  const receivedTime = new Date(comment.received_at);
  const respondedTime = new Date(now);
  const responseTimeMinutes = Math.round((respondedTime - receivedTime) / 1000 / 60);
  const withinSla = responseTimeMinutes <= (SLA_HOURS * 60);

  comment.responded_at = now;
  comment.response_time_minutes = responseTimeMinutes;
  comment.within_sla = withinSla;
  comment.response_text = responseText;

  // Recalculate stats
  const respondedComments = tracker.comments.filter(c => c.responded_at);
  tracker.response_stats.responded_within_sla = respondedComments.filter(c => c.within_sla).length;
  tracker.response_stats.missed_sla = respondedComments.filter(c => !c.within_sla).length;
  tracker.response_stats.average_response_time_minutes = Math.round(
    respondedComments.reduce((sum, c) => sum + c.response_time_minutes, 0) / respondedComments.length
  );

  saveTracker(tracker);

  console.log(withinSla ? '✅ WITHIN SLA' : '❌ MISSED SLA');
  console.log(`⏱️  Response time: ${responseTimeMinutes} minutes (${Math.round(responseTimeMinutes / 60 * 10) / 10}h)`);
  console.log(`💬 Your response: ${responseText.substring(0, 100)}...`);
}

function showStats() {
  const tracker = loadTracker();
  const { comments, response_stats } = tracker;

  console.log('\n📊 PRODUCT HUNT COMMENT SLA STATISTICS\n');
  console.log(`Total Comments: ${response_stats.total_comments}`);
  console.log(`Responded: ${comments.filter(c => c.responded_at).length}`);
  console.log(`Pending: ${comments.filter(c => !c.responded_at).length}`);
  console.log(`✅ Within SLA: ${response_stats.responded_within_sla}`);
  console.log(`❌ Missed SLA: ${response_stats.missed_sla}`);
  console.log(`⏱️  Average Response Time: ${response_stats.average_response_time_minutes} minutes`);
  console.log(`🎯 SLA Compliance: ${comments.length > 0 ? Math.round((response_stats.responded_within_sla / comments.filter(c => c.responded_at).length) * 100) : 0}%\n`);

  const pending = comments.filter(c => !c.responded_at);
  if (pending.length > 0) {
    console.log('⚠️  PENDING RESPONSES:\n');
    pending.forEach(comment => {
      const receivedTime = new Date(comment.received_at);
      const deadline = new Date(receivedTime);
      deadline.setHours(deadline.getHours() + SLA_HOURS);
      const now = new Date();
      const timeLeft = Math.round((deadline - now) / 1000 / 60);

      console.log(`ID: ${comment.comment_id}`);
      console.log(`Author: ${comment.author}`);
      console.log(`Time Left: ${timeLeft > 0 ? `${timeLeft} minutes` : `OVERDUE by ${Math.abs(timeLeft)} minutes`}`);
      console.log(`Comment: ${comment.comment_text.substring(0, 80)}...`);
      console.log(`URL: ${comment.comment_url}\n`);
    });
  }
}

function showHelp() {
  console.log(`
Product Hunt Comment SLA Tracker

Usage:
  node track-comment.js add <author> <comment_text> <comment_url>
      Add a new comment to track

  node track-comment.js respond <comment_id> <response_text>
      Mark a comment as responded and calculate SLA compliance

  node track-comment.js stats
      Show SLA statistics and pending comments

  node track-comment.js help
      Show this help message

Examples:
  node track-comment.js add "john_doe" "Love this product!" "https://producthunt.com/..."
  node track-comment.js respond comment_1234567890 "Thank you! We appreciate your feedback."
  node track-comment.js stats
  `);
}

// Main
const command = process.argv[2];

switch (command) {
  case 'add':
    if (process.argv.length < 6) {
      console.error('❌ Usage: node track-comment.js add <author> <comment_text> <comment_url>');
      process.exit(1);
    }
    addComment(process.argv[3], process.argv[4], process.argv[5]);
    break;

  case 'respond':
    if (process.argv.length < 5) {
      console.error('❌ Usage: node track-comment.js respond <comment_id> <response_text>');
      process.exit(1);
    }
    respondToComment(process.argv[3], process.argv[4]);
    break;

  case 'stats':
    showStats();
    break;

  case 'help':
  default:
    showHelp();
    break;
}
