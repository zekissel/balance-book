
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

