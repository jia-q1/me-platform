import type { Indicator } from '../data/types';
import { num } from '../lib/format';
import { Sparkline } from './charts';
import { StatusBadge, ValidationBadge } from './ui';

/**
 * One indicator: baseline / target / achieved, validation state, and optionally
 * the demographic breakdown and a trend line.
 */
export function IndicatorCard({ indicator: i, showDisaggregation = false, showTrend = false }: { indicator: Indicator; showDisaggregation?: boolean; showTrend?: boolean }) {
  return (
    <article className="panel indicator">
      <div className="ind-head">
        <div>
          <div className="eyebrow-sm">
            Indicator {i.code} · Global framework ref. {i.frameworkRef ?? '—'}
          </div>
          <h3 className="ind-title">{i.title}</h3>
        </div>
        <div className="ind-badges">
          {showTrend && <StatusBadge status={i.status} />}
          <ValidationBadge status={i.validation} />
        </div>
      </div>
      <div className="ind-body">
        <dl className="ind-nums">
          <div>
            <dt>Baseline</dt>
            <dd>{num(i.baseline)}</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd>{num(i.target)}</dd>
          </div>
          <div>
            <dt>Achieved</dt>
            <dd>{num(i.achieved)}</dd>
          </div>
        </dl>
        {showTrend && (
          <div className="ind-trend">
            <Sparkline values={i.trend} target={i.target} />
            <span className="note">Quarterly trend against target</span>
          </div>
        )}
      </div>
      {i.beneficiarySplit !== 'none' && (
        <dl className="disagg">
          <div>
            <dt>{i.beneficiarySplit === 'direct-only' ? 'Direct only' : 'Direct'}</dt>
            <dd>{num(i.direct)}</dd>
          </div>
          {i.beneficiarySplit === 'direct-indirect' && (
            <div>
              <dt>Indirect</dt>
              <dd>{num(i.indirect)}</dd>
            </div>
          )}
        </dl>
      )}
      {showDisaggregation && i.disaggregation && (
        <dl className="disagg">
          {(
            [
              ['Female', i.disaggregation.women],
              ['Male', i.disaggregation.men],
              ['Youth', i.disaggregation.youth],
            ] as const
          ).map(([label, v]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{num(v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}
