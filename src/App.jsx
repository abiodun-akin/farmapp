import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./index.css";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <Theme>
      <SignUpPage />
    </Theme>
  );
}

export default App;
