// Format currency for Sri Lankan Rupees
export const formatCurrency = (amount) => {
  return `Rs. ${parseFloat(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Format currency without symbol (for calculations)
export const formatAmount = (amount) => {
  return parseFloat(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};




