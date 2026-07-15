interface Props {
  readonly values: readonly number[];
  readonly highlightedIndices?: readonly number[];
}

export function ArrayVisualizer({
  values,
  highlightedIndices = []
}: Props) {
  const highlighted = new Set(highlightedIndices);

  return (
    <div className="array">
      {values.map((value, index) => (
        <div
          className={
            highlighted.has(index) ? "cell cell--highlighted" : "cell"
          }
          key={index}
        >
          <small>{index}</small>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
