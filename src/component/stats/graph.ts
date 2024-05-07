
export const titleOptions = (title: string, full: boolean) => {
  return new Object({
			text: title,
			top: full ? 15 : 0,
      left: full ? 'center' : 'left',
      textStyle: {
				color: full ? '#fff' : '#494949',
				fontSize: full ? 24 : 18,
			},
	});
}


export const xAxisOptions = (data: any, full: boolean, hide: boolean, showSplit: boolean, interval?: number, rotate?: number) => {
  return new Object({
    axisLine: { lineStyle: { color: full ? '#ffffff77' : '#ffffff', width: 2 } },
    type: 'category',
    data: data,
    axisLabel: {
      show: hide,
      rotate: rotate,
      interval: interval,
      color: full ? `#fff` : `#333`,
      fontSize: full ? 16 : 12,
    },
    splitLine: { show: showSplit, lineStyle: { color: full ? '#ffffff77' : '#ffffff99' } },
  });
}

export const yAxisOptions = (full: boolean) => {
  return new Object({
    type: 'value',
    splitLine: { show: true, lineStyle: { color: full ? '#ffffff77' : '#ffffff99' } },
    axisLabel: {
      color: full ? `#fff` : `#333`,
      fontSize: full ? 16 : 12,
    },
  });
}

export function generateChartColor(index: number, isIncome: boolean) {
	const incomeColors = ['#739d88', '#86C4A5', '#9CFACB', '#BADACA', '#50A47A', '#42C483'];
	const expenseColors = ['#f6d6aa', '#D8AA69', '#AB8755', '#E8AD5A', '#DAC25F', '#FADC65'];
	return isIncome
		? incomeColors[index % incomeColors.length]
		: expenseColors[index % expenseColors.length];
}
