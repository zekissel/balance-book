import ReactECharts from 'echarts-for-react';

const option = {
	graphic: {
		elements: [
			{
				type: 'text',
				left: 'center',
				top: 'center',
				style: {
					text: 'Balance Book',
					fontSize: 80,
					fontWeight: 'bold',
					lineDash: [0, 200],
					lineDashOffset: 0,
					fill: 'transparent',
					stroke: '#739d88',
					lineWidth: 2,
				},
				keyframeAnimation: {
					duration: 2800,
					loop: false,
					keyframes: [
						{
							percent: 0.7,
							style: { fill: 'transparent', lineDashOffset: 200, lineDash: [200, 0] },
						},
						{ percent: 0.3, style: { fill: 'transparent' } },
						{ percent: 1.0, style: { fill: '#86B59D' } },
					],
				},
			},
		],
	},
};

export default function Logo() {
	return (
		<div className="logo">
			<ReactECharts option={option} />
		</div>
	);
}
