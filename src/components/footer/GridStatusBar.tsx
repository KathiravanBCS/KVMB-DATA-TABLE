import type { CSSProperties, ReactNode } from 'react';
import type { DataGridStatusBar, DataGridStatusBarContext } from '../../core/grid.types';
import type { DataGridLabels } from '../../core/grid.defaults';

export interface GridStatusBarProps {
  config: DataGridStatusBar;
  labels: DataGridLabels;
  info: DataGridStatusBarContext;
  className?: string;
  style?: CSSProperties;
}

/** Slim bar under the rows. It sits outside the grid's scroll area, so it never changes the virtualized height. */
export function GridStatusBar({ config, labels, info, className, style }: GridStatusBarProps) {
  if (config === false) return null;
  let content: ReactNode;
  if (typeof config === 'function') {
    content = config(info);
  } else {
    const slots = config === true ? {} : config;
    const left = slots.left !== undefined ? slots.left : info.isVirtualized ? labels.statusScrollHint : null;
    const right = slots.right !== undefined ? slots.right : labels.statusRows(info.filteredRows);
    content = (
      <>
        <div className="mdg-statusbar-left">{left}</div>
        <div className="mdg-statusbar-right">{right}</div>
      </>
    );
  }
  return (
    <div className={className} style={style} data-custom={typeof config === 'function' || undefined}>
      {content}
    </div>
  );
}
