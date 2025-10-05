import "./TextBoxWrapper.css";

function TextBoxWrapper({
  fieldType,
  fieldName,
  fieldId,
  handleChange,
  ...props
}) {
  return (
    <div>
      <input type={fieldType} name={fieldName} id={fieldId} {...props} />
    </div>
  );
}

export default TextBoxWrapper;
