import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProductListingManagerPage from "../ProductListingManagerPage";

const mockSagaApi = vi.fn();
const mockNavigate = vi.fn();
let resolveUploadRequest;

vi.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({
      user: {
        user: {
          _id: "user-1",
          profileType: "vendor",
        },
      },
    }),
}));

vi.mock("../../hooks/useSagaApi", () => ({
  default: () => mockSagaApi,
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

describe("ProductListingManagerPage", () => {
  beforeEach(() => {
    resolveUploadRequest = null;
    mockNavigate.mockReset();
    mockSagaApi.mockReset();
    mockSagaApi.mockImplementation(({ method, args = [] }) => {
      if (method === "getMyListing") {
        return Promise.resolve({
          data: {
            listing: {
              _id: "listing-1",
              title: "Green Farm",
              products: [
                {
                  name: "Cassava",
                  category: "Fresh Produce",
                  unit: "bag",
                  currency: "NGN",
                  price: 4500,
                  quantityAvailable: 10,
                  images: [],
                },
              ],
            },
          },
        });
      }

      if (method === "uploadListingImages") {
        const [, config] = args;
        if (config?.onUploadProgress) {
          config.onUploadProgress({ loaded: 50, total: 100 });
        }
        return new Promise((resolve) => {
          resolveUploadRequest = resolve;
        });
      }

      if (method === "updateMyListing") {
        return Promise.resolve({ data: { listing: { _id: "listing-1" } } });
      }

      return Promise.resolve({ data: {} });
    });

    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
  });

  it("uploads images through saga-backed API and previews returned URLs", async () => {
    render(<ProductListingManagerPage />);

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenCalledWith(
        expect.objectContaining({ method: "getMyListing" }),
      );
    });

    const fileInput = screen.getByLabelText(/pictures/i);
    const file = new File(["image-bytes"], "sample.png", {
      type: "image/png",
    });

    await userEvent.upload(fileInput, file);

    expect(await screen.findByText(/uploading 1 image/i)).toBeInTheDocument();

    resolveUploadRequest({
      data: {
        files: [{ url: "/uploads/listings/sample.png" }],
      },
    });

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenCalledWith(
        expect.objectContaining({ method: "uploadListingImages" }),
      );
    });

    expect(screen.getByRole("img", { name: /product 1/i })).toHaveAttribute(
      "src",
      "/uploads/listings/sample.png",
    );

    await userEvent.click(screen.getByRole("button", { name: "x" }));
    expect(screen.getByText(/removing thumbnail/i)).toBeInTheDocument();

    await waitFor(
      () => {
        expect(
          screen.queryByText(/removing thumbnail/i),
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "x" }),
      ).not.toBeInTheDocument();
    });
  });

  it("redirects user to listing setup when listing is missing", async () => {
    mockSagaApi.mockImplementation(({ method }) => {
      if (method === "getMyListing") {
        return Promise.resolve({ data: { listing: null } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<ProductListingManagerPage />);

    expect(
      await screen.findByRole("button", { name: /go to listing setup/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /go to listing setup/i }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/my-listing");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
