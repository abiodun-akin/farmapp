import * as Form from "@radix-ui/react-form";
import { Button, Link, Text, TextArea } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ErrorDisplay from "../components/ErrorDisplay";
import {
  applyAgentRequest,
  clearAgentActionState,
  fetchAgentStatusRequest,
} from "../redux/slices/agentSlice";
import "./AgentApplicationForm.css";

/**
 * Agent Application Form
 * Allows users to apply to become agents and earn rebates
 */
const AgentApplicationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const {
    data: agentStatus,
    loading,
    error,
    applyLoading,
    applyError,
    applySuccess,
  } = useSelector((state) => state.agent);
  const [validationError, setValidationError] = useState(null);

  const derivedAgent = agentStatus?.agent || {};
  const currentAgentStatus =
    derivedAgent.status ||
    agentStatus?.agentStatus ||
    user?.agentStatus ||
    "none";
  const isApprovedAgent =
    Boolean(
      derivedAgent.isAgent ||
      agentStatus?.isAgent ||
      user?.isAgent ||
      currentAgentStatus === "approved",
    ) && currentAgentStatus === "approved";

  useEffect(() => {
    if (user) {
      dispatch(fetchAgentStatusRequest());
    }

    return () => {
      dispatch(clearAgentActionState());
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (!applySuccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/agent-earnings");
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [applySuccess, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));

    if (!data.motivation || data.motivation.length < 20) {
      setValidationError("Motivation must be at least 20 characters");
      return;
    }

    if (!data.contactPhone) {
      setValidationError("Contact phone is required");
      return;
    }

    setValidationError(null);
    dispatch(
      applyAgentRequest({
        motivation: data.motivation,
        contactPhone: data.contactPhone,
      }),
    );
  };

  // If already approved agent
  if (isApprovedAgent) {
    return (
      <div className="agent-application-container">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back
        </button>
        <div className="agent-success-card">
          <h2>You're Already an Agent! ✓</h2>
          <p>
            You have been approved as an agent and can start earning through
            referrals.
          </p>
          <Button
            onClick={() => navigate("/agent-earnings")}
            style={{ backgroundColor: "var(--color-pry-900)", color: "white" }}
          >
            View Your Earnings Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // If application pending
  if (currentAgentStatus === "pending") {
    return (
      <div className="agent-application-container">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back
        </button>
        <div className="agent-pending-card">
          <h2>Application Under Review</h2>
          <p>
            Your agent application is currently being reviewed by our admin
            team. You'll be notified once we've made a decision.
          </p>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "gray" }}>
            Expected review time: 1-2 business days
          </p>
        </div>
      </div>
    );
  }

  // Show error if initial status fetch failed
  if (error && !agentStatus) {
    return (
      <div className="agent-application-container">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back
        </button>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <ErrorDisplay
            error={error}
            errorCode={
              error.includes("verification") ? "EMAIL_NOT_VERIFIED" : undefined
            }
            onRetry={() => window.location.reload()}
            showDismiss={false}
          />
        </div>
      </div>
    );
  }

  if (loading && !agentStatus) {
    return (
      <div className="agent-application-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="agent-application-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaArrowLeft /> Back
      </button>

      <div className="agent-form-wrapper">
        <div className="agent-form-header">
          <h1>Become an Agent</h1>
          <p>
            Earn rebates by referring farmers and vendors to FarmConnect. Share
            your unique promo codes and watch your earnings grow!
          </p>
        </div>

        <div className="agent-benefits">
          <h3>Benefits of Being an Agent:</h3>
          <ul>
            <li>Earn rebates on every successful referral</li>
            <li>Create and share unlimited promo codes</li>
            <li>Track your earnings and withdrawals</li>
            <li>Get dedicated support from our team</li>
            <li>Access exclusive agent resources</li>
          </ul>
        </div>

        <Form.Root onSubmit={handleSubmit}>
          {(validationError || applyError || error) && (
            <div className="error-message">
              {validationError || applyError || error}
            </div>
          )}
          {applySuccess && (
            <div className="success-message">
              Application submitted successfully! Redirecting...
            </div>
          )}

          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            <Form.Field
              name="motivation"
              style={{ display: "grid", gap: "var(--space-1)" }}
            >
              <Form.Label asChild>
                <Text size="2" weight="bold">
                  Why do you want to be an agent? *
                </Text>
              </Form.Label>
              <Form.Control asChild>
                <TextArea
                  placeholder="Tell us about your interest in becoming an agent, your network, and why you'd be great at this role..."
                  minLength={20}
                  maxLength={1500}
                  required
                  style={{ minHeight: "120px" }}
                />
              </Form.Control>
              <Form.Message match="valueMissing" asChild>
                <Text size="1" color="red">
                  Please tell us your motivation
                </Text>
              </Form.Message>
              <Form.Message match="tooShort" asChild>
                <Text size="1" color="red">
                  Motivation must be at least 20 characters
                </Text>
              </Form.Message>
            </Form.Field>

            <Form.Field
              name="contactPhone"
              style={{ display: "grid", gap: "var(--space-1)" }}
            >
              <Form.Label asChild>
                <Text size="2" weight="bold">
                  Contact Phone *
                </Text>
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="tel"
                  placeholder="+234 (0) 123 456 7890"
                  required
                  style={{
                    padding: "12px",
                    fontSize: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </Form.Control>
              <Form.Message match="valueMissing" asChild>
                <Text size="1" color="red">
                  Please provide a contact phone
                </Text>
              </Form.Message>
            </Form.Field>

            <div className="terms-agreement">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                required
                style={{ marginRight: "8px" }}
              />
              <label htmlFor="terms">
                I agree to the <Link href="#">Agent Agreement and Terms</Link>
              </label>
            </div>

            <Form.Submit asChild>
              <Button
                disabled={applyLoading}
                size="3"
                style={{
                  marginTop: "var(--space-3)",
                  backgroundColor: "var(--color-pry-900)",
                  color: "var(--color-white)",
                  cursor: applyLoading ? "not-allowed" : "pointer",
                }}
              >
                {applyLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </Form.Submit>
          </div>
        </Form.Root>
      </div>
    </div>
  );
};

export default AgentApplicationForm;
