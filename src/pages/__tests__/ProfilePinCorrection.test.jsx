import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FarmerProfileForm from "../FarmerProfileForm";
import VendorProfileForm from "../VendorProfileForm";

const mockSagaApi = vi.fn();
const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../hooks/useSagaApi", () => ({
  default: () => mockSagaApi,
}));

vi.mock("../../hooks/useSubscriptionStatus", () => ({
  default: () => ({
    statusType: "active",
    subscriptionLoading: false,
  }),
}));

const farmerProfile = {
  profileType: "farmer",
  phone: "+2348000000000",
  country: "Nigeria",
  location: "Ikeja",
  state: "Lagos",
  lga: "Ikeja",
  latitude: "",
  longitude: "",
  farmerDetails: {
    farmingAreas: ["Crop Farming"],
    cropsProduced: ["Maize"],
    animalsRaised: [],
    farmSize: "1-5 hectares",
    yearsOfExperience: "3-5 years",
    certifications: [],
    interests: ["Finding buyers for produce"],
    otherInterests: "",
    additionalInfo: "",
  },
};

const vendorProfile = {
  profileType: "vendor",
  phone: "+2348111111111",
  country: "Nigeria",
  location: "Wuse",
  state: "FCT",
  lga: "Bwari",
  latitude: "51.5072",
  longitude: "0.1276",
  vendorDetails: {
    businessType: "Input Supplier",
    servicesOffered: ["Seeds & Seedlings"],
    yearsInBusiness: "3-5 years",
    certifications: [],
    operatingAreas: [],
    businessRegistration: "",
    offersCredit: false,
    interests: ["Expand customer network"],
    otherInterests: "",
    additionalInfo: "",
  },
};

describe("Profile pin correction", () => {
  beforeEach(() => {
    mockSagaApi.mockReset();
    mockDispatch.mockReset();
    mockNavigate.mockReset();
    vi.spyOn(window, "confirm").mockImplementation(() => true);
  });

  it("supports manual farmer pin correction with live preview and nudge controls", async () => {
    mockSagaApi.mockImplementation(({ method }) => {
      if (method === "getProfile") {
        return Promise.resolve({ data: { profile: farmerProfile } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<FarmerProfileForm />);

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenCalledWith(
        expect.objectContaining({ method: "getProfile" }),
      );
    });

    fireEvent.change(screen.getByLabelText("Latitude"), {
      target: { value: "6.5000" },
    });
    fireEvent.change(screen.getByLabelText("Longitude"), {
      target: { value: "3.3000" },
    });

    expect(
      await screen.findByTitle("manual-pin-preview-farmer"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /move north/i }));
    expect(screen.getByLabelText("Latitude")).toHaveValue(6.5005);
  });

  it("supports manual vendor pin correction with live preview", async () => {
    mockSagaApi.mockImplementation(({ method }) => {
      if (method === "getProfile") {
        return Promise.resolve({ data: { profile: vendorProfile } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<VendorProfileForm />);

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenCalledWith(
        expect.objectContaining({ method: "getProfile" }),
      );
    });

    expect(
      await screen.findByTitle("manual-pin-preview-vendor"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /move west/i }));
    expect(screen.getByLabelText("Longitude")).toHaveValue(0.1271);
  });

  it("prompts vendor on out-of-region coordinates", async () => {
    window.confirm.mockImplementation(() => true);

    mockSagaApi.mockImplementation(({ method }) => {
      if (method === "getProfile") {
        return Promise.resolve({ data: { profile: vendorProfile } });
      }
      if (method === "completeVendorProfile") {
        return Promise.resolve({ data: { profile: vendorProfile } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<VendorProfileForm />);

    await waitFor(() => {
      expect(mockSagaApi).toHaveBeenCalledWith(
        expect.objectContaining({ method: "getProfile" }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /complete profile/i }));

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringMatching(/outside supported region/i),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
