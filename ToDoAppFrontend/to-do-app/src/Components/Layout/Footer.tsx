
const Footer = () => {
  return (
    <footer
      className="text-white py-4"
      style={{
        backgroundColor: "#2a1a3a", // Dark theme, inspired by #51285f
        textAlign: "center",
      }}
    >
      <div className="container">
        <p className="mb-0" style={{ fontSize: "1rem", fontWeight: "400" }}>
          Developed by Dušan Milojković for Diligent
        </p>
      </div>
    </footer>
  );
};

export default Footer;
