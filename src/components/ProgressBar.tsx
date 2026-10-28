type Props = {
  done: number;
  total: number;
  label: string;
};

export function ProgressBar({ done, total, label }: Props) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="progress">
      <div className="progress-head">
        <span>{label}</span>
        <span className="muted">
          {done}/{total} done
        </span>
      </div>
      <div className="bar-track">
        <div className={`bar-fill${total && done === total ? " full" : ""}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
