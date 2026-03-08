import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
import { userApi } from "../api/userApi";
import "./AgentEarnings.css";

/**
 * Agent Earnings Dashboard
 * Shows agent status, wallet balance, promo codes, and withdrawal history
 */
const AgentEarnings = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  useEffect(() => {
    fetchAgentData();
  }, [user]);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAgentStatus?.();
      setAgentData(response?.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load agent data");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    if (!withdrawalAmount || parseInt(withdrawalAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      await userApi.requestWithdrawal?.({ amount: parseInt(withdrawalAmount) });
      alert("Withdrawal request submitted successfully!");
      setWithdrawalAmount("");
      setShowWithdrawalForm(false);
      fetchAgentData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="agent-earnings-container">
        <p>Please log in to view your agent dashboard</p>
      </div>
    );
  }

  if (!agentData?.isAgent) {
    return (
      <div className="agent-earnings-container">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back
        </button>
        <div className="agent-not-approved-card">
          <h2>Not an Agent Yet</h2>
          <p>You haven't been approved as an agent yet. Apply now to get started!</p>
          <Button
            onClick={() => navigate("/apply-agent")}
            style={{ backgroundColor: "var(--color-pry-900)", color: "white" }}
          >
            Apply as Agent
          </Button>
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

  const { agentWallet = {}, promoCodes = [], recentLedger = [], withdrawals = [] } = agentData;
  const wallet = agentWallet || { availableBalance: 0, lifetimeEarned: 0 };
  const withdrawalThreshold = parseInt(process.env.REACT_APP_AGENT_WITHDRAWAL_THRESHOLD) || 5000;
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
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Submit"}
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
                      Requested: {new Date(wd.requestedAt).toLocaleDateString()}
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

      {/* Recent Referrals */}
      <div className="section">
        <h2>
          <FaHistory /> Recent Referrals
        </h2>
        {recentLedger && recentLedger.length > 0 ? (
          <div className="ledger-list">
            {recentLedger.map((entry) => (
              <Card key={entry._id} className="ledger-card">
                <Flex justify="between" align="center">
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text size="1" color="gray">
                      {entry.source === "signup" ? "New Signup" : "Subscription Renewal"}
                    </Text>
                    <Text weight="bold">+₦{entry.amount?.toLocaleString()}</Text>
                  </Flex>
                  <Text size="1" color="gray">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </Text>
                </Flex>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="empty-state">
            <Text color="gray">No referrals yet. Start sharing your promo codes!</Text>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AgentEarnings;
