import ReactECharts from 'echarts-for-react';
import { useState } from 'react';

type ChartOption = {
  title: { text: string; };
  height: { small?: boolean };
  width: { decrPercent?: number };
  color: number[];
  grid: { show: boolean; left: number; };
  
  xAxis: { type: string; interval: number; data: { value: string; label: { show: boolean; }; }[]; splitLine: { show: boolean; }; };
  yAxis: { type: string; splitLine: { show: boolean; }; };
  series: { type: string; data: { value: number; itemStyle: { color: number; }; label: { show: boolean; position: string; formatter: string; }; }[]; }[];

  tooltip: { trigger: string; axisPointer: { type: string }; formatter: string; };
  dataZoom?: { type: string; };
};
interface ChartBaseProps { modify: ChartOption }
export default function ChartBase({ modify }: ChartBaseProps) {

  const [isFull, setisFull] = useState(false);
	const toggleFull = () => setisFull(!isFull);

  const option = {
    title: {
			text: modify.title.text,
			top: isFull ? 15 : 0,
      left: isFull ? 'center' : 'left',
      textStyle: {
				color: isFull ? '#fff' : '#494949',
				fontSize: isFull ? 24 : 18,
			},
		},
    height: isFull ? '70%' : (modify.height.small === true ? '73%' : '78%'),
		width: isFull ? '75%' : ( modify.width.decrPercent !== undefined ? `${92 - modify.width.decrPercent}%` : `92%` ),
    color: modify.color.map((c) => (c !== 0 ? (c > 0 ? (isFull ? `#99deb5` : `#739d88`) : (isFull ? `#f6d6aa` : `#d8aa69`)) : `#abc`)),
    grid: {
      show: modify.grid.show,
      top: isFull ? '15%' :'13%',
      left: isFull ? '15%' : modify.grid.left,
    },
    
		xAxis: {
      type: modify.xAxis.type,
      axisLine: { lineStyle: { color: isFull ? '#ffffff77' : '#ffffff' } },
      interval: modify.xAxis.interval,
			data: modify.xAxis.data,
			axisLabel: {
				rotate: 20,
        color: isFull ? `#fff` : `#333`,
        fontSize: isFull ? 16 : 12,
        textBorderColor: isFull ? '#000' : '#fff',
        textBorderType: 'solid',
        textBorderWidth: 1,
			},
			splitLine: { show: modify.xAxis.splitLine.show, lineStyle: { color: isFull ? '#ffffff77' : '#ffffff' } },
		},
		yAxis: {
			type: 'value',
			splitLine: { show: modify.yAxis.splitLine.show, lineStyle: { color: isFull ? '#ffffff77' : '#ffffff' } },
      axisLabel: {
        color: isFull ? `#fff` : `#333`,
        fontSize: isFull ? 16 : 12,
      },
		},
		series: modify.series.map((s) => {
      return new Object({
        type: s.type,
        data: s.data.map((d) => {
          return new Object({
            value: d.value,
            itemStyle: { color: d.itemStyle.color !== 0 ? (d.itemStyle.color > 0 ? (isFull ? `#99deb5` : `#739d88`) : (isFull ? `#f6d6aa` : `#d8aa69`)) : `#abc` },
            label: {
              show: d.label.show/*range >= 24 ? (i % 2 == 0 && t.total !== 0) : (t.total !== 0)*/,
              position: d.label.position,
              formatter: d.label.formatter,
              color: isFull ? `#fff` : `#333`,
              textBorderColor: isFull ? '#000' : '#fff',
              textBorderType: 'solid',
              textBorderWidth: 1,
              fontSize: isFull ? 16 : 12,
            },
          });
        }),
      })
    }),

    dataZoom: { type: 'inside' },
		tooltip: {
			trigger: modify.tooltip.trigger,
			axisPointer: { type: modify.tooltip.axisPointer.type },
			formatter: modify.tooltip.formatter,
		},
	};

  return (
    <>
      { // add overlay for close
        // placeholder so graph icon/button stays in same spot
        isFull && (
          <div className="stats-graph">
            
          </div>
        )
      }

      <div className={"stats-graph" + (isFull ? ' graph-fullscreen' : '')} onDoubleClick={toggleFull}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </>
  );
}