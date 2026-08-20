import { LiquidBars } from './Infographic';

export function ResponsiveChart(props: {
  series: readonly { label: string; value: number }[];
}) {
  return <LiquidBars series={props.series.slice(0, 8)} />;
}
