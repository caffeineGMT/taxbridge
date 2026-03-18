import { initConferenceLeadsTable } from '../lib/conferences/leads';

console.log('Migrating conference_leads table...');
initConferenceLeadsTable();
console.log('Done! conference_leads table created with indexes.');
