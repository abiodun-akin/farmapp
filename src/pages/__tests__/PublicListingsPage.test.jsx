import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicListingsPage from "../PublicListingsPage";

const mockNavigate = vi.fn();
const mockSagaApi = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({
      user: {
        user: {
          _id: "another-user",
        },
      },
    }),
}));

vi.mock("../../layouts/PageLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../../hooks/useSagaApi", () => ({
  default: () => mockSagaApi,
}));

describe("PublicListingsPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSagaApi.mockReset();
    localStorage.setItem("token", "token-1");

    mockSagaApi.mockImplementation(({ method }) => {
      if (method === "getPublicListings") {
        return Promise.resolve({
          data: {
            listings: [
              {
                _id: "listing-1",
                title: "Premium Cassava",
                description: "Fresh and featured",
                owner: {
                  name: "Vendor One",
                  profileType: "vendor",
                },
                featured: true,
                ownerPerformanceScore: 90,
                products: [
                  {
                    name: "Cassava",
                    currency: "NGN",
                    price: 4500,
                    unit: "bag",
                    quantityAvailable: 10,
                    description: "Large bags",
                    images: ["/uploads/listings/cassava.png"],
                  },
                ],
                location: {
                  location: "Ikeja",
                  state: "Lagos",
                  country: "Nigeria",
                  latitude: "6.6",
                  longitude: "3.3",
                },
              },
            ],
          },
        });
      }

      if (method === "createListingMessageContext") {
        return Promise.resolve({ data: { matchId: "match-1" } });
      }

      return Promise.resolve({ data: {} });
    });
  });

  it("starts a message thread from the public listing card", async () => {
    render(<PublicListingsPage />);

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenCalledWith(
        expect.objectContaining({ method: "getPublicListings" }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /message/i }));

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "createListingMessageContext",
          args: ["listing-1"],
        }),
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/messages", {
        state: { matchId: "match-1" },
      });
    });
  });

  it("opens the location modal from the public listing card", async () => {
    render(<PublicListingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Premium Cassava")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /view location/i }));

    expect(screen.getByText(/seller location/i)).toBeInTheDocument();
    expect(screen.getByTitle("seller-location-map")).toBeInTheDocument();
  });
});
