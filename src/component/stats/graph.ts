
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