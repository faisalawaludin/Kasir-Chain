
export const formatCurrency = (amount: number): string => {
  return `Rp${amount.toLocaleString('id-ID')}`;
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
