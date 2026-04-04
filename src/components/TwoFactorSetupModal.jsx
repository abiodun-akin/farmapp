import { Box, Button, Card, Flex, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";

const TwoFactorSetupModal = ({ onClose, onSuccess, user, sagaApi }) => {
  const [step, setStep] = useState("method"); // method, setup, verify, done
  const [method, setMethod] = useState("authenticator");
  const [setupData, setSetupData] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleMethodSelect = async (selectedMethod) => {
    setMethod(selectedMethod);
    if (selectedMethod === "authenticator") {
      setStep("setup");
      await initiateAuthenticatorSetup();
    } else {
      // Email method - just enable and show recovery codes
      await enableEmailTwoFactor();
    }
  };

  const initiateAuthenticatorSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "initiateTwoFactorSetup",
        args: [{ method: "authenticator" }],
      });
      setSetupData(response?.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to generate QR code",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!totpCode || !/^\d{6}$/.test(totpCode)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "verifyTwoFactorSetup",
        args: [{ totpCode }],
      });
      setRecoveryCodes(response?.data?.recoveryCodes);
      setStep("done");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Invalid code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const enableEmailTwoFactor = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "enableTwoFactor",
      });
      setRecoveryCodes(response?.data?.recoveryCodes);
      setStep("done");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to enable two-factor authentication",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    if (onSuccess) {
      onSuccess({
        enabled: true,
        method,
        recoveryCodes,
      });
    }
    if (onClose) {
      onClose();
    }
  };

  const handleDownloadCodes = () => {
    const text = recoveryCodes.join("\n");
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `farmconnect-recovery-codes-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleEmailCodes = async () => {
    setEmailLoading(true);
    setEmailError("");
    try {
      await sagaApi({
        service: "userApi",
        method: "sendRecoveryCodesEmail",
      });
      setEmailSent(true);
    } catch (err) {
      setEmailError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to send recovery codes email",
      );
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Card
        style={{
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step 1: Choose Method */}
        {step === "method" && (
          <Flex direction="column" gap="4">
            <Text size="5" weight="bold">
              Set Up Two-Factor Authentication
            </Text>
            <Text size="2" color="gray">
              Choose how you want to protect your account
            </Text>

            <Flex direction="column" gap="3" style={{ marginTop: "16px" }}>
              <Button
                onClick={() => handleMethodSelect("authenticator")}
                disabled={loading}
                style={{
                  padding: "16px",
                  textAlign: "left",
                  border: "2px solid #e0e0e0",
                  backgroundColor: "#fafafa",
                  cursor: "pointer",
                }}
              >
                <Flex direction="column" gap="2">
                  <Text weight="bold" size="3">
                    📱 Authenticator App
                  </Text>
                  <Text size="2" color="gray">
                    More secure. Use Google Authenticator, Authy, or Microsoft
                    Authenticator
                  </Text>
                </Flex>
              </Button>

              <Button
                onClick={() => handleMethodSelect("email")}
                disabled={loading}
                style={{
                  padding: "16px",
                  textAlign: "left",
                  border: "2px solid #e0e0e0",
                  backgroundColor: "#fafafa",
                  cursor: "pointer",
                }}
              >
                <Flex direction="column" gap="2">
                  <Text weight="bold" size="3">
                    📧 Email Codes
                  </Text>
                  <Text size="2" color="gray">
                    Receive 6-digit codes via email during login
                  </Text>
                </Flex>
              </Button>
            </Flex>
          </Flex>
        )}

        {/* Step 2: Authenticator Setup */}
        {step === "setup" && setupData && (
          <Flex direction="column" gap="4">
            <Text size="5" weight="bold">
              Scan QR Code
            </Text>
            <Text size="2" color="gray">
              Scan this QR code with your authenticator app
            </Text>

            <Flex justify="center" style={{ padding: "20px" }}>
              {setupData.qrCode && (
                <img
                  src={setupData.qrCode}
                  alt="QR Code"
                  style={{ width: "200px", height: "200px" }}
                />
              )}
            </Flex>

            <Button
              variant="soft"
              onClick={() => setShowSecret(!showSecret)}
              size="2"
            >
              {showSecret ? "Hide" : "Can't Scan?"} Manual Entry Key
            </Button>

            {showSecret && (
              <Card
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "12px",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                <Text size="2">{setupData.secret}</Text>
              </Card>
            )}

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Enter 6-digit code from your app:
              </Text>
              <TextField.Root
                value={totpCode}
                onChange={(e) => {
                  setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                placeholder="000000"
                maxLength="6"
                style={{ textAlign: "center", fontSize: "24px" }}
              />
              {error && (
                <Text color="red" size="2">
                  {error}
                </Text>
              )}
            </Flex>

            <Button
              onClick={handleVerifyTOTP}
              disabled={loading || totpCode.length !== 6}
              style={{ marginTop: "16px" }}
            >
              {loading ? "Verifying..." : "Verify & Enable"}
            </Button>
          </Flex>
        )}

        {/* Step 3: Done */}
        {step === "done" && recoveryCodes && (
          <Flex direction="column" gap="4">
            <Text size="5" weight="bold" color="green">
              ✓ Two-Factor Authentication Enabled
            </Text>

            <Card style={{ backgroundColor: "#f0f7f4", padding: "16px" }}>
              <Flex direction="column" gap="2">
                <Text weight="bold" size="3">
                  Save Your Recovery Codes
                </Text>
                <Text size="2" color="gray">
                  If you lose access to your authenticator app, you can use
                  these codes to login:
                </Text>

                <Box
                  style={{
                    backgroundColor: "white",
                    padding: "12px",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    wordBreak: "break-all",
                    marginTop: "8px",
                  }}
                >
                  {recoveryCodes.join("\n")}
                </Box>

                <Flex direction="column" gap="2" style={{ marginTop: "12px" }}>
                  <Button
                    variant="soft"
                    size="1"
                    onClick={() => {
                      const text = recoveryCodes.join("\n");
                      navigator.clipboard.writeText(text);
                      alert("Codes copied to clipboard");
                    }}
                  >
                    📋 Copy Codes
                  </Button>

                  <Button
                    variant="soft"
                    size="1"
                    onClick={handleDownloadCodes}
                  >
                    ⬇️ Download as File
                  </Button>

                  <Button
                    variant="soft"
                    size="1"
                    onClick={handleEmailCodes}
                    disabled={emailLoading || emailSent}
                  >
                    {emailLoading
                      ? "Sending..."
                      : emailSent
                        ? "✓ Email Queued"
                        : "📧 Send to Email"}
                  </Button>

                  {emailError && (
                    <Text color="red" size="2">
                      {emailError}
                    </Text>
                  )}

                  {emailSent && (
                    <Text color="green" size="2">
                      Recovery codes email has been sent to {user?.email}
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Card>

            <Button onClick={handleDone} size="3">
              Done
            </Button>
          </Flex>
        )}
      </Card>
    </Box>
  );
};

export default TwoFactorSetupModal;
