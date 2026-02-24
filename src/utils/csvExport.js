/**
 * CSV Export utility functions
 */

/**
 * Export array of objects to CSV
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Output filename
 * @param {Array} columns - Column names to export (optional, defaults to all keys)
 */
export const exportToCSV = (data, filename, columns = null) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Determine columns
  const keys = columns || Object.keys(data[0]);

  // Create CSV header
  const header = keys.map((key) => `"${key}"`).join(",");

  // Create CSV rows
  const rows = data.map((item) =>
    keys
      .map((key) => {
        const value = item[key];
        // Handle nested objects, arrays, and special characters
        if (value === null || value === undefined) {
          return '""';
        }
        if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  // Combine header and rows
  const csv = [header, ...rows].join("\n");

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format date for CSV
 */
export const formatDateForCSV = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString();
};

/**
 * Prepare users data for CSV export
 */
export const prepareUsersForCSV = (users) => {
  return users.map((user) => ({
    Email: user.email,
    Name: user.name || "-",
    Status: user.isSuspended ? "Suspended" : "Active",
    "Activity Score": user.activityScore || 0,
    "Risk Level": user.riskLevel || "UNKNOWN",
    "Violation Count": user.violationCount || 0,
    "Flagged Messages": user.flaggedMessageCount || 0,
    "Last Login": formatDateForCSV(user.lastLogin),
    "Created At": formatDateForCSV(user.createdAt),
  }));
};

/**
 * Prepare violations data for CSV export
 */
export const prepareViolationsForCSV = (violations) => {
  return violations.map((item) => ({
    Email: item.email,
    "Violation Type": item.violationType,
    Count: item.violationCount || item.flaggedMessageCount || 0,
    Suspended: item.isSuspended ? "Yes" : "No",
    "Suspension Reason": item.suspensionReason || "-",
    "Suspension Date": formatDateForCSV(item.suspensionDate),
  }));
};

/**
 * Prepare messages data for CSV export
 */
export const prepareMessagesForCSV = (messages) => {
  return messages.map((msg) => ({
    Sender: msg.sender || "Unknown",
    Recipient: msg.recipient || "Unknown",
    Content: msg.content ? msg.content.substring(0, 100) : "-",
    "Flag Reason": msg.flagReason || "-",
    "Risk Score": msg.aiAnalysisResult?.riskScore || 0,
    Status: msg.status,
    "Created At": formatDateForCSV(msg.createdAt),
  }));
};

/**
 * Prepare payments data for CSV export
 */
export const preparePaymentsForCSV = (payments) => {
  return payments.map((payment) => ({
    Reference: payment.reference,
    Email: payment.email,
    Plan: payment.plan,
    Amount: `${payment.amount}`,
    Currency: payment.currency || "NGN",
    Status: payment.status,
    "Payment Method": payment.paymentMethod,
    "Subscription ID": payment.subscription_id || "-",
    "Created At": formatDateForCSV(payment.createdAt),
    "Updated At": formatDateForCSV(payment.updatedAt),
  }));
};
