import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Text, Flex, Card } from "@radix-ui/themes";
import {
  FaArrowLeft,
  FaWallet,
  FaTicketAlt,
  FaMoneyBillWave,
  FaHistory,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import { addToast } from "../redux/slices/toastSlice";
import {
  clearAgentActionState,
  fetchAgentStatusRequest,
  requestWithdrawalRequest,
} from "../redux/slices/agentSlice";
import "./AgentEarnings.css";

/**
 * Agent Earnings Dashboard
 * Shows agent status, wallet balance, promo codes, and withdrawal history
 */
const AgentEarnings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const {
    data: agentData,
    loading,
    error,
    withdrawalLoading,
    withdrawalSuccess,
  } = useSelector((state) => state.agent);
  const [copiedCode, setCopiedCode] = useState(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  const agent = agentData?.agent || {};
  const agentWallet = agent.wallet || agentData?.agentWallet || {};
  const promoCodes = agentData?.codes || agentData?.promoCodes || [];
  const recentLedger = agentData?.recentLedger || [];
  const withdrawals = agentData?.withdrawals || [];
  const agentStatus = agent.status || agentData?.agentStatus || user?.agentStatus || "none";
  const isApprovedAgent = Boolean(
    agent.isAgent
    || agentData?.isAgent
    || user?.isAgent
    || agentStatus === "approved"
  ) && agentStatus === "approved";

  useEffect(() => {
    if (user) {
      dispatch(fetchAgentStatusRequest());
    }

    return () => {
      dispatch(clearAgentActionState());
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (!withdrawalSuccess) {
      return;
    }

    setWithdrawalAmount("");
    setShowWithdrawalForm(false);
    dispatch(clearAgentActionState());
  }, [dispatch, withdrawalSuccess]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleWithdrawalRequest = (e) => {
    e.preventDefault();
    if (!withdrawalAmount || parseInt(withdrawalAmount, 10) <= 0) {
      dispatch(addToast({ message: "Please enter a valid amount", type: "error" }));
      return;
    }

    dispatch(requestWithdrawalRequest({ amount: parseInt(withdrawalAmount, 10) }));
  };

  if (!user) {
    return (
      <div className="agent-earnings-container">
        <p>Please log in to view your agent dashboard</p>
      </div>
    );
  }

  if (!loading && !isApprovedAgent) {
    return (
      <div className="agent-earnings-container">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back
        </button>
        <div className="agent-not-approved-card">
          <h2>{agentStatus === "pending" ? "Application Under Review" : "Not an Agent Yet"}</h2>
          <p>
            {agentStatus === "pending"
              ? "Your agent application is currently under review. You will see your full earnings dashboard once it is approved."
              : "You have not been approved as an agent yet. Apply now to get started."}
          </p>
          {agentStatus !== "pending" && (
            <Button
              onClick={() => navigate("/apply-agent")}
              style={{ backgroundColor: "var(--color-pry-900)", color: "white" }}
            >
              Apply as Agent
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="agent-earnings-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-earnings-container">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  const wallet = agentWallet || { availableBalance: 0, lifetimeEarned: 0 };
  const withdrawalThreshold = Number(import.meta.env.VITE_AGENT_WITHDRAWAL_THRESHOLD || 5000);
  const canWithdraw = wallet.availableBalance >= withdrawalThreshold;

  return (
    <div className="agent-earnings-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaArrowLeft /> Back
      </button>

      <div className="earnings-header">
        <h1>Agent Earnings Dashboard</h1>
        <p>Track your referrals, earnings, and withdrawals</p>
      </div>

      {/* Wallet Cards */}
      <div className="wallet-cards-grid">
        <Card className="wallet-card">
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <FaWallet style={{ color: "var(--color-pry-900)", fontSize: "1.5rem" }} />
              <Text weight="bold" size="2">
                Available Balance
              </Text>
            </Flex>
            <Text size="5" weight="bold" style={{ color: "var(--color-pry-900)" }}>
              ₦{wallet.availableBalance?.toLocaleString() || "0"}
            </Text>
            <Text size="1" color="gray">
              {canWithdraw ? "Ready to withdraw" : `Need ₦${(withdrawalThreshold - (wallet.availableBalance || 0)).toLocaleString()} more`}
            </Text>
          </Flex>
        </Card>

        <Card className="wallet-card">
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <FaMoneyBillWave style={{ color: "var(--color-pry-900)", fontSize: "1.5rem" }} />
              <Text weight="bold" size="2">
                Lifetime Earned
              </Text>
            </Flex>
            <Text size="5" weight="bold" style={{ color: "var(--color-pry-900)" }}>
              ₦{wallet.lifetimeEarned?.toLocaleString() || "0"}
            </Text>
            <Text size="1" color="gray">
              Total earnings from referrals
            </Text>
          </Flex>
        </Card>
      </div>

      <div className="wallet-cards-grid">
        <Card className="wallet-card">
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <FaHistory style={{ color: "var(--color-pry-900)", fontSize: "1.5rem" }} />
              <Text weight="bold" size="2">
                Locked Balance
              </Text>
            </Flex>
            <Text size="5" weight="bold" style={{ color: "var(--color-pry-900)" }}>
              ₦{wallet.lockedBalance?.toLocaleString() || "0"}
            </Text>
            <Text size="1" color="gray">
              Awaiting withdrawal processing
            </Text>
          </Flex>
        </Card>

        <Card className="wallet-card">
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <FaMoneyBillWave style={{ color: "var(--color-pry-900)", fontSize: "1.5rem" }} />
              <Text weight="bold" size="2">
                Lifetime Withdrawn
              </Text>
            </Flex>
            <Text size="5" weight="bold" style={{ color: "var(--color-pry-900)" }}>
              ₦{wallet.lifetimeWithdrawn?.toLocaleString() || "0"}
            </Text>
            <Text size="1" color="gray">
              Total payouts processed
            </Text>
          </Flex>
        </Card>
      </div>

      {/* Promo Codes Section */}
      <div className="section">
        <h2>
          <FaTicketAlt /> Your Promo Codes
        </h2>
        {promoCodes && promoCodes.length > 0 ? (
          <div className="codes-list">
            {promoCodes.map((code) => (
              <Card key={code._id} className="code-card">
                <Flex justify="between" align="center" gap="3">
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text weight="bold" size="2" style={{ fontFamily: "monospace" }}>
                      {code.code}
                    </Text>
                    <Text size="1" color="gray">
                      {code.rebateType === "fixed"
                        ? `₦${code.rebateValue} per referral`
                        : `${code.rebateValue}% rebate`}
                    </Text>
                    <Text size="1" color="gray">
                      Used: {code.redemptionCount || 0}
                      {code.maxRedemptions ? `/${code.maxRedemptions}` : ""} times
                    </Text>
                  </Flex>
                  <Button
                    onClick={() => handleCopyCode(code.code)}
                    variant="outline"
                    style={{ minWidth: "100px" }}
                  >
                    {copiedCode === code.code ? (
                      <>
                        <FaCheck /> Copied
                      </>
                    ) : (
                      <>
                        <FaCopy /> Copy
                      </>
                    )}
                  </Button>
                </Flex>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="empty-state">
            <Text color="gray">No promo codes yet. Contact admin to create one.</Text>
          </Card>
        )}
      </div>

      {/* Withdrawal Section */}
      <div className="section">
        <h2>Withdrawals</h2>
        {!showWithdrawalForm ? (
          <Button
            onClick={() => setShowWithdrawalForm(true)}
            disabled={!canWithdraw}
            style={{
              backgroundColor: canWithdraw ? "var(--color-pry-900)" : "#ccc",
              color: "white",
              marginBottom: "1rem",
            }}
          >
            Request Withdrawal
          </Button>
        ) : (
          <form onSubmit={handleWithdrawalRequest} className="withdrawal-form">
            <input
              type="number"
              placeholder="Amount (NGN)"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              min={withdrawalThreshold}
              max={wallet.availableBalance}
            />
            <Flex gap="2">
              <Button type="submit" disabled={withdrawalLoading}>
                {withdrawalLoading ? "Processing..." : "Submit"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowWithdrawalForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </Flex>
          </form>
        )}

        {withdrawals && withdrawals.length > 0 ? (
          <div className="withdrawals-list">
            {withdrawals.map((wd) => (
              <Card key={wd._id} className="withdrawal-card">
                <Flex justify="between" align="center">
                  <Flex direction="column" gap="1">
                    <Text weight="bold">₦{wd.amount?.toLocaleString()}</Text>
                    <Text size="1" color="gray">
                      Status: <strong>{wd.status}</strong>
                    </Text>
                    <Text size="1" color="gray">
                      Requested: {wd.createdAt ? new Date(wd.createdAt).toLocaleDateString() : ""}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </div>
        ) : !showWithdrawalForm ? (
          <Card className="empty-state">
            <Text color="gray">No withdrawal requests yet</Text>
          </Card>
        ) : null}
      </div>

      <div className="section">
        <h2>
          <FaHistory /> Recent Earnings Activity
        </h2>
        {recentLedger.length > 0 ? (
          <div className="ledger-list">
            {recentLedger.map((entry) => (
              <Card key={entry._id} className="ledger-card">
                <Flex justify="between" align="center" gap="3" wrap="wrap">
                  <Flex direction="column" gap="1">
                    <Text weight="bold" size="2">
                      {entry.promoCode || "Referral rebate"}
                    </Text>
                    <Text size="1" color="gray">
                      {entry.source || "activity"} • {entry.status || "accrued"}
                    </Text>
                  </Flex>
                  <Flex direction="column" align="end" gap="1">
                    <Text weight="bold" size="3" style={{ color: "var(--color-pry-900)" }}>
                      ₦{Number(entry.amount || 0).toLocaleString()}
                    </Text>
                    <Text size="1" color="gray">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ""}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="empty-state">
            <Text color="gray">No referral earnings recorded yet.</Text>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AgentEarnings;
