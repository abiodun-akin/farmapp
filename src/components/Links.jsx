import "./Links.css";
import LogoComponent from "./Logo";

const linkItems = [
  {
    label: "Home",
    url: "#",
    isActive: true,
  },
  {
    label: "About",
    url: "#",
    isActive: false,
  },
  {
    label: "Contact",
    url: "#",
    isActive: false,
  },
];

function LinksComponent() {
  return (
    <div className="Links">
      <LogoComponent />
      {linkItems.map((item) => (
        <a
          key={item.label}
          href={item.url}
          className="LinkItem"
          title={item.label}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}

export default LinksComponent;
