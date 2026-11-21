export type Severity = 'High' | 'Medium' | 'Low';

export interface Finding {
  id: string;
  title: string;
  resourceId: string;
  resourceType: 'EC2' | 'EBS';
  severity: Severity;
  savings: string; // "Savings not estimated"
  description: string;
  recommendation: string;
  evidence?: string;
  icon?: 'server' | 'storage' | 'shield';
}

export interface AnalysisRecord {
  id: string;
  timestamp: string; // ISO date string
  displayDate: string; // e.g. "Nov 21, 2026 · 10:30 AM"
  connectionId: number;
  accountId?: string | null;
  roleArn?: string;
  region?: string;
  resourcesScanned: number;
  ec2Count: number;
  ebsCount: number;
  findings: Finding[];
  aiExplanation?: string;
  aiError?: string;
  status: 'Completed' | 'Partial' | 'Failed';
  persistedLocally: true; // flags "Saved in this browser"
}

const HISTORY_KEY_PREFIX = 'cloudwise.history.';
const MAX_HISTORY_ITEMS = 20;

/**
 * Retrieves browser-persisted analysis history for a given user email.
 * Limited to at most 20 records per DESIGN.md section 11.
 */
export function getAnalysisHistory(email: string): AnalysisRecord[] {
  if (!email) return [];
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY_PREFIX}${email}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_HISTORY_ITEMS);
    }
    return [];
  } catch (err) {
    console.error('Failed to load analysis history from localStorage:', err);
    return [];
  }
}

/**
 * Saves a new completed analysis record to localStorage for the given user email.
 * Prepends the record (newest first) and caps at 20 items.
 */
export function saveAnalysisRecord(email: string, record: AnalysisRecord): void {
  if (!email) return;
  try {
    const current = getAnalysisHistory(email);
    const updated = [record, ...current.filter((r) => r.id !== record.id)].slice(
      0,
      MAX_HISTORY_ITEMS,
    );
    localStorage.setItem(
      `${HISTORY_KEY_PREFIX}${email}`,
      JSON.stringify(updated),
    );
  } catch (err) {
    console.error('Failed to save analysis record to localStorage:', err);
  }
}

/**
 * Clears analysis history for a given user email.
 */
export function clearAnalysisHistory(email: string): void {
  if (!email) return;
  try {
    localStorage.removeItem(`${HISTORY_KEY_PREFIX}${email}`);
  } catch (err) {
    console.error('Failed to clear analysis history from localStorage:', err);
  }
}
