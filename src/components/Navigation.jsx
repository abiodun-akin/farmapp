import "./Navigation.css";

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
function NavigationComponent() {
  return (
    <>
      <ul className="navigation">
        {navItems.map((item) => (
          <li key={item.id}>
            <a href="#">{item.label}</a>
          </li>
        ))}
      </ul>
    </>
  );
}

export default NavigationComponent;
