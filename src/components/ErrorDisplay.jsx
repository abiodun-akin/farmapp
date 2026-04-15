import { Box, Button, Card, Flex, Text } from "@radix-ui/themes";

/**
 * Standardized Error Display Component
 * Provides consistent error handling UI across all pages
 *
 * Props:
 * - error: Error message string
 * - errorCode: Optional error code (e.g., "EMAIL_NOT_VERIFIED")
 * - onRetry: Optional callback for retry button
 * - onDismiss: Optional callback for dismiss button
 * - showRetry: Show retry button (default: true)
 * - showDismiss: Show dismiss button (default: true)
 */
const ErrorDisplay = ({
  error,
  errorCode,
  onRetry,
  onDismiss,
  showRetry = true,
  showDismiss = true,
}) => {
  if (!error) return null;

  // Determine if this is an email verification error
  const isEmailVerificationError =
    errorCode === "EMAIL_NOT_VERIFIED" ||
    error.toLowerCase().includes("email") ||
    error.toLowerCase().includes("verification");

  // Determine if this is a permission/authorization error
  const isAuthError =
    errorCode === "FORBIDDEN" ||
    error.toLowerCase().includes("forbidden") ||
    error.toLowerCase().includes("not authorized") ||
    error.toLowerCase().includes("permission");

  return (
    <Card
      style={{
        background: "#ffebee",
        borderLeft: "4px solid #f44336",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      <Flex direction="column" gap="3">
        {/* Error Header */}
        <Flex gap="2" align="start">
          <Text
            style={{
              fontSize: "20px",
              color: "#f44336",
              marginTop: "4px",
            }}
          >
            ⚠️
          </Text>
          <Flex direction="column" gap="2" style={{ flex: 1 }}>
            <Text weight="bold" size="3" color="red">
              {isEmailVerificationError
                ? "Email Verification Required"
                : isAuthError
                  ? "Access Denied"
                  : "Error"}
            </Text>

            {/* Error Message */}
            <Text size="2" color="red" style={{ lineHeight: "1.5" }}>
              {error}
            </Text>

            {/* Helpful Context */}
            <Box style={{ marginTop: "8px" }}>
              <Text size="1" color="gray" style={{ lineHeight: "1.4" }}>
                {isEmailVerificationError && (
                  <>
                    Please check your inbox for a verification email. If you
                    don't see it, check your spam folder or request a new
                    verification link.
                  </>
                )}
                {isAuthError && !isEmailVerificationError && (
                  <>
                    You may not have permission to access this resource. If you
                    believe this is an error, please contact support.
                  </>
                )}
              </Text>
            </Box>
          </Flex>
        </Flex>

        {/* Action Buttons */}
        <Flex gap="2" justify="end">
          {showDismiss && onDismiss && (
            <Button color="gray" variant="outline" onClick={onDismiss} size="1">
              Dismiss
            </Button>
          )}
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              size="1"
              style={{ backgroundColor: "#1976d2", color: "white" }}
            >
              Try Again
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default ErrorDisplay;
