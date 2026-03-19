/**
 * Partner Status Badge Component
 */

interface Props {
  status: 'pending' | 'approved' | 'rejected' | 'paid';
}

export function PartnerStatusBadge({ status }: Props) {
  const styles = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const labels = {
    pending: 'Pending',
    approved: 'Active',
    rejected: 'Rejected',
    paid: 'Paid',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
