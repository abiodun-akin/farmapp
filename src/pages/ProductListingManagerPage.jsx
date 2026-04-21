import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorDisplay from "../components/ErrorDisplay";
import {
  AFRICAN_CURRENCIES,
  AGRIC_CATEGORIES,
  PRODUCT_UNITS,
} from "../data/marketplaceOptions";
import useSagaApi from "../hooks/useSagaApi";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { canAccessFeature } from "../utils/subscriptionHelper";
import "./ProductListingManagerPage.css";

const defaultProduct = {
  name: "",
  description: "",
  category: "",
  unit: "",
  price: "",
  quantityAvailable: "",
  currency: "NGN",
  images: [],
};

const createLocalPreview = (file) => {
  if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    return Promise.resolve(URL.createObjectURL(file));
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

const ProductListingManagerPage = () => {
  const sagaApi = useSagaApi();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [products, setProducts] = useState([{ ...defaultProduct }]);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadStateByProduct, setUploadStateByProduct] = useState({});
  const [localPreviewByProduct, setLocalPreviewByProduct] = useState({});
  const [removingImageUrls, setRemovingImageUrls] = useState([]);
  const removalTimersRef = useRef({});
  const uploadTimersRef = useRef({});

  const { statusType: subscriptionStatusType, subscriptionLoading } =
    useSubscriptionStatus();

  const canManageListings = useMemo(
    () => canAccessFeature(subscriptionStatusType, "core"),
    [subscriptionStatusType],
  );

  const populateForm = (entry) => {
    if (!entry) {
      setProducts([{ ...defaultProduct }]);
      return;
    }

    setProducts(
      Array.isArray(entry.products) && entry.products.length > 0
        ? entry.products.map((product) => ({
            ...defaultProduct,
            ...product,
            price:
              typeof product.price === "number" &&
              Number.isFinite(product.price)
                ? String(product.price)
                : "",
            quantityAvailable:
              typeof product.quantityAvailable === "number" &&
              Number.isFinite(product.quantityAvailable)
                ? String(product.quantityAvailable)
                : "",
            images: Array.isArray(product.images) ? product.images : [],
          }))
        : [{ ...defaultProduct }],
    );
  };

  const loadListing = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "getMyListing",
      });
      const currentListing = response.data?.listing || null;
      setListing(currentListing);
      populateForm(currentListing);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load your listing");
    } finally {
      setLoading(false);
    }
  }, [sagaApi]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  useEffect(() => {
    const removalTimers = removalTimersRef.current;
    const uploadTimers = uploadTimersRef.current;

    return () => {
      Object.values(removalTimers).forEach((timerId) => {
        clearTimeout(timerId);
      });
      Object.values(uploadTimers).forEach((timerId) => {
        clearTimeout(timerId);
      });

      Object.values(localPreviewByProduct)
        .flat()
        .forEach((preview) => {
          if (
            preview?.localUrl &&
            typeof URL !== "undefined" &&
            typeof URL.revokeObjectURL === "function" &&
            preview.localUrl.startsWith("blob:")
          ) {
            URL.revokeObjectURL(preview.localUrl);
          }
        });
    };
  }, [localPreviewByProduct]);

  const updateProduct = (index, key, value) => {
    setProducts((prev) => {
      const clone = [...prev];
      clone[index] = {
        ...clone[index],
        [key]: value,
      };
      return clone;
    });
  };

  const addProduct = () => {
    setProducts((prev) => [...prev, { ...defaultProduct }]);
  };

  const removeProduct = (index) => {
    setProducts((prev) => {
      if (prev.length === 1) {
        return [{ ...defaultProduct }];
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleImageUpload = async (productIndex, files) => {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;

    setError("");

    try {
      const currentImages = products[productIndex]?.images || [];
      if (currentImages.length + fileList.length > 3) {
        setError("Each product can have a maximum of 3 images");
        return;
      }

      for (const file of fileList) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          return;
        }
        if (file.size > 3 * 1024 * 1024) {
          setError("Each image must be 3MB or less");
          return;
        }
      }

      const localPreviewUrls = await Promise.all(
        fileList.map((file) => createLocalPreview(file)),
      );
      const localPreviews = localPreviewUrls
        .filter(Boolean)
        .map((localUrl) => ({ localUrl }));
      if (localPreviews.length) {
        setLocalPreviewByProduct((prev) => ({
          ...prev,
          [productIndex]: [...(prev[productIndex] || []), ...localPreviews],
        }));
      }

      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append("images", file);
      });

      setUploadStateByProduct((prev) => ({
        ...prev,
        [productIndex]: {
          status: "uploading",
          progress: 0,
          fileCount: fileList.length,
        },
      }));

      const response = await sagaApi({
        service: "userApi",
        method: "uploadListingImages",
        args: [
          formData,
          {
            onUploadProgress: (event) => {
              if (!event.total) return;
              const progress = Math.round((event.loaded * 100) / event.total);
              setUploadStateByProduct((prev) => ({
                ...prev,
                [productIndex]: {
                  ...(prev[productIndex] || {}),
                  status: "uploading",
                  progress,
                  fileCount: fileList.length,
                },
              }));
            },
          },
        ],
      });

      const uploaded = (response.data?.files || [])
        .map((file) => file.url)
        .filter(Boolean);

      updateProduct(productIndex, "images", [...currentImages, ...uploaded]);
      setUploadStateByProduct((prev) => ({
        ...prev,
        [productIndex]: {
          status: "done",
          progress: 100,
          fileCount: fileList.length,
        },
      }));

      setLocalPreviewByProduct((prev) => {
        const previews = prev[productIndex] || [];
        previews.forEach((preview) => {
          if (
            preview?.localUrl &&
            typeof URL !== "undefined" &&
            typeof URL.revokeObjectURL === "function" &&
            preview.localUrl.startsWith("blob:")
          ) {
            URL.revokeObjectURL(preview.localUrl);
          }
        });
        const next = { ...prev };
        delete next[productIndex];
        return next;
      });

      if (uploadTimersRef.current[productIndex]) {
        clearTimeout(uploadTimersRef.current[productIndex]);
      }
      uploadTimersRef.current[productIndex] = window.setTimeout(() => {
        setUploadStateByProduct((prev) => {
          const next = { ...prev };
          delete next[productIndex];
          return next;
        });
        delete uploadTimersRef.current[productIndex];
      }, 1200);
    } catch {
      setLocalPreviewByProduct((prev) => {
        const previews = prev[productIndex] || [];
        previews.forEach((preview) => {
          if (
            preview?.localUrl &&
            typeof URL !== "undefined" &&
            typeof URL.revokeObjectURL === "function" &&
            preview.localUrl.startsWith("blob:")
          ) {
            URL.revokeObjectURL(preview.localUrl);
          }
        });
        const next = { ...prev };
        delete next[productIndex];
        return next;
      });
      setUploadStateByProduct((prev) => {
        const next = { ...prev };
        delete next[productIndex];
        return next;
      });
      setError("Image upload failed");
    }
  };

  const removeImage = (productIndex, imageIndex) => {
    const imageUrl = products[productIndex]?.images?.[imageIndex];
    if (!imageUrl) return;

    setRemovingImageUrls((prev) =>
      prev.includes(imageUrl) ? prev : [...prev, imageUrl],
    );

    if (removalTimersRef.current[imageUrl]) {
      clearTimeout(removalTimersRef.current[imageUrl]);
    }

    removalTimersRef.current[imageUrl] = window.setTimeout(() => {
      setProducts((prev) => {
        const clone = [...prev];
        const targetProduct = clone[productIndex];
        if (!targetProduct) return prev;

        clone[productIndex] = {
          ...targetProduct,
          images: (targetProduct.images || []).filter(
            (url) => url !== imageUrl,
          ),
        };
        return clone;
      });

      setRemovingImageUrls((prev) => prev.filter((url) => url !== imageUrl));
      delete removalTimersRef.current[imageUrl];
    }, 240);
  };

  const buildPayload = () => {
    const sanitizedProducts = products
      .map((product) => ({
        name: String(product.name || "").trim(),
        description: String(product.description || "").trim(),
        category: String(product.category || "").trim(),
        unit: String(product.unit || "").trim(),
        price: Number(product.price) || 0,
        quantityAvailable: Number(product.quantityAvailable) || 0,
        currency: String(product.currency || "NGN")
          .trim()
          .toUpperCase(),
        images: Array.isArray(product.images)
          ? product.images.filter(Boolean).slice(0, 3)
          : [],
      }))
      .filter((product) => product.name);

    return {
      title: String(listing?.title || "").trim(),
      description: String(listing?.description || "").trim(),
      products: sanitizedProducts,
    };
  };

  const handleSave = async () => {
    const payload = buildPayload();
    if (!payload.products.length) {
      setError("Add at least one product with a name");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await sagaApi({
        service: "userApi",
        method: "updateMyListing",
        args: [listing._id, payload],
      });
      setSuccess("Products updated successfully");

      await loadListing();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save listing");
    } finally {
      setSaving(false);
    }
  };

  if (loading || subscriptionLoading) {
    return <p>Loading product manager...</p>;
  }

  if (!canManageListings) {
    return (
      <div className="listing-manager-shell">
        <h1>My Listing Products</h1>
        <p>You need an active subscription to manage listing products.</p>
      </div>
    );
  }

  if (!listing?._id) {
    return (
      <div className="listing-manager-shell">
        <h1>Step 2: Add Products</h1>
        <p className="listing-manager-subtitle">
          Complete listing setup first, then return here to upload products.
        </p>
        <button
          type="button"
          className="primary-inline-action"
          onClick={() => navigate("/my-listing")}
        >
          Go to Listing Setup
        </button>
      </div>
    );
  }

  return (
    <div className="listing-manager-shell">
      <h1>Step 2: Product Upload</h1>
      <p className="listing-manager-subtitle">
        Listing: <strong>{listing.title}</strong>. Add products with clear
        pricing, units, and images to improve buyer response.
      </p>

      {error && (
        <ErrorDisplay error={error} onRetry={loadListing} showDismiss={false} />
      )}
      {success && <p className="listing-success">{success}</p>}

      {listing && (
        <div className="listing-meta">
          <strong>Visibility:</strong> {listing.visibilityStatus}
          {listing.suspendedReason ? ` (${listing.suspendedReason})` : ""}
        </div>
      )}

      <div className="products-section">
        <div className="products-section-header">
          <h2>Products</h2>
          <button type="button" onClick={addProduct}>
            Add Product
          </button>
        </div>

        {products.map((product, index) => (
          <div className="product-card" key={`product-${index}`}>
            <div className="product-card-header">
              <h3>Product {index + 1}</h3>
              <button type="button" onClick={() => removeProduct(index)}>
                Remove
              </button>
            </div>

            <div className="product-form-grid">
              <label>
                Name
                <input
                  value={product.name}
                  onChange={(event) =>
                    updateProduct(index, "name", event.target.value)
                  }
                  placeholder="Product name"
                />
              </label>

              <label>
                Category
                <select
                  value={product.category}
                  onChange={(event) =>
                    updateProduct(index, "category", event.target.value)
                  }
                >
                  <option value="">Select category</option>
                  {AGRIC_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Price
                <input
                  type="number"
                  min="0"
                  value={product.price}
                  onChange={(event) =>
                    updateProduct(index, "price", event.target.value)
                  }
                  placeholder="0"
                />
              </label>

              <label>
                Quantity Available
                <input
                  type="number"
                  min="0"
                  value={product.quantityAvailable}
                  onChange={(event) =>
                    updateProduct(
                      index,
                      "quantityAvailable",
                      event.target.value,
                    )
                  }
                  placeholder="0"
                />
              </label>

              <label>
                Unit
                <select
                  value={product.unit}
                  onChange={(event) =>
                    updateProduct(index, "unit", event.target.value)
                  }
                >
                  <option value="">Select unit</option>
                  {PRODUCT_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Currency
                <select
                  value={product.currency}
                  onChange={(event) =>
                    updateProduct(index, "currency", event.target.value)
                  }
                >
                  {AFRICAN_CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="product-description-field">
                Description
                <textarea
                  value={product.description}
                  onChange={(event) =>
                    updateProduct(index, "description", event.target.value)
                  }
                  rows={2}
                  placeholder="Product details"
                />
              </label>

              <label>
                Pictures (max 3, instant preview)
                <input
                  className="hidden-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  id={`product-image-input-${index}`}
                  onChange={(event) => {
                    handleImageUpload(index, event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                className="image-upload-cta"
                onClick={() => {
                  const input = document.getElementById(
                    `product-image-input-${index}`,
                  );
                  input?.click();
                }}
              >
                Select Images
              </button>
            </div>

            {uploadStateByProduct[index] && (
              <div className="upload-progress-panel" aria-live="polite">
                <div className="upload-progress-header">
                  <span>
                    {uploadStateByProduct[index].status === "done"
                      ? `Uploaded ${uploadStateByProduct[index].fileCount} image${
                          uploadStateByProduct[index].fileCount === 1 ? "" : "s"
                        }`
                      : `Uploading ${uploadStateByProduct[index].fileCount} image${
                          uploadStateByProduct[index].fileCount === 1 ? "" : "s"
                        }`}
                  </span>
                  <strong>{uploadStateByProduct[index].progress}%</strong>
                </div>
                <div className="upload-progress-track">
                  <div
                    className="upload-progress-fill"
                    style={{
                      width: `${uploadStateByProduct[index].progress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="product-images-row">
              {(localPreviewByProduct[index] || []).map(
                (preview, previewIndex) => (
                  <div
                    className="product-image-tile pending-preview"
                    key={`${preview.localUrl}-${previewIndex}`}
                  >
                    <img
                      src={preview.localUrl}
                      alt={`Uploading preview ${previewIndex + 1}`}
                    />
                    <div className="thumbnail-removal-overlay">
                      Uploading...
                    </div>
                  </div>
                ),
              )}
              {(product.images || []).map((image, imageIndex) => (
                <div
                  className={`product-image-tile ${removingImageUrls.includes(image) ? "is-removing" : ""}`}
                  key={`${image}-${imageIndex}`}
                >
                  <img src={image} alt={`Product ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index, imageIndex)}
                    disabled={removingImageUrls.includes(image)}
                  >
                    {removingImageUrls.includes(image) ? "Removing" : "x"}
                  </button>
                  {removingImageUrls.includes(image) && (
                    <div className="thumbnail-removal-overlay">
                      Removing thumbnail...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="listing-actions">
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Products"}
        </button>
        <button type="button" onClick={() => navigate("/my-listing")}>
          Edit Listing Details
        </button>
      </div>

      <div className="products-preview">
        <div className="products-preview-header">
          <h2>Marketplace Preview</h2>
          <div className="preview-toggle-row">
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
          </div>
        </div>

        <div className={`preview-products ${viewMode}`}>
          {products
            .filter((item) => item.name)
            .map((item, index) => (
              <article
                className="preview-product-card"
                key={`preview-${index}`}
              >
                <div className="preview-image-wrap">
                  <img
                    src={
                      item.images?.[0] ||
                      "https://via.placeholder.com/420x240?text=No+Image"
                    }
                    alt={item.name}
                  />
                </div>
                <div className="preview-content">
                  <h3>{item.name}</h3>
                  <p>{item.description || "No product description yet."}</p>
                  <div className="preview-metadata">
                    <span>{item.category || "Category not set"}</span>
                    <span>
                      {item.price || "0"} {item.currency || "NGN"} /{" "}
                      {item.unit || "unit"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductListingManagerPage;
