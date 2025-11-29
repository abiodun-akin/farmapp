import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../redux/slices/toastSlice";
import { Flex, Text } from "@radix-ui/themes";

const Toast = () => {
  const { toasts } = useSelector((state) => state.toast);
  const dispatch = useDispatch();

  const getColor = (type) => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      default:
        return "#3b82f6";
    }
  };

  return (
    <Flex
      direction="column"
      gap="2"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
      }}
    >
      {toasts.map((toast) => (
        <Flex
          key={toast.id}
          align="center"
          gap="3"
          p="4"
          style={{
            backgroundColor: getColor(toast.type),
            color: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            minWidth: "300px",
          }}
        >
          <Text size="3" style={{ flex: 1 }}>
            {toast.message}
          </Text>
          <button
            onClick={() => dispatch(removeToast(toast.id))}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ×
          </button>
        </Flex>
      ))}
    </Flex>
  );
};

export default Toast;
