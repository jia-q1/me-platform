/**
 * List / map switch. The Mural shows a toggle on every "M&E by …" screen; this is
 * our reading of it. Easy to repurpose if it was meant for something else.
 */
export function ViewToggle({ value, onChange }: { value: 'list' | 'map'; onChange: (v: 'list' | 'map') => void }) {
  return (
    <div className="seg" role="group" aria-label="View">
      {(['list', 'map'] as const).map((v) => (
        <button key={v} type="button" aria-pressed={value === v} className={value === v ? 'seg-on' : undefined} onClick={() => onChange(v)}>
          {v === 'list' ? 'List' : 'Map'}
        </button>
      ))}
    </div>
  );
}
