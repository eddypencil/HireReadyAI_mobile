export default function Input(props) {
  return (
    <input
      {...props}
      className={`w-full p-2 rounded border bg-dark-amethyst-900 text-white ${props.className || ""}`}
    />
  );
}
