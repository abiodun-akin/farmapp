import { useState } from "react";
import "./Footer.css";
import TextBoxWrapper from "./TextBoxWrapper";

const navItems = [
  {
    id: 1,
    label: "Home",
  },
  {
    id: 2,
    label: "About",
  },
  {
    id: 3,
    label: "Services",
  },
  {
    id: 4,
    label: "Products",
  },
  {
    id: 5,
    label: "Contact",
  },
];

function Footer() {
  const [fieldValue, setFieldValue] = useState("");
  const handleInputChange = (event) => {
    setFieldValue(event.target.value);
  };

  return (
    <div className="footer">
      <div>
        <TextBoxWrapper
          fieldType="text"
          fieldName="subscribe"
          fieldId="subscribe"
          placeholder="subscribe"
          value={fieldValue}
          onChange={handleInputChange}
        />
      </div>

      {fieldValue && <div>{fieldValue}</div>}

      <ul className="footerNav">
        {navItems.map((item) => (
          <li key={item.id}>
            <a href="#">{item.label}</a>
          </li>
        ))}
      </ul>
      <div>
        <TextBoxWrapper
          fieldType="text"
          fieldName="search"
          fieldId="search"
          className="search"
          placeholder="search"
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}

export default Footer;
