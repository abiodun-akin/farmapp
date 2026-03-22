import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MatchesPage from "../MatchesPage";

const mockNavigate = vi.fn();
const mockSagaApi = vi.fn();

vi.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({
      user: {
        user: {
          profileType: "vendor",
        },
      },
    }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../hooks/useSubscriptionStatus", () => ({
  default: () => ({
    statusType: "active",
    subscriptionLoading: false,
  }),
}));

vi.mock("../../hooks/useSagaApi", () => ({
  default: () => mockSagaApi,
}));

describe("MatchesPage filters", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSagaApi.mockReset();

    mockSagaApi.mockResolvedValue({
      data: {
        matches: [],
      },
    });
  });

  it("loads matches initially without country/state filters", async () => {
    render(<MatchesPage />);

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenCalled();
    });

    expect(mockSagaApi).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "userApi",
        method: "getMatches",
        args: [{}],
      })
    );
  });

  it("sends selected country/state filters to getMatches", async () => {
    render(<MatchesPage />);

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenCalledTimes(1);
    });

    const countrySelect = screen.getByRole("combobox");
    const stateInput = screen.getByPlaceholderText("Filter by state/region");

    fireEvent.change(countrySelect, { target: { value: "Nigeria" } });
    fireEvent.change(stateInput, { target: { value: "Lagos" } });

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenLastCalledWith(
        expect.objectContaining({
          service: "userApi",
          method: "getMatches",
          args: [{ country: "Nigeria", state: "Lagos" }],
        })
      );
    });
  });

  it("clears filters and re-queries matches", async () => {
    render(<MatchesPage />);

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenCalledTimes(1);
    });

    const countrySelect = screen.getByRole("combobox");
    const stateInput = screen.getByPlaceholderText("Filter by state/region");

    fireEvent.change(countrySelect, { target: { value: "Ghana" } });
    fireEvent.change(stateInput, { target: { value: "Accra" } });

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenLastCalledWith(
        expect.objectContaining({
          args: [{ country: "Ghana", state: "Accra" }],
        })
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear Filters" }));

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenLastCalledWith(
        expect.objectContaining({
          service: "userApi",
          method: "getMatches",
          args: [{}],
        })
      );
    });
  });
});
